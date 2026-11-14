/**
 * @section User Management and Identity - Administrative Authority Validator (Atom)
 * @description Componente de seguridad encargado de validar la activación de privilegios
 * administrativos de infraestructura mediante comparación HMAC-SHA256 en tiempo constante
 * (`timingSafeEqual`), mitigando ataques de temporización, validando contratos con Zod y
 * emitiendo trazabilidad forense SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHmac, timingSafeEqual } from 'node:crypto';

import {
  type IValidateAdministrativeAuthorityParameters,
  ValidateAdministrativeAuthoritySchema,
} from '@floripa-dignidade/contracts';
import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import { GlobalBaseException, ValidationException } from '@floripa-dignidade/exceptions';
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
  type SeverityLevel,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

const SECURITY_GUARD_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'INFRASTRUCTURE_ADMIN_GATEKEEPER',
);

const CHALLENGE_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_ADMIN_CHALLENGE_VALIDATION',
);

const TOKEN_MALFORMED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ADMIN_SECURITY_TOKEN_MALFORMED',
);

const BYPASS_REJECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ADMIN_BYPASS_ATTEMPT_REJECTED',
);

const AUTHORITY_ACTIVATED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ADMIN_AUTHORITY_ACTIVATED',
);

const CRYPTOGRAPHIC_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CRYPTOGRAPHIC_PROCESS_FAULT',
);

interface IEmitAdministrativeSignalParameters {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
  readonly contextMetadataSnapshot?: Readonly<Record<string, unknown>>;
}

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const emitAdministrativeVerificationSignalAction = (
  parametersSnapshot: IEmitAdministrativeSignalParameters,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: parametersSnapshot.severityLevelLiteral,
    moduleIdentifierLiteral: SECURITY_GUARD_MODULE_IDENTIFIER,
    operationCodeLiteral: parametersSnapshot.operationCodeLiteral,
    correlationIdentifier: parametersSnapshot.correlationIdentifier,
    messageContentLiteral: parametersSnapshot.messageContentLiteral,
    semanticIntentTag: parametersSnapshot.semanticIntentTag,
    ...(parametersSnapshot.contextMetadataSnapshot !== undefined && {
      contextMetadataSnapshot: Object.freeze({ ...parametersSnapshot.contextMetadataSnapshot }),
    }),
  });
};

/**
 * Evalúa si el token de desafío administrativo coincide en tiempo constante con el secreto maestro.
 *
 * @param parametersSnapshot - Snapshot inmutable que contiene el token administrativo suministrado.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para enlazar trazabilidad.
 * @returns {Promise<boolean>} Verdadero si la firma HMAC-SHA256 coincide exactamente.
 * @throws {ValidationException} Si el token no cumple la entropía mínima definida en el contrato.
 * @throws {GlobalBaseException} Si falla la resolución de secretos de entorno en `ValidateEnvironmentContract`.
 */
export const ValidateInfrastructureAdministrativeAuthority = async (
  parametersSnapshot: IValidateAdministrativeAuthorityParameters,
  correlationIdentifierFallback?: string,
): Promise<boolean> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    SECURITY_GUARD_MODULE_IDENTIFIER,
    CHALLENGE_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<boolean> => {
      const validationResult = ValidateAdministrativeAuthoritySchema.safeParse(parametersSnapshot);

      if (!validationResult.success) {
        const validationIssuesCollection = validationResult.error.flatten();

        emitAdministrativeVerificationSignalAction({
          severityLevelLiteral: 'WARNING',
          operationCodeLiteral: TOKEN_MALFORMED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Desafío administrativo rechazado por incumplir la entropía mínima requerida.',
          semanticIntentTag: 'SECURITY_TOKEN_FORMAT_VIOLATION',
          contextMetadataSnapshot: { validationIssuesCollection },
        });

        const validationException = new ValidationException('ADMIN_SECURITY_TOKEN_MALFORMED', {
          validationIssuesCollection,
          correlationIdentifier,
        });

        ReportForensicException(validationException, correlationIdentifier);
        throw validationException;
      }

      const infrastructureSecretsSnapshot = await ValidateEnvironmentContract();
      const {
        PAYLOAD_SECRET: cryptographicSaltSecret,
        SOVEREIGN_EMERGENCY_TOKEN: administrativeMasterTokenSecret,
      } = infrastructureSecretsSnapshot;

      try {
        const challengeHashBuffer = createHmac('sha256', cryptographicSaltSecret)
          .update(validationResult.data.administrativeSecurityTokenLiteral)
          .digest();

        const expectedHashBuffer = createHmac('sha256', cryptographicSaltSecret)
          .update(administrativeMasterTokenSecret)
          .digest();

        const hasEqualBufferLengthBoolean =
          challengeHashBuffer.length === expectedHashBuffer.length;
        const isIdentityLegitimateBoolean =
          hasEqualBufferLengthBoolean && timingSafeEqual(challengeHashBuffer, expectedHashBuffer);

        if (!isIdentityLegitimateBoolean) {
          emitAdministrativeVerificationSignalAction({
            severityLevelLiteral: 'CRITICAL',
            operationCodeLiteral: BYPASS_REJECTED_OPERATION_CODE,
            correlationIdentifier,
            messageContentLiteral:
              'ALERTA: Intento fallido de activación de autoridad administrativa.',
            semanticIntentTag: 'SECURITY_THREAT_DETECTION',
            contextMetadataSnapshot: { threatLevelLiteral: 'HIGH_ALERT' },
          });

          return false;
        }

        emitAdministrativeVerificationSignalAction({
          severityLevelLiteral: 'WARNING',
          operationCodeLiteral: AUTHORITY_ACTIVATED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Autoridad administrativa de infraestructura activada exitosamente.',
          semanticIntentTag: 'PRIVILEGE_ESCALATION_EVENT',
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof GlobalBaseException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        emitAdministrativeVerificationSignalAction({
          severityLevelLiteral: 'ERROR',
          operationCodeLiteral: CRYPTOGRAPHIC_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Fallo técnico durante el proceso de verificación criptográfica.',
          semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_PROCESS_FAULT',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        return false;
      }
    },
  );
};
