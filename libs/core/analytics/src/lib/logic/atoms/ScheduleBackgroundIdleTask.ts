/**
 * @section Analytics Logic - Background Idle Task Scheduler (Atom)
 * @description Átomo de alto rendimiento encargado de programar la ejecución de tareas
 * en periodos de inactividad de la CPU (60/120 FPS). Implementa soporte isomórfico
 * prioritario para `requestIdleCallback` con tiempo límite forzado (timeout),
 * conmutando a `setTimeout` en entornos donde la API no esté disponible o en SSR.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Eficiencia y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Tiempo límite en milisegundos para forzar la ejecución si el hilo principal no entra en ocio. */
const MAXIMUM_IDLE_DEADLINE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 2000;

interface IGlobalIdleCapableWindow {
  readonly requestIdleCallback?: (
    callbackAction: (idleDeadline: { readonly didTimeout: boolean }) => void,
    options?: { readonly timeout: number },
  ) => number;
}

/**
 * Programa una acción asíncrona no bloqueante fuera de la ruta crítica de renderizado de React 19.
 *
 * @param backgroundTaskAction - Acción que se ejecutará durante la ventana de inactividad del navegador.
 */
export const ScheduleBackgroundIdleTask = (backgroundTaskAction: () => void): void => {
  const globalContextReference = globalThis as unknown as IGlobalIdleCapableWindow;

  const isRequestIdleCallbackAvailableBoolean =
    typeof globalThis !== 'undefined' &&
    typeof globalContextReference.requestIdleCallback === 'function';

  if (isRequestIdleCallbackAvailableBoolean && globalContextReference.requestIdleCallback) {
    globalContextReference.requestIdleCallback(
      () => {
        backgroundTaskAction();
      },
      { timeout: MAXIMUM_IDLE_DEADLINE_TIMEOUT_IN_MILLISECONDS_QUANTITY },
    );
    return;
  }

  // Fallback determinista para entornos de servidor o navegadores sin soporte de Idle Callback
  setTimeout(() => {
    backgroundTaskAction();
  }, 1);
};
