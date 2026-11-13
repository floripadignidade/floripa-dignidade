/**
 * @section Shared State Store - Safe Isomorphic Client Storage Adapter (Atom)
 * @description Provee una implementación segura de `StateStorage` para Zustand `persist`.
 * Evita accesos a `window.localStorage` durante renderizado en servidor (SSR/Edge),
 * protege contra `SecurityError`/`QuotaExceededError`, migra claves legadas sin pérdida
 * de datos y emite telemetría conforme a `TelemetrySignalSchema` ante fallos de hardware.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Tolerancia a Fallos).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';
import type { StateStorage } from 'zustand/middleware';

import { STATE_STORE_CONFIGURATION } from '../../constants/StateStoreConfiguration';

const STORAGE_ADAPTER_MODULE_IDENTIFIER = 'STATE_STORE_STORAGE_ADAPTER' as ModuleIdentifier;

const NOOP_SERVER_STORAGE_ADAPTER: StateStorage = Object.freeze({
  getItem: (): null => null,
  setItem: (): void => undefined,
  removeItem: (): void => undefined,
});

const emitStorageIoWarningAction = (
  operationCodeLiteral: string,
  storageKeyLiteral: string,
  caughtError: unknown,
): void => {
  const errorDescriptionLiteral =
    caughtError instanceof Error ? caughtError.message : String(caughtError);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: STORAGE_ADAPTER_MODULE_IDENTIFIER,
    operationCodeLiteral: operationCodeLiteral as OperationCode,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: `Incidencia controlada en almacenamiento local [${operationCodeLiteral}].`,
    semanticIntentTag: 'LOCAL_STORAGE_IO_WARNING',
    contextMetadataSnapshot: {
      storageKeyLiteral,
      errorDescriptionLiteral,
    },
  });
};

const resolveBrowserLocalStorageReference = (): Storage | null => {
  if (typeof globalThis === 'undefined' || !('localStorage' in globalThis)) {
    return null;
  }

  try {
    return globalThis.localStorage;
  } catch (caughtSecurityError: unknown) {
    emitStorageIoWarningAction(
      'STORAGE_HARDWARE_ACCESS_DENIED',
      STATE_STORE_CONFIGURATION.PERSISTENCE_STORAGE_KEY_LITERAL,
      caughtSecurityError,
    );
    return null;
  }
};

const readWithLegacyMigrationAction = (
  browserStorageReference: Storage,
  storageKeyLiteral: string,
): string | null => {
  const currentSerializedValue = browserStorageReference.getItem(storageKeyLiteral);
  if (currentSerializedValue !== null) {
    return currentSerializedValue;
  }

  for (const legacyKeyLiteral of STATE_STORE_CONFIGURATION.LEGACY_STORAGE_KEYS_COLLECTION) {
    const legacySerializedValue = browserStorageReference.getItem(legacyKeyLiteral);
    if (legacySerializedValue !== null) {
      browserStorageReference.setItem(storageKeyLiteral, legacySerializedValue);
      browserStorageReference.removeItem(legacyKeyLiteral);
      return legacySerializedValue;
    }
  }

  return null;
};

/**
 * Resuelve el adaptador `StateStorage` seguro según el entorno de ejecución (Navegador o SSR).
 *
 * @returns {StateStorage} Implementación resiliente libre de excepciones no contenidas.
 */
export const ResolveSafeClientStorage = (): StateStorage => {
  const browserStorageReference = resolveBrowserLocalStorageReference();
  if (browserStorageReference === null) {
    return NOOP_SERVER_STORAGE_ADAPTER;
  }

  return {
    getItem: (storageKeyLiteral: string): string | null => {
      try {
        return readWithLegacyMigrationAction(browserStorageReference, storageKeyLiteral);
      } catch (caughtReadError: unknown) {
        emitStorageIoWarningAction('STORAGE_READ_FAULT', storageKeyLiteral, caughtReadError);
        return null;
      }
    },

    setItem: (storageKeyLiteral: string, serializedValueLiteral: string): void => {
      try {
        browserStorageReference.setItem(storageKeyLiteral, serializedValueLiteral);
      } catch (caughtWriteError: unknown) {
        emitStorageIoWarningAction('STORAGE_WRITE_FAULT', storageKeyLiteral, caughtWriteError);
      }
    },

    removeItem: (storageKeyLiteral: string): void => {
      try {
        browserStorageReference.removeItem(storageKeyLiteral);
      } catch (caughtRemoveError: unknown) {
        emitStorageIoWarningAction('STORAGE_REMOVE_FAULT', storageKeyLiteral, caughtRemoveError);
      }
    },
  };
};
