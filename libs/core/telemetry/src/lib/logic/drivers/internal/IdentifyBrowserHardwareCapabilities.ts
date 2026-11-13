/**
 * @section Telemetry Logic - Browser Capability Detector
 * @description Átomo encargado de verificar la presencia de 'window' y 'document'
 * de forma segura para evitar colapsos de referencia en Node.js.
 *
 * Protocolo OEDP-V17.0 - Isomorphic Integrity.
 */

import type { IDocumentHardwareBridge } from './schemas/IDocumentBridge.schema';

interface IGlobalBrowserContext {
  readonly window?: unknown;
  readonly document?: IDocumentHardwareBridge;
}

/**
 * Evalúa si el hardware del navegador está disponible para interacción.
 *
 * @returns {boolean} Verdadero si existe acceso al documento y ventana.
 */
export const IdentifyBrowserHardwareCapabilities = (): boolean => {
  const globalContext = globalThis as unknown as IGlobalBrowserContext;

  const isBrowserHardwarePresentBoolean =
    typeof globalContext.window !== 'undefined' && typeof globalContext.document !== 'undefined';

  return isBrowserHardwarePresentBoolean;
};
