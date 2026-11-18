/**
 * @file libs/modules/messaging-engine/src/lib/logic/mutators/UpdateUserPresence.ts
 * @section Messaging Logic - User Presence Heartbeat Mutator (Orchestrator)
 * @description Orquestador encargado de validar el pulso de presencia ciudadana,
 * resolver las credenciales de infraestructura, mapear al esquema físico del Ledger y
 * ejecutar un upsert idempotente en `user_presence_ledger` con trazabilidad SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { type IUserPresence, UserPresenceSchema } from '../../schemas/UserPresence.schema';
import { CreatePrimaryDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders';
import { MapPresenceToLedgerSnapshot } from '../mappers/MapPresenceToLedgerSnapshot';

const PRESENCE_MUTATOR_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'CITIZEN_PRESENCE_HEARTBEAT_MUTATOR',
);

const TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_PRESENCE_HEARTBEAT_ORCHESTRATION',
);

const HEARTBEAT_NOMINAL_CODE: OperationCode = OperationCodeSchema.parse('HEARTBEAT_SYNC_NOMINAL');
const PRESENCE_COLLAPSE_CODE: OperationCode = OperationCodeSchema.parse('PRESENCE_SYNC_COLLAPSE');
const PRESENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

const executePresenceUpsertRequest = async (
  supabaseBaseUrlLiteral: string,
  serviceRoleKeySecret: string,
  validatedPresenceData: IUserPresence,
  correlationIdentifier: CorrelationIdentifier,
): Promise<void> => {
  const normalizedBaseUrlLiteral = supabaseBaseUrlLiteral.trim().replace(/\/+$/, '');
  const ledgerPayloadSnapshot = MapPresenceToLedgerSnapshot(
    validatedPresenceData,
    correlationIdentifier,
  );

  const cloudPersistenceResponse = await fetch(
    `${normalizedBaseUrlLiteral}/rest/v1/user_presence_ledger`,
    {
      method: 'POST',
      headers: {
        ...CreatePrimaryDatabaseHeaders(serviceRoleKeySecret, 'minimal'),
        Prefer: 'return=minimal, resolution=merge-duplicates',
      },
      body: JSON.stringify(ledgerPayloadSnapshot),
      signal: AbortSignal.timeout(PRESENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    },
  );

  if (!cloudPersistenceResponse.ok) {
    throw MapHttpErrorToException(
      cloudPersistenceResponse.status,
      'CLOUD_LEDGER_PRESENCE_UPSERT_REJECTED',
      {
        httpStatusNumeric: cloudPersistenceResponse.status,
        correlationIdentifier,
      },
    );
  }
};

const normalizePresenceMutationError = (
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
      ? 'PRESENCE_LEDGER_SYNC_TIMEOUT'
      : 'FALLO_EN_SINCRONIZACION_DE_PRESENCIA_SRE',
    {
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    },
  );
};

/**
 * Ejecuta la actualización idempotente del estado de presencia ciudadana en Supabase.
 *
 * @param unvalidatedPayloadSnapshot - Datos crudos provenientes del sensor de presencia.
 * @returns {Promise<boolean>} Verdadero cuando el upsert fue confirmado por PostgREST.
 * @throws {ValidationException} Si el payload incumple `UserPresenceSchema`.
 * @throws {GlobalBaseException} Si falla la infraestructura o la persistencia en red.
 */
export const UpdateUserPresence = async (unvalidatedPayloadSnapshot: unknown): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PRESENCE_MUTATOR_IDENTIFIER,
    TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<boolean> => {
      try {
        const validationResult = UserPresenceSchema.safeParse(unvalidatedPayloadSnapshot);
        if (!validationResult.success) {
          throw new ValidationException('PRESENCE_DNA_VIOLATION', {
            structuralIssuesCollection: validationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedPresenceData = validationResult.data;
        const {
          SUPABASE_URL: supabaseBaseUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: serviceRoleKeySecret,
        } = await ValidateEnvironmentContract();

        await executePresenceUpsertRequest(
          supabaseBaseUrlLiteral,
          serviceRoleKeySecret,
          validatedPresenceData,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: HEARTBEAT_NOMINAL_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Pulso de presencia sincronizado exitosamente en el Ledger.',
          semanticIntentTag: 'CITIZEN_HEARTBEAT_SYNC',
          contextMetadataSnapshot: Object.freeze({
            citizenIdentifier: validatedPresenceData.citizenIdentifier,
            availabilityStatusLiteral: validatedPresenceData.currentAvailabilityStatus,
          }),
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        const normalizedException = normalizePresenceMutationError(
          caughtExecutionError,
          correlationIdentifier,
        );
        const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: PRESENCE_MUTATOR_IDENTIFIER,
          operationCodeLiteral: PRESENCE_COLLAPSE_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Fallo durante la sincronización del pulso de presencia.',
          semanticIntentTag: isClientFaultBoolean
            ? 'PRESENCE_VALIDATION_WARNING'
            : 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: Object.freeze({
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
