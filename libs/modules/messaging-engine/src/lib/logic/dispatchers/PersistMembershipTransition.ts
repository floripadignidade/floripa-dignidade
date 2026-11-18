/**
 * @file libs/modules/messaging-engine/src/lib/logic/dispatchers/PersistMembershipTransition.ts
 * @section Messaging Logic - Membership Persistence Dispatcher (Atom)
 * @description Átomo encargado de la transmisión HTTP POST/Upsert hacia la tabla
 * `group_memberships_ledger` en Supabase PostgREST bajo transporte HTTPS (ADR 0015),
 * timeout SRE (`AbortSignal.timeout`), normalización de errores y telemetría forense.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { IPrimaryDatabaseHeadersResult } from './CreateSovereignDatabaseHeaders';

const DISPATCHER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'MEMBERSHIP_PERSISTENCE_DISPATCHER',
);
const TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_MEMBERSHIP_CLOUD_UPSERT',
);
const SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MEMBERSHIP_CLOUD_UPSERT_SUCCESS',
);
const VALIDATION_WARNING_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MEMBERSHIP_PERSISTENCE_INPUT_INVALID',
);
const FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MEMBERSHIP_CLOUD_UPSERT_FAULT',
);
const LEDGER_TABLE_NAME_LITERAL = 'group_memberships_ledger';
const REQUEST_TIMEOUT_IN_MILLISECONDS_QUANTITY = 10_000;
const MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY = 256;

const PersistMembershipInputSchema = z
  .object({
    cloudUrlLiteral: z
      .string()
      .trim()
      .url({ message: 'INVALID_MEMBERSHIP_CLOUD_ENDPOINT_URL' })
      .refine((urlLiteral: string): boolean => urlLiteral.startsWith('https://'), {
        message: 'MEMBERSHIP_PERSISTENCE_REQUIRES_HTTPS_TLS',
      }),
    securityHeaders: z
      .object({
        'Content-Type': z.string().min(1),
        apikey: z.string().min(10),
        Authorization: z.string().min(10),
        Prefer: z.string().min(1),
      })
      .readonly(),
    membershipPayload: z
      .record(z.string(), z.unknown())
      .refine((payloadSnapshot) => Object.keys(payloadSnapshot).length > 0, {
        message: 'EMPTY_MEMBERSHIP_PAYLOAD_PROHIBITED',
      })
      .readonly(),
  })
  .readonly();

const resolveSafeCorrelationIdentifier = (
  membershipPayload: Readonly<Record<string, unknown>>,
  correlationIdentifierFallback: string | undefined,
): CorrelationIdentifier => {
  const rawCandidate =
    correlationIdentifierFallback ??
    (typeof membershipPayload?.['last_action_correlation_id'] === 'string'
      ? membershipPayload['last_action_correlation_id']
      : undefined);
  const validationResult = CorrelationIdentifierSchema.safeParse(rawCandidate);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const buildIdempotentUpsertHeaders = (
  securityHeaders: IPrimaryDatabaseHeadersResult,
): IPrimaryDatabaseHeadersResult => {
  const hasMergeDuplicatesDirectiveBoolean = securityHeaders.Prefer.includes(
    'resolution=merge-duplicates',
  );
  const resolvedPreferLiteral = hasMergeDuplicatesDirectiveBoolean
    ? securityHeaders.Prefer
    : `${securityHeaders.Prefer}, resolution=merge-duplicates`;

  return Object.freeze({
    ...securityHeaders,
    Prefer: resolvedPreferLiteral,
  });
};

const normalizePersistenceError = (
  caughtExecutionError: unknown,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) {
    return caughtExecutionError;
  }

  const isTimeoutErrorBoolean =
    caughtExecutionError instanceof Error &&
    (caughtExecutionError.name === 'TimeoutError' || caughtExecutionError.name === 'AbortError');
  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  return MapHttpErrorToException(
    isTimeoutErrorBoolean ? 504 : 500,
    isTimeoutErrorBoolean
      ? 'MEMBERSHIP_PERSISTENCE_TIMEOUT'
      : 'FALLO_FISICO_PERSISTENCIA_MEMBRESIA',
    {
      originalErrorLiteral: errorDescriptionLiteral,
      targetTableLiteral: LEDGER_TABLE_NAME_LITERAL,
      correlationIdentifier,
    },
  );
};

const executeMembershipUpsertFetch = async (
  normalizedBaseUrlLiteral: string,
  upsertHeadersSnapshot: IPrimaryDatabaseHeadersResult,
  membershipPayload: Readonly<Record<string, unknown>>,
  correlationIdentifier: CorrelationIdentifier,
): Promise<void> => {
  const targetEndpointLiteral = `${normalizedBaseUrlLiteral}/rest/v1/${LEDGER_TABLE_NAME_LITERAL}`;
  const outgoingResponse = await fetch(targetEndpointLiteral, {
    method: 'POST',
    headers: { ...upsertHeadersSnapshot },
    body: JSON.stringify(membershipPayload),
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_IN_MILLISECONDS_QUANTITY),
  });

  if (!outgoingResponse.ok) {
    const rawErrorSnippetLiteral = await outgoingResponse
      .text()
      .then((textLiteral) => textLiteral.slice(0, MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY))
      .catch(() => '');

    throw MapHttpErrorToException(
      outgoingResponse.status,
      'MEMBERSHIP_LEDGER_PERSISTENCE_REJECTED',
      {
        httpStatusNumeric: outgoingResponse.status,
        statusTextLiteral: outgoingResponse.statusText,
        targetTableLiteral: LEDGER_TABLE_NAME_LITERAL,
        correlationIdentifier,
        ...(rawErrorSnippetLiteral.length > 0 && { rawErrorSnippetLiteral }),
      },
    );
  }
};

/**
 * Ejecuta la transacción HTTP de upsert sobre `group_memberships_ledger` en Supabase.
 *
 * @param cloudUrl - URL base HTTPS del proyecto Supabase (`SUPABASE_URL`).
 * @param securityHeaders - Cabeceras de autorización construidas para PostgREST.
 * @param membershipPayload - Registro inmutable mapeado para `group_memberships_ledger`.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad.
 * @returns {Promise<void>} Resuelve cuando Supabase confirma el upsert.
 * @throws {ValidationException} Si la URL, cabeceras o carga útil son inválidas.
 * @throws {GlobalBaseException} Si falla la red, expira el timeout o Supabase rechaza.
 */
