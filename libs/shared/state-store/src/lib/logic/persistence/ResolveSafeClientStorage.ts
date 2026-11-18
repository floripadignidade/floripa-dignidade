/**
 * @file libs/shared/state-store/src/lib/logic/persistence/ResolveSafeClientStorage.ts
 * @section Shared State Store - Safe Isomorphic Client Storage Adapter (Orchestrator)
 * @description Orquestador de adaptador `StateStorage` para Zustand `persist`. Evita el
 * acceso a `localStorage` en SSR/Edge (eliminando advertencias de Node.js), protege
 * contra `SecurityError`/`QuotaExceededError`, delega migración legada y emite
 * telemetría SRE mediante átomos especializados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Tolerancia a Fallos).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { StateStorage } from 'zustand/middleware';

import { EmitStorageHardwareWarning } from './atoms/EmitStorageHardwareWarning';
import { ReadStorageWithLegacyMigration } from './atoms/ReadStorageWithLegacyMigration';
import { ResolveBrowserLocalStorage } from './atoms/ResolveBrowserLocalStorage';

const NOOP_SERVER_STORAGE_ADAPTER: StateStorage = Object.freeze({
  getItem: (): null => null,
  setItem: (): void => undefined,
  removeItem: (): void => undefined,
});

/**
 * Resuelve el adaptador `StateStorage` seguro según el entorno de ejecución (Navegador o SSR).
 *
 * @returns {StateStorage} Implementación resiliente libre de excepciones no contenidas.
 */
export const ResolveSafeClientStorage = (): StateStorage => {
  const browserStorageReference = ResolveBrowserLocalStorage();
  if (browserStorageReference === null) {
    return NOOP_SERVER_STORAGE_ADAPTER;
  }

  return {
    getItem: (storageKeyLiteral: string): string | null => {
      try {
        return ReadStorageWithLegacyMigration(browserStorageReference, storageKeyLiteral);
      } catch (caughtReadError: unknown) {
        EmitStorageHardwareWarning('STORAGE_READ_FAULT', storageKeyLiteral, caughtReadError);
        return null;
      }
    },

    setItem: (storageKeyLiteral: string, serializedValueLiteral: string): void => {
      try {
        browserStorageReference.setItem(storageKeyLiteral, serializedValueLiteral);
      } catch (caughtWriteError: unknown) {
        EmitStorageHardwareWarning('STORAGE_WRITE_FAULT', storageKeyLiteral, caughtWriteError);
      }
    },

    removeItem: (storageKeyLiteral: string): void => {
      try {
        browserStorageReference.removeItem(storageKeyLiteral);
      } catch (caughtRemoveError: unknown) {
        EmitStorageHardwareWarning('STORAGE_REMOVE_FAULT', storageKeyLiteral, caughtRemoveError);
      }
    },
  };
};
