/**
 * @section Impact Analytics - Bayesian Metrics Aggregator (Orchestrator)
 * @description Orquestador superior encargado de transformar el universo de datos
 * de reputación en indicadores de aceptación popular de grado forense. Implementa
 * el algoritmo de Promedio Bayesiano para neutralizar sesgos de bots.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Modular Boundary Fix.
 * SANEADO Zenith: Resolución de colisión TS2322 y cumplimiento de Soberanía Nominal.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { PopularAcceptanceIndicatorSchema } from '../schemas/PopularAcceptanceIndicator.schema';
import type {
  EvaluatedEntityIdentifier, // 🛡️ SANEADO Zenith: Importación del tipo sellado.
  ImpactIndicatorIdentifier,
  IPopularAcceptanceIndicator
} from '../schemas/PopularAcceptanceIndicator.schema';

import type { IEvaluationInput } from '../schemas/EvaluationInput.schema';

/* 2. Enjambre Atómico de Precisión Matemática (Swiss-Watch Swarm) */
import { AccumulatePulseMetrics } from './atomic/AccumulatePulseMetrics';
import { CalculateCommunityConsensus } from './atomic/CalculateCommunityConsensus';
import { CalculateStatisticalConfidence } from './atomic/CalculateStatisticalConfidence';
import { CalculateWeightedBayesianScore } from './atomic/CalculateWeightedBayesianScore';

/** Identificador técnico del motor para el Neural Sentinel. */
const IMPACT_ORCHESTRATOR_IDENTIFIER = 'IMPACT_ANALYTICS_CORE_ENGINE';

/**
 * @section Configuración Estadística Institucional
 */
const CONFIDENCE_THRESHOLD_CONSTANT = 10;
const SYSTEM_GLOBAL_MEAN_SCORE = 0.5;

/**
 * Procesa integralmente un conjunto de evaluaciones ciudadanas para generar el
 * "Termómetro de Verdad" institucional con rastro de auditoría forense.
 *
 * @param evaluatedEntityIdentifierLiteral - Identificador sellado (Branded) de la entidad.
 * @param evaluationPulsesCollection - Colección agnóstica de pulsos de interacción.
 * @returns {Promise<IPopularAcceptanceIndicator>} Indicador validado, auditado e inmutable.
 * @throws {InternalSystemException} Si la agregación falla o viola el contrato de ADN.
 */
export const AggregateBayesianImpactMetrics = async (
  // 🛡️ SANEADO Zenith: Exigimos el tipo nominal desde la firma para erradicar TS2322.
  evaluatedEntityIdentifierLiteral: EvaluatedEntityIdentifier,
  evaluationPulsesCollection: IEvaluationInput[],
): Promise<IPopularAcceptanceIndicator> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    IMPACT_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_STATISTICAL_AGGREGATION_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // FASE 1: REDUCCIÓN DE DATOS
        const {
          weightedTrustScoreSumAccumulator,
          totalTrustWeightAccumulator,
          distributionMetadata,
        } = AccumulatePulseMetrics(evaluationPulsesCollection);

        // FASE 2: CÁLCULO BAYESIANO PONDERADO
        const calculatedWeightedTrustScoreNumeric = CalculateWeightedBayesianScore({
          currentEntityWeightedSum: weightedTrustScoreSumAccumulator,
          currentEntityTotalWeight: totalTrustWeightAccumulator,
          globalSystemMeanScore: SYSTEM_GLOBAL_MEAN_SCORE,
          confidenceThresholdConstant: CONFIDENCE_THRESHOLD_CONSTANT,
        });

        // FASE 3: ENSAMBLAJE DEL INDICADOR SOBERANO
        const indicatorIdentifier = crypto.randomUUID() as ImpactIndicatorIdentifier;

        const popularAcceptanceIndicatorSnapshot: IPopularAcceptanceIndicator = {
          indicatorIdentifier,
          targetEntityIdentifier: evaluatedEntityIdentifierLiteral,
          weightedTrustScoreNumeric: calculatedWeightedTrustScoreNumeric,
          statisticalConfidenceLevelNumeric: CalculateStatisticalConfidence(
            totalTrustWeightAccumulator,
            CONFIDENCE_THRESHOLD_CONSTANT,
          ),
          totalParticipantQuantity: evaluationPulsesCollection.length,
          authorityLevelDistributionMetadata: {
            ...distributionMetadata,
            technicalAuditorsQuantity: 0,
          },
          currentAcceptanceTrend: 'STABLE_CONSENSUS',
          communityConsensusIndexNumeric: CalculateCommunityConsensus(calculatedWeightedTrustScoreNumeric),
          lastAggregationTimestampISO: new Date().toISOString(),
          algorithmVersionLiteral: 'BAYES_V1.2_FLORIPA'
        };

        // FASE 4: ADUANA DE ADN (Validación de Integridad Final)
        const validationResult = PopularAcceptanceIndicatorSchema.safeParse(
          popularAcceptanceIndicatorSnapshot,
        );

        if (!validationResult.success) {
          throw new InternalSystemException('CONTRATO_INDICADOR_DE_IMPACTO_CORRUPTO', {
            structuralIssuesCollection: validationResult.error.flatten(),
            indicatorIdentifier,
          });
        }

        // FASE 5: REPORTE DE SALUD SRE (Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: IMPACT_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IMPACT_INDICATOR_GENERATED',
          correlationIdentifier,
          messageContentLiteral: 'Análisis de impacto bayesiano finalizado exitosamente.',
          /** 🛡️ SANEADO Zenith: Nomenclatura ISO en metadatos de señal. */
          contextMetadataSnapshot: {
            targetEntityIdentifierLiteral: evaluatedEntityIdentifierLiteral,
            weightedTrustScoreNumeric: calculatedWeightedTrustScoreNumeric,
            statisticalConfidenceLevelNumeric: popularAcceptanceIndicatorSnapshot.statisticalConfidenceLevelNumeric,
          },
        });

        return validationResult.data;

      } catch (caughtError: unknown) {
        if (caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        throw new InternalSystemException('FALLO_EN_PROCESAMIENTO_ESTADISTICO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          targetEntityIdentifierLiteral: evaluatedEntityIdentifierLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
