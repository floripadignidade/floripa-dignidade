/**
 * @section Impact Analytics - Territorial Sentiment Aggregator
 * @description Átomo de lógica encargado de agrupar y ponderar entradas de
 * evaluación según su contexto geográfico. Transforma una colección plana
 * de juicios en clústeres estadísticos por territorio.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Modular Boundary Fix.
 * SANEADO Zenith: Desacoplamiento total de 'reputation-engine' (ADR 0003).
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural Interno (Contrato Agnóstico) */
import type { IEvaluationInput } from '../../schemas/EvaluationInput.schema';

/**
 * @interface ITerritorialClusterResult
 * @description Representación estadística inmutable de un clúster geográfico.
 */
export interface ITerritorialClusterResult {
  readonly territoryIdentifierLiteral: string;
  readonly aggregatedTrustScoreNumeric: number;
  readonly totalInteractionQuantity: number;
  readonly communityConsensusIndexNumeric: number;
}

/**
 * @interface ITerritorialAccumulator
 * @description Estructura de reducción para el cálculo de promedios ponderados.
 */
interface ITerritorialAccumulator {
  weightedTrustScoreSumAccumulator: number;
  totalAuthorityWeightAccumulator: number;
  totalInteractionQuantity: number;
}

/**
 * Agrupa una colección de entradas de evaluación según su origen territorial.
 *
 * @param evaluationInputsCollection - Lista de juicios de valor validados por la aduana.
 * @param correlationIdentifier - Identificador de trazabilidad del hilo superior.
 * @returns {Promise<ITerritorialClusterResult[]>} Colección de métricas por zona geográfica.
 */
export const AggregateTerritorialSentiment = async (
  evaluationInputsCollection: IEvaluationInput[],
  correlationIdentifier: string,
): Promise<ITerritorialClusterResult[]> => {
  return await TraceExecutionTime(
    'TERRITORIAL_SENTIMENT_AGGREGATOR',
    'EXECUTE_GEOGRAPHIC_CLUSTERING_TRANSACTION',
    correlationIdentifier,
    async () => {
      /**
       * @section Mapa de Acumulación Geográfica
       * Clave: Nombre del territorio normalizado.
       */
      const territorialAccumulationMap = new Map<string, ITerritorialAccumulator>();

      evaluationInputsCollection.forEach((evaluationItem) => {
        /**
         * @future_integration
         * En la Fase 8, el 'territorial-engine' normalizará estos nombres
         * contra los códigos oficiales del IBGE.
         */
        const territoryKeyLiteral = (
          evaluationItem.territorialContextLiteral || 'FLORIANOPOLIS_GLOBAL'
        )
          .trim()
          .toUpperCase();

        const currentAccumulator = territorialAccumulationMap.get(territoryKeyLiteral) || {
          weightedTrustScoreSumAccumulator: 0,
          totalAuthorityWeightAccumulator: 0,
          totalInteractionQuantity: 0,
        };

        /**
         * Ponderación SRE:
         * Identificamos el peso de autoridad (Verified: 1.0 | Anonymous: 0.1).
         */
        const interactionAuthorityWeightNumeric = evaluationItem.evaluatorIdentityIdentifier
          ? 1.0
          : 0.1;

        currentAccumulator.weightedTrustScoreSumAccumulator +=
          evaluationItem.quantitativeTrustScoreNumeric * interactionAuthorityWeightNumeric;
        currentAccumulator.totalAuthorityWeightAccumulator += interactionAuthorityWeightNumeric;
        currentAccumulator.totalInteractionQuantity += 1;

        territorialAccumulationMap.set(territoryKeyLiteral, currentAccumulator);
      });

      const territorialResultsCollection: ITerritorialClusterResult[] = [];

      territorialAccumulationMap.forEach((accumulatorSnapshot, territoryIdentifier) => {
        /**
         * Cálculo de Confianza Agregada.
         * Si no hay peso, el sistema asume incertidumbre neutral (0.5).
         */
        const aggregatedTrustScoreNumeric =
          accumulatorSnapshot.totalAuthorityWeightAccumulator > 0
            ? accumulatorSnapshot.weightedTrustScoreSumAccumulator /
              accumulatorSnapshot.totalAuthorityWeightAccumulator
            : 0.5;

        territorialResultsCollection.push({
          territoryIdentifierLiteral: territoryIdentifier,
          aggregatedTrustScoreNumeric,
          totalInteractionQuantity: accumulatorSnapshot.totalInteractionQuantity,
          /**
           * Índice de Consenso: Determina la cohesión de la opinión local.
           * 1.0 = Unanimidad | 0.0 = Máxima Polarización.
           */
          communityConsensusIndexNumeric: 1 - Math.abs(aggregatedTrustScoreNumeric - 0.5) * 2,
        });
      });

      // REPORTE DE ÉXITO SRE
      void EmitTelemetrySignal({
        severityLevel: 'INFO',
        moduleIdentifier: 'TERRITORIAL_AGGREGATOR',
        operationCode: 'GEOGRAPHIC_AGGREGATION_NOMINAL',
        correlationIdentifier,
        message: 'IMPACT_ANALYTICS.LOGS.TERRITORIAL_SUCCESS',
        contextMetadata: {
          detectedTerritoriesQuantity: territorialResultsCollection.length,
          totalInputsProcessedQuantity: evaluationInputsCollection.length,
        },
      });

      return territorialResultsCollection;
    },
  );
};
