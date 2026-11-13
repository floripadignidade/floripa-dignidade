/**
 * @section Health Monitor - Health Classification Atom
 * @description Átomo de lógica pura encargado de determinar el estado categórico
 * de un servicio basándose en su disponibilidad y latencia observada.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

import type { HealthStatus } from '../../schemas/HealthStatus.schema';

/**
 * @constant MAXIMUM_NOMINAL_LATENCY_MILLISECONDS_QUANTITY
 * Umbral técnico para considerar un servicio como degradado (SRE Standard).
 */
const MAXIMUM_NOMINAL_LATENCY_MILLISECONDS_QUANTITY = 500;

/**
 * Resuelve el estado de salud del hardware o servicio externo.
 *
 * @param isServiceAvailableBoolean - Indica si la acción finalizó sin colapso.
 * @param latencyInMillisecondsQuantity - Tiempo de respuesta capturado.
 * @returns {HealthStatus} UP | DEGRADED | DOWN.
 */
export const ClassifyInfrastructureHealth = (
  isServiceAvailableBoolean: boolean,
  latencyInMillisecondsQuantity: number,
): HealthStatus => {
  // 1. Prioridad: Disponibilidad física
  if (!isServiceAvailableBoolean) {
    return 'DOWN';
  }

  // 2. Evaluación de rendimiento (SRE Performance Gate)
  const isDegradedBoolean =
    latencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_MILLISECONDS_QUANTITY;

  return isDegradedBoolean ? 'DEGRADED' : 'UP';
};
