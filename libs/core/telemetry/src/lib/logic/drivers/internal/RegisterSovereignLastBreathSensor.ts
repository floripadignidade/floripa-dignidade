/**
 * @section Telemetry Logic - Last Breath Sensor Orchestrator
 * @description Registra un disparador que vacía el buffer de telemetría cuando el usuario
 * cierra o minimiza la aplicación, asegurando que la última señal no se pierda.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & SRE Resilience.
 * SANEADO Zenith: Erradicación total de 'any' (Fix TS @typescript-eslint/no-explicit-any).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { IdentifyBrowserHardwareCapabilities } from './IdentifyBrowserHardwareCapabilities';
import type { IDocumentHardwareBridge } from './schemas/IDocumentBridge.schema';

/**
 * @interface IGlobalBrowserContext
 * @description Contrato privado para el acceso seguro al documento en este búnker.
 */
interface IGlobalBrowserContext {
  readonly document: IDocumentHardwareBridge;
}

/**
 * Vincula la acción de despacho al sensor de visibilidad del sistema operativo.
 *
 * @param onLifecycleTerminationAction - Acción de sincronización (Flush) a ejecutar.
 * @returns {void}
 */
export const RegisterSovereignLastBreathSensor = (
  onLifecycleTerminationAction: () => void,
): void => {
  // 1. ADUANA DE HARDWARE (Detección de Isomorfismo)
  const isHardwareAvailableBoolean = IdentifyBrowserHardwareCapabilities();

  if (!isHardwareAvailableBoolean) {
    return;
  }

  /**
   * 2. REGISTRO DE ESCUCHA (Lifecycle Sentry)
   * SANEADO Zenith: El casteo es seguro tras la verificación de IdentifyBrowserHardwareCapabilities.
   */
  const { document: browserDocumentReference } = globalThis as unknown as IGlobalBrowserContext;

  browserDocumentReference.addEventListener(
    'visibilitychange',
    () => {
      /**
       * @section Lógica de "Último Suspiro"
       * Solo disparamos el vaciado si el ciudadano sale de la vista activa
       * (Cierre de pestaña, cambio de app en móvil, etc).
       */
      if (browserDocumentReference.visibilityState === 'hidden') {
        onLifecycleTerminationAction();
      }
    },
    { passive: true },
  );
};
