// libs/engines/impact-analytics-engine/src/lib/logic/atomic/AssemblePopularAcceptanceIndicator.ts

/**
 * @section Impact Analytics - Indicator Assembler (Atom)
 * @description Átomo de lógica pura encargado de validar parámetros, calcular la
 * certidumbre estadística y el consenso comunitario, y ensamblar el indicador inmutable
 * de aceptación popular (`IPopularAcceptanceIndicator`) certificado contra su esquema Zod.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Precisión).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { BAYESIAN_ALGORITHM_CONFIGURATION } from '../../constants/BayesianAlgorithm.config';
import {
  IndicatorIdentifierSchema,
  type IPopularAcceptanceIndicator,
  PopularAcceptanceIndicatorSchema,
} from '../../schemas/PopularAcceptanceIndicator.schema';
import {
  AssemblerParametersSchema,
  type IAssemblerParameters,
} from './schemas/AssemblePopularAcceptanceIndicator.schema';
import { CalculateCommunityConsensus } from './CalculateCommunityConsensus';
import { CalculateStatisticalConfidence } from './CalculateStatisticalConfidence';

export { AssemblerParametersSchema, type IAssemblerParameters };

const ASSEMBLER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'IMPACT_INDICATOR_ASSEMBLER_ATOM',
);

const PARAMETERS_VIOLATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'INDICATOR_ASSEMBLER_PARAMETERS_INVALID',
);

const INDICATOR_CONTRACT_CORRUPT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'INDICATOR_OUTPUT_CONTRACT_CORRUPT',
);

const validateAssemblerParameters = (
  parametersSnapshot: IAssemblerParameters,
): IAssemblerParameters => {
  const validationResult = AssemblerParametersSchema.safeParse(parametersSnapshot);

  if (!validationResult.success) {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const validationIssuesCollection = validationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: ASSEMBLER_MODULE_IDENTIFIER,
      operationCodeLiteral: PARAMETERS_VIOLATION_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Parámetros de ensamblaje del indicador de impacto rechazados en frontera.',
      semanticIntentTag: 'IMPACT_INDICATOR_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException(
      'PARAMETROS_ENSAMBLAJE_INDICADOR_INVALIDOS',
      {
        validationIssuesCollection,
        correlationIdentifier,
      },
    );

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  return validationResult.data;
};

const certifyAssembledIndicator = (
  unsealedIndicatorPayload: Record<string, unknown>,
): IPopularAcceptanceIndicator => {
  const certificationResult = PopularAcceptanceIndicatorSchema.safeParse(unsealedIndicatorPayload);

  if (!certificationResult.success) {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const validationIssuesCollection = certificationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ASSEMBLER_MODULE_IDENTIFIER,
      operationCodeLiteral: INDICATOR_CONTRACT_CORRUPT_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'El indicador de impacto ensamblado violó el contrato PopularAcceptanceIndicatorSchema.',
      semanticIntentTag: 'IMPACT_INDICATOR_CONTRACT_FAULT',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const systemException = new InternalSystemException('INDICADOR_IMPACTO_CONTRATO_CORRUPTO', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(systemException, correlationIdentifier);
    throw systemException;
  }

  return Object.freeze(certificationResult.data);
};

/**
 * Construye y sella un snapshot inmutable de aceptación popular bajo estándares de auditoría.
 *
 * @param parametersSnapshot - Datos calculados por el motor estadístico bayesiano.
 * @returns {IPopularAcceptanceIndicator} Indicador sellado, inmutable y validado por Zod.
 * @throws {ValidationException} Si los parámetros de entrada violan `AssemblerParametersSchema`.
 * @throws {InternalSystemException} Si el objeto resultante incumple `PopularAcceptanceIndicatorSchema`.
 */
export const AssemblePopularAcceptanceIndicator = (
  parametersSnapshot: IAssemblerParameters,
): IPopularAcceptanceIndicator => {
  const {
    targetEntityIdentifier,
    weightedTrustScoreNumeric,
    totalTrustWeightAccumulator,
    participantQuantity,
    distributionMetadata,
  } = validateAssemblerParameters(parametersSnapshot);

  const statisticalConfidenceLevelNumeric = CalculateStatisticalConfidence(
    totalTrustWeightAccumulator,
    BAYESIAN_ALGORITHM_CONFIGURATION.CONFIDENCE_THRESHOLD_WEIGHT_QUANTITY,
  );

  const communityConsensusIndexNumeric = CalculateCommunityConsensus(weightedTrustScoreNumeric);

  const unsealedIndicatorPayload = {
    indicatorIdentifier: IndicatorIdentifierSchema.parse(globalThis.crypto.randomUUID()),
    targetEntityIdentifier,
    weightedTrustScoreNumeric,
    statisticalConfidenceLevelNumeric,
    totalParticipantQuantity: participantQuantity,
    authorityLevelDistributionMetadata: {
      ...distributionMetadata,
      technicalAuditorsQuantity: 0,
    },
    currentAcceptanceTrend: 'STABLE_CONSENSUS' as const,
    communityConsensusIndexNumeric,
    algorithmVersionLiteral: BAYESIAN_ALGORITHM_CONFIGURATION.CURRENT_ALGORITHM_VERSION_LITERAL,
    lastAggregationTimestampISO: new Date().toISOString(),
  };

  return certifyAssembledIndicator(unsealedIndicatorPayload);
};
