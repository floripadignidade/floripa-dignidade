/**
 * @section Impact Analytics - Authority Weight Mapper
 * @description Átomo encargado de asignar el coeficiente de influencia a un pulso
 * de evaluación basándose en la soberanía de la identidad del autor.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Responsible Weighting.
 */

/**
 * Determina el peso estadístico de una interacción.
 *
 * @param evaluatorIdentityIdentifier - UUID del ciudadano (null si es anónimo).
 * @returns {number} Coeficiente de peso (0.1 a 1.0).
 */
export const MapEvaluationAuthorityWeight = (
  evaluatorIdentityIdentifier: string | null,
): number => {
  /**
   * @section Metodología Bayesiana de Confianza
   * ANÓNIMO: 0.1 - Contribuye al volumen pero tiene baja influencia en el score.
   * IDENTIFICADO: 1.0 - Ciudadano autenticado con autoridad plena.
   *
   * TODO: Evolucionar para recibir el 'identityTrustWeightScore' real desde
   * la base de datos de identidades.
   */
  const isAnonymousInteractionBoolean = !evaluatorIdentityIdentifier;

  return isAnonymousInteractionBoolean ? 0.1 : 1.0;
};
