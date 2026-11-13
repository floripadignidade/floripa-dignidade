/**
 * @section Impact Analytics - Community Consensus Calculator
 * @description Implementa un algoritmo de dispersión para determinar el nivel
 * de acuerdo en la comunidad. Un índice alto indica unanimidad; un índice
 * bajo indica una fuerte polarización social.
 *
 * Protocolo OEDP-V16.0 - Mathematical Precision & ISO Standards.
 */

/**
 * Calcula el índice de consenso basado en la desviación del score respecto al eje neutral.
 *
 * @param weightedTrustScoreNumeric - Resultado del cálculo bayesiano.
 * @returns {number} Índice de consenso entre 0.0 y 1.0.
 */
export const CalculateCommunityConsensus = (weightedTrustScoreNumeric: number): number => {
  /**
   * @section Lógica de Polarización
   * Un score de 0.5 representa máxima duda o división (Consenso 0).
   * Un score de 0.0 o 1.0 representa claridad total (Consenso 1).
   */
  const neutralAxisInertiaNumeric = 0.5;
  const absoluteDeviationNumeric = Math.abs(weightedTrustScoreNumeric - neutralAxisInertiaNumeric);

  return absoluteDeviationNumeric * 2;
};
