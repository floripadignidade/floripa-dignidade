/**
 * @section User Management & Identity - Authority Calibration Standards
 * @description Única Fuente de Verdad (SSOT) para los coeficientes y pesos del
 * algoritmo de confianza. Define la sensibilidad del sistema ante la
 * antigüedad y el origen de la identidad.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @name AUTHORITY_WEIGHT_GROUND_TRUTH
 * @description Matriz de pesos institucionales para el motor de cálculo.
 */
export const AUTHORITY_WEIGHT_GROUND_TRUTH = {
  /** Peso inicial asignado a identidades sin rastro verificado. */
  BASE_ANONYMOUS_TRUST_WEIGHT_NUMERIC: 0.1,

  /** Incremento por vinculación con proveedores federados (Google/Apple). */
  SOCIAL_FEDERATION_BONUS_NUMERIC: 0.2,

  /** Incremento máximo por validación física de documentos. */
  LEGAL_VERIFICATION_BONUS_NUMERIC: 0.5,

  /** Límite superior inquebrantable del coeficiente de autoridad. */
  MAXIMUM_AUTHORITY_THRESHOLD_NUMERIC: 1.0,
} as const;
