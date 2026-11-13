/**
 * @section Impact Analytics - Statistical Confidence Atom
 * @description Átomo de lógica pura que determina el grado de certidumbre
 * de una muestra basado en el peso de autoridad acumulado.
 */

/**
 * Calcula el coeficiente de confianza (0.0 a 1.0).
 *
 * @param totalTrustWeightAccumulator - Sumatoria de pesos de autoridad.
 * @param confidenceThresholdConstant - Valor de referencia para fiabilidad plena (1.0).
 * @returns {number} Nivel de confianza normalizado.
 */
export const CalculateStatisticalConfidence = (
  totalTrustWeightAccumulator: number,
  confidenceThresholdConstant: number,
): number => {
  return Math.min(totalTrustWeightAccumulator / confidenceThresholdConstant, 1);
};
