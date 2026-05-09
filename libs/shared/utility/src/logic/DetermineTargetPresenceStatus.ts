/**
 * @section Utility Logic - Presence Determination Atom
 * @description Átomo de lógica pura encargado de resolver el estado ontológico
 * de presencia ciudadana basándose en señales físicas de conectividad y visibilidad.
 * Isola la matriz de decisión de la infraestructura reactiva, permitiendo una
 * evaluación determinista y testable.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * 🛡️ LEY SRE: Este aparato es una "Leaf Function". No posee dependencias externas
 * ni efectos secundarios. Es invocado por los sensores de 'shared-state-store'.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @section ADN de Estados de Disponibilidad
 * Definición local para evitar dependencias circulares con el 'state-store'.
 */
export type TPresenceStatusLiteral =
  | 'ONLINE'          // Ciudadano presente e interactuando.
  | 'AWAY'            // Aplicación en segundo plano o pestaña oculta.
  | 'DO_NOT_DISTURB'  // Estado forzado (Reservado para evolución futura).
  | 'OFFLINE';        // Interrupción física de la conexión de red.

/**
 * @interface IPresenceHardwareSignals
 * @description Snapshot inmutable de las señales capturadas del entorno del navegador.
 */
interface IPresenceHardwareSignals {
  /** Estado de conectividad física reportado por 'navigator.onLine'. */
  readonly isNavigatorOnlineBoolean: boolean;

  /**
   * Estado de visibilidad de la ventana reportado por 'document.visibilityState'.
   * Se utiliza un literal de string para asegurar compatibilidad isomórfica.
   */
  readonly documentVisibilityStateLiteral: 'visible' | 'hidden' | string;
}

/**
 * Resuelve el estado de presencia basado en la combinación de señales de hardware.
 * Implementa el patrón "Priority Triage": la red siempre precede a la visibilidad.
 *
 * @param signalsSnapshot - Colección de señales físicas detectadas por el sensor.
 * @returns {TPresenceStatusLiteral} El estado resultante para la sincronización de memoria.
 */
export const DetermineTargetPresenceStatus = (
  signalsSnapshot: IPresenceHardwareSignals
): TPresenceStatusLiteral => {

  /**
   * @section Matriz de Decisión Soberana
   *
   * Prioridad 1: Integridad de Red.
   * Si no hay señal física, el ciudadano se considera desconectado
   * independientemente de si la pestaña está abierta.
   */
  if (!signalsSnapshot.isNavigatorOnlineBoolean) {
    return 'OFFLINE';
  }

  /**
   * Prioridad 2: Interacción en Segundo Plano (Visibility API).
   * Si el ciudadano minimiza la aplicación o cambia de pestaña,
   * transicionamos a un estado de inactividad pasiva.
   */
  if (signalsSnapshot.documentVisibilityStateLiteral === 'hidden') {
    return 'AWAY';
  }

  /**
   * Prioridad 3: Estado Nominal.
   * Conexión activa y ventana en foco.
   */
  return 'ONLINE';
};
