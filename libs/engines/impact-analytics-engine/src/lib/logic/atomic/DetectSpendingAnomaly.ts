/**
 * @section Impact Analytics - Spending Anomaly Detector
 * @description Átomo encargado de identificar discrepancias críticas entre
 * inversión pública y aprobación ciudadana.
 *
 * Protocolo OEDP-V17.0 - SRE Resilience.
 */

/**
 * @constant CRITICAL_SPENDING_THRESHOLD - Umbral de gasto significativo (100k).
 * @constant CRITICAL_TRUST_MINIMUM - Nivel de desconfianza crítica (0.3).
 */
const CRITICAL_SPENDING_THRESHOLD_NUMERIC = 100000;
const CRITICAL_TRUST_MINIMUM_NUMERIC = 0.3;

/**
 * Evalúa si el gasto representa un riesgo de transparencia.
 */
export const DetectSpendingAnomaly = (
  amountNumeric: number,
  communityTrustScoreNumeric: number,
): boolean => {
  return (
    amountNumeric > CRITICAL_SPENDING_THRESHOLD_NUMERIC &&
    communityTrustScoreNumeric < CRITICAL_TRUST_MINIMUM_NUMERIC
  );
};
