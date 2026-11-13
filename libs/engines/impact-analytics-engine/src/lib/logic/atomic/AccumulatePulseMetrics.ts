/**
 * @section Impact Analytics - Pulse Metrics Accumulator
 * @description Átomo de lógica pura encargado de la reducción de datos. Transforma
 * una colección de entradas agnósticas en sumatorias acumuladas.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Boundary Fix.
 * @author Raz Podestá - MetaShark Tech
 */

import type { IEvaluationInput } from '../../schemas/EvaluationInput.schema';
import { MapEvaluationAuthorityWeight } from './MapEvaluationAuthorityWeight';

/**
 * @interface IAccumulatedMetricsResult
 * @description Snapshot técnico de los acumuladores para el cálculo bayesiano.
 */
export interface IAccumulatedMetricsResult {
  readonly weightedTrustScoreSumAccumulator: number;
  readonly totalTrustWeightAccumulator: number;
  readonly distributionMetadata: {
    readonly verifiedCitizensQuantity: number;
    readonly anonymousInteractionsQuantity: number;
  };
}

/**
 * Procesa la colección de entradas y genera el resumen aritmético ponderado.
 *
 * @param evaluationInputsCollection - Lista de entradas validadas por el esquema agnóstico.
 * @returns {IAccumulatedMetricsResult} Resultados para la fórmula de Bayes.
 */
export const AccumulatePulseMetrics = (
  evaluationInputsCollection: readonly IEvaluationInput[],
): IAccumulatedMetricsResult => {
  let weightedTrustScoreSumAccumulator = 0;
  let totalTrustWeightAccumulator = 0;
  let verifiedCitizensQuantity = 0;
  let anonymousInteractionsQuantity = 0;

  for (const evaluationItem of evaluationInputsCollection) {
    /**
     * 🛡️ SANEADO: Determinación de peso basada en la identidad del contrato agnóstico.
     */
    const currentInteractionWeightNumeric = MapEvaluationAuthorityWeight(
      evaluationItem.evaluatorIdentityIdentifier,
    );

    // 1. Acumulación de Confianza Ponderada
    weightedTrustScoreSumAccumulator +=
      evaluationItem.quantitativeTrustScoreNumeric * currentInteractionWeightNumeric;
    totalTrustWeightAccumulator += currentInteractionWeightNumeric;

    // 2. Triaje de Distribución
    if (!evaluationItem.evaluatorIdentityIdentifier) {
      anonymousInteractionsQuantity++;
    } else {
      verifiedCitizensQuantity++;
    }
  }

  return {
    weightedTrustScoreSumAccumulator,
    totalTrustWeightAccumulator,
    distributionMetadata: {
      verifiedCitizensQuantity,
      anonymousInteractionsQuantity,
    },
  };
};