export const PersistMembershipTransition = async (
  cloudUrl: string,
  securityHeaders: IPrimaryDatabaseHeadersResult,
  membershipPayload: Readonly<Record<string, unknown>>,
  correlationIdentifierFallback?: string,
): Promise<void> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    membershipPayload,
    correlationIdentifierFallback,
  );

  return await TraceExecutionTime(
    DISPATCHER_MODULE_IDENTIFIER,
    TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const validationResult = PersistMembershipInputSchema.safeParse({
        cloudUrlLiteral: cloudUrl,
        securityHeaders,
        membershipPayload,
      });

      if (!validationResult.success) {
        const invalidFieldsCollection = Object.keys(validationResult.error.flatten().fieldErrors);
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: DISPATCHER_MODULE_IDENTIFIER,
          operationCodeLiteral: VALIDATION_WARNING_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Parámetros de persistencia de membresía rechazados en frontera.',
          semanticIntentTag: 'MEMBERSHIP_PERSISTENCE_VALIDATION_WARNING',
          contextMetadataSnapshot: Object.freeze({ invalidFieldsCollection }),
        });

        const validationException = new ValidationException(
          'PARAMETROS_PERSISTENCIA_MEMBRESIA_INVALIDOS',
          { invalidFieldsCollection, correlationIdentifier },
        );
        ReportForensicException(validationException, correlationIdentifier);
        throw validationException;
      }

      const validatedData = validationResult.data;
      const normalizedBaseUrlLiteral = validatedData.cloudUrlLiteral.replace(/\/+$/, '');
      const upsertHeadersSnapshot = buildIdempotentUpsertHeaders(validatedData.securityHeaders);

      try {
        await executeMembershipUpsertFetch(
          normalizedBaseUrlLiteral,
          upsertHeadersSnapshot,
          validatedData.membershipPayload,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: DISPATCHER_MODULE_IDENTIFIER,
          operationCodeLiteral: SUCCESS_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Transición de membresía persistida en Supabase.',
          semanticIntentTag: 'MEMBERSHIP_LEDGER_UPSERT_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            targetTableLiteral: LEDGER_TABLE_NAME_LITERAL,
            preferHeaderLiteral: upsertHeadersSnapshot.Prefer,
          }),
        });
      } catch (caughtExecutionError: unknown) {
        const normalizedException = normalizePersistenceError(
          caughtExecutionError,
          correlationIdentifier,
        );
        const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: DISPATCHER_MODULE_IDENTIFIER,
          operationCodeLiteral: FAILURE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Error al persistir transición de membresía en Supabase.',
          semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: Object.freeze({
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
            targetTableLiteral: LEDGER_TABLE_NAME_LITERAL,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
