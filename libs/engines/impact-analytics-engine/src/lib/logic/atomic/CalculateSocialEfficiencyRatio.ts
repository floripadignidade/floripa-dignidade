/**
 * @section Impact Analytics - Efficiency Ratio Atom
 * @description Implementa la métrica de eficiencia social: Confianza / Log10(Inversión).
 * Isola la aritmética para facilitar la auditoría estadística.
 *
 * Protocolo OEDP-V17.0 - Mathematical Precision.
 */

/**
 * Calcula el ratio de impacto por cada Real invertido utilizando escala logarítmica
 * para normalizar grandes variaciones presupuestarias.
 *
 * @param amountNumeric - Monto ejecutado.
 * @param communityTrustScoreNumeric - Nivel de aprobación ciudadana (0-1).
 * @returns {number} Coeficiente de eficiencia.
 */
export const CalculateSocialEfficiencyRatio = (
  amountNumeric: number,
  communityTrustScoreNumeric: number,
): number => {
  const normalizedSpendingNumeric = Math.log10(amountNumeric + 1);
  const efficiencyRatioResult = communityTrustScoreNumeric / (normalizedSpendingNumeric || 1);

  return efficiencyRatioResult;
};
