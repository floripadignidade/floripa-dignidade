/**
 * @file libs/modules/messaging-engine/src/lib/logic/mutators/ManageGroupMembership.ts
 * @section Messaging Logic - Group Membership Mutator (Orchestrator)
 * @description Orquestador encargado de validar la transición de membresía ciudadana
 * (`JOIN` / `LEAVE`), resolver credenciales vía `@floripa-dignidade/environment-validator`,
 * ejecutar un upsert idempotente en `group_memberships_ledger` y emitir telemetría SRE
 * conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
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

import {
  CreatePrimaryDatabaseHeaders,
  type IPrimaryDatabaseHeadersResult,
} from '../dispatchers/CreateSovereignDatabaseHeaders';
import { PersistMembershipTransition } from '../dispatchers/PersistMembershipTransition';

const MEMBERSHIP_ORCHESTRATOR_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'GROUP_MEMBERSHIP_ORCHESTRATOR',
);
const TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_MEMBERSHIP_TRANSITION_FLOW',
);
const FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MEMBERSHIP_ORCHESTRATION_COLLAPSE',
);

const MembershipActionSchema = z
  .object({
    groupIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'GROUP_IDENTIFIER_MUST_BE_UUID_V4' })
      .describe('Identificador UUID del grupo de comunicación objetivo.'),
    citizenIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'CITIZEN_IDENTIFIER_MUST_BE_UUID_V4' })
      .describe('Identificador UUID del ciudadano solicitante.'),
    membershipActionLiteral: z
      .enum(['JOIN', 'LEAVE'])
      .describe('Transición solicitada sobre la membresía en el grupo.'),
  })
  .readonly();

type TMembershipActionPayload = z.infer<typeof MembershipActionSchema>;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const validateMembershipActionRequest = (
  unvalidatedRequestSnapshot: unknown,
  correlationIdentifier: CorrelationIdentifier,
): TMembershipActionPayload => {
  const validationResult = MembershipActionSchema.safeParse(unvalidatedRequestSnapshot);
  if (!validationResult.success) {
    throw new ValidationException('DATOS_DE_MEMBRESIA_INVALIDOS', {
      issuesCollection: validationResult.error.flatten(),
      correlationIdentifier,
    });
  }
  return validationResult.data;
};

const persistMembershipUpsertAction = async (
  validatedRequest: TMembershipActionPayload,
  targetStatusLiteral: 'ACTIVE' | 'LEFT_INACTIVE',
  correlationIdentifier: CorrelationIdentifier,
): Promise<void> => {
  const { SUPABASE_URL: rawSupabaseUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
    await ValidateEnvironmentContract();

  const normalizedSupabaseUrlLiteral = rawSupabaseUrlLiteral.trim().replace(/\/+$/, '');
  const upsertDatabaseHeadersSnapshot: IPrimaryDatabaseHeadersResult = Object.freeze({
    ...CreatePrimaryDatabaseHeaders(cloudSecurityKeySecret, 'minimal'),
    Prefer: 'return=minimal, resolution=merge-duplicates',
  });

  await PersistMembershipTransition(normalizedSupabaseUrlLiteral, upsertDatabaseHeadersSnapshot, {
    group_id: validatedRequest.groupIdentifier,
    citizen_id: validatedRequest.citizenIdentifier,
    membership_status: targetStatusLiteral,
    last_action_correlation_id: correlationIdentifier,
    updated_at: new Date().toISOString(),
  });
};

const normalizeMembershipError = (
  caughtExecutionError: unknown,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) {
    return caughtExecutionError;
  }

  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  return MapHttpErrorToException(500, 'FALLO_EN_ORQUESTACION_DE_MEMBRESIA_SRE', {
    originalErrorLiteral: errorDescriptionLiteral,
    correlationIdentifier,
  });
};

/**
 * Gestiona de forma idempotente la vinculación o salida de un ciudadano en un grupo.
 *
 * @param unvalidatedRequestSnapshot - Carga útil con grupo, ciudadano y transición.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad.
 * @returns {Promise<boolean>} Verdadero tras confirmar el upsert en Supabase.
 * @throws {ValidationException} Si la carga útil incumple `MembershipActionSchema`.
 * @throws {GlobalBaseException} Si falla la configuración de entorno o la persistencia.
 */
export const ManageGroupMembership = async (
  unvalidatedRequestSnapshot: unknown,
  correlationIdentifierFallback?: string,
): Promise<boolean> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
    TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<boolean> => {
      try {
        const validatedRequest = validateMembershipActionRequest(
          unvalidatedRequestSnapshot,
          correlationIdentifier,
        );
        const isJoiningActionBoolean = validatedRequest.membershipActionLiteral === 'JOIN';
        const targetStatusLiteral = isJoiningActionBoolean ? 'ACTIVE' : 'LEFT_INACTIVE';

        await persistMembershipUpsertAction(
          validatedRequest,
          targetStatusLiteral,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: OperationCodeSchema.parse(
            `MEMBERSHIP_${validatedRequest.membershipActionLiteral}_SUCCESS`,
          ),
          correlationIdentifier,
          messageContentLiteral:
            'Membresía grupal actualizada exitosamente: ' +
            `[${validatedRequest.membershipActionLiteral}].`,
          semanticIntentTag: 'COMMUNITY_MEMBERSHIP_TRANSITION',
          contextMetadataSnapshot: Object.freeze({
            groupIdentifier: validatedRequest.groupIdentifier,
            citizenIdentifier: validatedRequest.citizenIdentifier,
            targetStatusLiteral,
          }),
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        const normalizedException = normalizeMembershipError(
          caughtExecutionError,
          correlationIdentifier,
        );
        const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: FAILURE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo durante la transición de membresía en el círculo de comunicación.',
          semanticIntentTag: isClientFaultBoolean
            ? 'MEMBERSHIP_VALIDATION_WARNING'
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
