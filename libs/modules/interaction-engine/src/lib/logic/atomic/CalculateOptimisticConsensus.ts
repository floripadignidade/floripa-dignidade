/**
 * @section Interaction Logic - Optimistic Consensus Calculator
 * @description Átomo de lógica pura encargado de proyectar el impacto inmediato
 * de una reacción en el índice de consenso comunitario.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * Calcula una aproximación optimista del índice de consenso.
 *
 * @param interactionPolarityNumeric - Valor de la reacción (1, 0, -1).
 * @returns {number} Índice de consenso proyectado (0.0 a 1.0).
 */
export const CalculateOptimisticConsensus = (interactionPolarityNumeric: number): number => {
  /**
   * @section Regla de Negocio: Proyección de Consenso
   * Si la reacción es neutral (0), el consenso tiende a la inercia (0.5).
   * Si hay una acción definida, proyectamos claridad total (1.0) para el feedback visual.
   */
  return interactionPolarityNumeric === 0 ? 0.5 : 1.0;
};
