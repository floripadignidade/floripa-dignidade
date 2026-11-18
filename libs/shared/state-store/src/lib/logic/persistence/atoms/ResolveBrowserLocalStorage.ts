/**
 * @file libs/shared/state-store/src/lib/logic/persistence/atoms/ResolveBrowserLocalStorage.ts
 * @section Shared State Store - Browser Storage Resolver (Atom)
 * @description Átomo encargado de obtener de forma segura `window.localStorage`
 * únicamente cuando la ejecución ocurre en navegador real, evitando acceder al getter
 * experimental de Node.js en SSR/Edge (`ExperimentalWarning`) y conteniendo errores
 * de seguridad (`SecurityError`) en modos privados o contextos embebidos restringidos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Portabilidad y Robustez).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DetermineServerRuntime } from '@floripa-dignidade/telemetry';

import { STATE_STORE_CONFIGURATION } from '../../../constants/StateStoreConfiguration';
import { EmitStorageHardwareWarning } from './EmitStorageHardwareWarning';

/**
 * Resuelve la referencia física a `window.localStorage` solo en contexto de navegador.
 *
 * @returns {Storage | null} Instancia nativa `Storage` o `null` en servidor/entorno bloqueado.
 */
export const ResolveBrowserLocalStorage = (): Storage | null => {
  if (DetermineServerRuntime() || typeof window === 'undefined') {
    return null;
  }

  try {
    if (!('localStorage' in window)) {
      return null;
    }

    return window.localStorage;
  } catch (caughtSecurityError: unknown) {
    EmitStorageHardwareWarning(
      'STORAGE_HARDWARE_ACCESS_DENIED',
      STATE_STORE_CONFIGURATION.PERSISTENCE_STORAGE_KEY_LITERAL,
      caughtSecurityError,
    );

    return null;
  }
};
