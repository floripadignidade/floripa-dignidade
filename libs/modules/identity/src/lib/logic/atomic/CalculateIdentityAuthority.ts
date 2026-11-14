/**
 * @section User Management and Identity - Authority Calculator Orchestrator
 * @description Orquestador encargado de computar el coeficiente bayesiano de autoridad
 * institucional cruzando proveedor de origen, verificación documental y antigüedad.
 * Aplica validación Zod en entrada y salida, normalización decimal determinista y
 * trazabilidad forense SRE bajo arquitectura Source-First.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Precisión).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  IdentityAuthorityAuditSchema,
  IdentityAuthorityResultSchema,
  type IIdentityAuthorityAuditParameters,
  type IIdentityAuthorityResult,
} from '@floripa-dignidade/contracts';
import {
  GlobalBaseException,
  InternalSystemException,
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

import { AUTHORITY_WEIGHT_GROUND_TRUTH } from '../../constants/AuthorityWeightGroundTruth';
import { CalculateIdentitySeniorityBonus } from './CalculateIdentitySeniorityBonus';
import { MapIdentityAuthorityBonuses } from './MapIdentityAuthorityBonuses';

const ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'IDENTITY_AUTHORITY_CALCULATOR_ORCHESTRATOR',
);

const COMPUTATION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_AUTHORITY_WEIGHT_COMPUTATION',
);

const COMPUTATION_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'AUTHORITY_COMPUTATION_SUCCESS',
);

const COMPUTATION_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'AUTHORITY_ENGINE_CRITICAL_FAULT',
);

const PRECISION_ROUNDING_FACTOR_NUMERIC = 10000;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const computeNormalizedAuthorityCoefficientNumeric = (
  rawAccumulatedScoreNumeric: number,
): number => {
  const roundedScoreNumeric =
    Math.round(rawAccumulatedScoreNumeric * PRECISION_ROUNDING_FACTOR_NUMERIC) /
    PRECISION_ROUNDING_FACTOR_NUMERIC;

  return Math.min(
    Math.max(
      roundedScoreNumeric,
      AUTHORITY_WEIGHT_GROUND_TRUTH.BASE_ANONYMOUS_TRUST_WEIGHT_NUMERIC,
    ),
    AUTHORITY_WEIGHT_GROUND_TRUTH.MAXIMUM_AUTHORITY_THRESHOLD_NUMERIC,
  );
};

/**
 * Ejecuta el cálculo integral del coeficiente de autoridad institucional de una identidad.
 *
 * @param parametersSnapshot - Datos validados de origen, verificación legal y activación.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para propagar correlación.
 * @returns {Promise<IIdentityAuthorityResult>} Resultado certificado e inmutable entre `0.1` y `1.0`.
 * @throws {ValidationException} Si los parámetros de entrada incumplen `IdentityAuthorityAuditSchema`.
 * @throws {InternalSystemException} Si ocurre un fallo inesperado durante el cálculo o sellado.
 */
export const CalculateIdentityAuthority = async (
  parametersSnapshot: IIdentityAuthorityAuditParameters,
  correlationIdentifierFallback?: string,
): Promise<IIdentityAuthorityResult> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    COMPUTATION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IIdentityAuthorityResult> => {
      try {
        const parametersValidationResult =
          IdentityAuthorityAuditSchema.safeParse(parametersSnapshot);

        if (!parametersValidationResult.success) {
          throw new ValidationException('AUTHORITY_AUDIT_DNA_CORRUPTED', {
            validationIssuesCollection: parametersValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedIdentitySnapshot = parametersValidationResult.data;

        const providerAndLegalBonusNumeric = MapIdentityAuthorityBonuses({
          socialProviderIdentifier: validatedIdentitySnapshot.socialProviderIdentifier,
          isIdentityLegallyVerifiedBoolean:
            validatedIdentitySnapshot.isIdentityLegallyVerifiedBoolean,
        });

        const { seniorityBonusNumeric, daysSinceActivationQuantity } =
          CalculateIdentitySeniorityBonus(validatedIdentitySnapshot.occurrenceTimestampISO);

        const rawAccumulatedScoreNumeric =
          AUTHORITY_WEIGHT_GROUND_TRUTH.BASE_ANONYMOUS_TRUST_WEIGHT_NUMERIC +
          providerAndLegalBonusNumeric +
          seniorityBonusNumeric;

        const authorityCoefficientNumeric = computeNormalizedAuthorityCoefficientNumeric(
          rawAccumulatedScoreNumeric,
        );

        const purifiedAuthorityResultSnapshot = IdentityAuthorityResultSchema.parse({
          authorityCoefficientNumeric,
          daysSinceActivationQuantity,
          isVerifiedHumanBoolean: validatedIdentitySnapshot.isIdentityLegallyVerifiedBoolean,
        });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: COMPUTATION_SUCCESS_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Cálculo de autoridad institucional finalizado de forma nominal.',
          semanticIntentTag: 'IDENTITY_TRUST_CALCULATION',
          contextMetadataSnapshot: Object.freeze({
            identityIdentifier: validatedIdentitySnapshot.identityIdentifier,
            finalScoreNumeric: authorityCoefficientNumeric,
            daysActiveQuantity: daysSinceActivationQuantity,
          }),
        });

        return Object.freeze(purifiedAuthorityResultSnapshot);
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          ReportForensicException(caughtExecutionError, correlationIdentifier);
          throw caughtExecutionError;
        }

        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : new InternalSystemException('AUTHORITY_ENGINE_CRITICAL_FAULT', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
                targetIdentityIdentifier:
                  parametersSnapshot?.identityIdentifier ?? 'UNKNOWN_IDENTITY',
              });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: COMPUTATION_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo crítico durante el cálculo de autoridad institucional de identidad.',
          semanticIntentTag: 'IDENTITY_AUTHORITY_CALCULATION_FAULT',
          contextMetadataSnapshot: Object.freeze({
            ...normalizedException.runtimeContextSnapshot,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
