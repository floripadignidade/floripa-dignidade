/**
 * @section Analytics Logic - Bayesian Mathematics
 * @description Implementa la fórmula de Promedio Bayesiano para neutralizar el
 * sesgo de muestras pequeñas y ataques de bots. Es una función pura.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Mathematical Precision.
 */

interface IBayesianParameters {
  readonly currentEntityWeightedSum: number;
  readonly currentEntityTotalWeight: number;
  readonly globalSystemMeanScore: number;
  readonly confidenceThresholdConstant: number;
}

/**
 * Calcula la puntuación ponderada de Bayes.
 * W = (R * v + C * m) / (v + m)
 *
 * @param parameters - Factores de peso y promedios globales.
 * @returns {number} Score final entre 0.0 y 1.0.
 */
export const CalculateWeightedBayesianScore = (parameters: IBayesianParameters): number => {
  const {
    currentEntityWeightedSum,
    currentEntityTotalWeight,
    globalSystemMeanScore,
    confidenceThresholdConstant,
  } = parameters;

  /**
   * Si no hay peso (votos), retornamos la media global para evitar división por cero
   * y mantener un estado de incertidumbre neutral.
   */
  if (currentEntityTotalWeight === 0) {
    return globalSystemMeanScore;
  }

  const weightedNumerator =
    currentEntityWeightedSum + confidenceThresholdConstant * globalSystemMeanScore;
  const totalDenominator = currentEntityTotalWeight + confidenceThresholdConstant;

  return weightedNumerator / totalDenominator;
};
