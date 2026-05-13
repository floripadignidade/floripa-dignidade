/**
 * @section Impact Analytics - Bayesian Metrics Aggregator (Orchestrator)
 * @description Orquestador supremo encargado de transformar el universo de datos
 * de reputación en indicadores de aceptación popular de grado forense.
 * Implementa el Teorema de Bayes para neutralizar sesgos y ataques de bots.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Atomización de ensamblaje, inyección de configuración SSOT
 * y cumplimiento estricto de Prosa ISO (ADR 0002).
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

/* 1. ADN Estructural y Configuración (Verbatim Module Syntax) */
import { PopularAcceptanceIndicatorSchema } from '../schemas/PopularAcceptanceIndicator.schema';
import type {
  EvaluatedEntityIdentifier,
  IPopularAcceptanceIndicator
} from '../schemas/PopularAcceptanceIndicator.schema';
import type { IEvaluationInput } from '../schemas/EvaluationInput.schema';
import { BAYESIAN_ALGORITHM_CONFIGURATION } from '../constants/BayesianAlgorithm.config';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { AccumulatePulseMetrics } from './atomic/AccumulatePulseMetrics';
import { CalculateWeightedBayesianScore } from './atomic/CalculateWeightedBayesianScore';
import { AssemblePopularAcceptanceIndicator } from './atomic/AssemblePopularAcceptanceIndicator';

/** Identificador técnico del motor para el Neural Sentinel. */
const IMPACT_ORCHESTRATOR_IDENTIFIER = 'IMPACT_ANALYTICS_CORE_ENGINE';

/**
 * Procesa integralmente un conjunto de evaluaciones ciudadanas para generar el
 * "Termómetro de Verdad" institucional con rastro de auditoría forense.
 *
 * @param evaluatedEntityIdentifierLiteral - Identificador nominal (Branded) de la entidad auditada.
 * @param evaluationPulsesCollection - Colección agnóstica de pulsos de interacción.
 * @returns {Promise<IPopularAcceptanceIndicator>} Indicador validado, auditado e inmutable.
 * @throws {InternalSystemException} Si el pipeline estadístico colapsa o viola el ADN de datos.
 */
export const AggregateBayesianImpactMetrics = async (
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
        // FASE 1: REDUCCIÓN Y TRIÁJE (Data Sifting)
        /**
         * Transformamos la colección heterogénea en acumuladores de peso y valor.
         */
        const {
          weightedTrustScoreSumAccumulator,
          totalTrustWeightAccumulator,
          distributionMetadata,
        } = AccumulatePulseMetrics(evaluationPulsesCollection);

        // FASE 2: CÁLCULO BAYESIANO PONDERADO (Mathematical Heart)
        const calculatedWeightedTrustScoreNumeric = CalculateWeightedBayesianScore({
          currentEntityWeightedSum: weightedTrustScoreSumAccumulator,
          currentEntityTotalWeight: totalTrustWeightAccumulator,
          globalSystemMeanScore: BAYESIAN_ALGORITHM_CONFIGURATION.SYSTEM_GLOBAL_MEAN_SCORE_NUMERIC,
          confidenceThresholdConstant: BAYESIAN_ALGORITHM_CONFIGURATION.CONFIDENCE_THRESHOLD_WEIGHT_QUANTITY,
        });

        // FASE 3: ENSAMBLAJE SOBERANO (Delegación Atómica)
        /**
         * Delegamos la creación del objeto final al átomo de ensamblaje para
         * asegurar que la complejidad ciclomática del orquestador sea mínima.
         */
        const popularAcceptanceIndicatorSnapshot = AssemblePopularAcceptanceIndicator({
          targetEntityIdentifier: evaluatedEntityIdentifierLiteral,
          weightedTrustScoreNumeric: calculatedWeightedTrustScoreNumeric,
          totalTrustWeightAccumulator,
          participantQuantity: evaluationPulsesCollection.length,
          distributionMetadata
        });

        // FASE 4: ADUANA DE ADN (Integrity Guard)
        const validationResult = PopularAcceptanceIndicatorSchema.safeParse(
          popularAcceptanceIndicatorSnapshot,
        );

        if (!validationResult.success) {
          throw new InternalSystemException('CONTRATO_INDICADOR_DE_IMPACTO_CORRUPTO', {
            structuralIssuesCollection: validationResult.error.flatten(),
            entityIdentifier: evaluatedEntityIdentifierLiteral,
          });
        }

        // FASE 5: REPORTE DE SALUD SRE (Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: IMPACT_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IMPACT_INDICATOR_GENERATED',
          correlationIdentifier,
          messageContentLiteral: 'IMPACT_ANALYTICS.LOGS.INDICATOR_GENERATED',
          semanticIntentTag: 'DATA_DRIVEN_IMPACT_CALCULATION',
          contextMetadataSnapshot: {
            targetEntity: evaluatedEntityIdentifierLiteral,
            finalScoreNumeric: calculatedWeightedTrustScoreNumeric,
            confidenceLevelNumeric: popularAcceptanceIndicatorSnapshot.statisticalConfidenceLevelNumeric
          },
        });

        return validationResult.data;

      } catch (caughtError: unknown) {
        // FASE 6: GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        if (caughtError instanceof InternalSystemException) throw caughtError;

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
