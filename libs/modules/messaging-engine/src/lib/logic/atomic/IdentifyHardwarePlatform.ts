/**
 * @section Messaging Logic - Hardware Sensor Atom
 * @description Clasificador de soberanía de hardware. Determina la procedencia física
 * del pulso de interacción mediante análisis de traza de entorno (User Agent).
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & High Performance.
 */

import type { TDevicePlatform } from '../../schemas/UserPresence.schema';

/**
 * ⚡ OPTIMIZACIÓN: Motores de detección pre-compilados (Hoisting).
 * Se mantienen en el ámbito del módulo para evitar re-compilaciones en el GC.
 */
const MOBILE_SIGNAL_ENGINE = /iPhone|iPad|iPod|Android/i;
const APPLE_HARDWARE_ENGINE = /iPhone|iPad|iPod/i;

/**
 * Analiza el rastro del entorno de ejecución para clasificar la plataforma física.
 * @returns {TDevicePlatform} Identificador técnico de la plataforma.
 */
export const IdentifyHardwarePlatform = (): TDevicePlatform => {
  // 1. BLINDAJE: Verificación de integridad ambiental (SSR / Edge / Node Safe)
  if (typeof window === 'undefined' || typeof navigator === 'undefined') {
    return 'WEB_DESKTOP';
  }

  const userAgentLiteral = navigator.userAgent;

  // 2. DETECCIÓN: Análisis de rastro móvil genérico
  const isMobileDetectedBoolean = MOBILE_SIGNAL_ENGINE.test(userAgentLiteral);

  if (!isMobileDetectedBoolean) {
    return 'WEB_DESKTOP';
  }

  // 3. CLASIFICACIÓN: Discriminación de ecosistema para ruteo inteligente
  // Nota: Se alinea con DevicePlatformSchema definido en el ADN del búnker.
  const isAppleHardwareDetectedBoolean = APPLE_HARDWARE_ENGINE.test(userAgentLiteral);

  return isAppleHardwareDetectedBoolean ? 'PWA_MOBILE_APPLE' : 'PWA_MOBILE_ANDROID';
};
