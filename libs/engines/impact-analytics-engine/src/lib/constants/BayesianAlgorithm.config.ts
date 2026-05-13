/**
 * @section Impact Analytics - Bayesian Algorithm Configuration
 * @description SSOT para las constantes matemáticas del motor de impacto.
 * Define la sensibilidad del sistema ante la incertidumbre y el ruido de datos.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ISO Technical Naming.
 */

export const BAYESIAN_ALGORITHM_CONFIGURATION = {
  /**
   * Mínimo de peso de autoridad acumulado (Verified Citizens) para considerar
   * que el indicador posee certidumbre estadística total (1.0).
   */
  CONFIDENCE_THRESHOLD_WEIGHT_QUANTITY: 10,

  /**
   * Punto de equilibrio institucional. Valor asignado a entidades sin historial
   * para representar una incertidumbre neutral (0.5 = Ni frío ni calor).
   */
  SYSTEM_GLOBAL_MEAN_SCORE_NUMERIC: 0.5,

  /** Versión técnica del algoritmo para historización forense. */
  CURRENT_ALGORITHM_VERSION_LITERAL: 'BAYES_ZENITH_V1.3_FLORIPA'
} as const;
