/**
 * @section Telemetry Logic - LocalStorage Persistence Atom
 * @description Átomo encargado de la inyección física de señales en el disco local.
 * Implementa la política de poda (Pruning) para garantizar la salud del hardware.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 * @author Raz Podestá - MetaShark Tech
 */

import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
import { GetLocalStorageSafeReference } from './internal/GetLocalStorageSafeReference';
import { SOVEREIGN_STORAGE_CONFIGURATION } from './internal/SovereignStorageConfiguration';

/**
 * Guarda una colección de señales en el hardware del ciudadano.
 * Realiza un ciclo de lectura-fusión-escritura atómico.
 *
 * @param telemetrySignalsCollection - Lote de señales para salvaguardar.
 * @returns {void}
 */
export const PersistTelemetrySignalsToLocalStorage = (
  telemetrySignalsCollection: ITelemetrySignal[],
): void => {
  const localStorageReference = GetLocalStorageSafeReference();

  if (!localStorageReference) {
    return;
  }

  try {
    const existingVaultDataLiteral = localStorageReference.getItem(
      SOVEREIGN_STORAGE_CONFIGURATION.VAULT_KEY_LITERAL,
    );

    let updatedSignalsCollection: ITelemetrySignal[] = [];

    if (existingVaultDataLiteral) {
      const parsedData = JSON.parse(existingVaultDataLiteral);
      if (Array.isArray(parsedData)) {
        updatedSignalsCollection = [...parsedData];
      }
    }

    updatedSignalsCollection.push(...telemetrySignalsCollection);

    const serializedDataLiteral = JSON.stringify(updatedSignalsCollection);

    /**
     * @section Gestión de Cuota (Emergency Pruning)
     * Si el rastro excede el límite físico, truncamos preservando la evidencia reciente.
     */
    if (
      serializedDataLiteral.length > SOVEREIGN_STORAGE_CONFIGURATION.MAXIMUM_BYTE_CAPACITY_QUANTITY
    ) {
      const prunedCollection = updatedSignalsCollection.slice(
        -SOVEREIGN_STORAGE_CONFIGURATION.PRUNING_RETENTION_QUANTITY,
      );

      localStorageReference.setItem(
        SOVEREIGN_STORAGE_CONFIGURATION.VAULT_KEY_LITERAL,
        JSON.stringify(prunedCollection),
      );
      return;
    }

    localStorageReference.setItem(
      SOVEREIGN_STORAGE_CONFIGURATION.VAULT_KEY_LITERAL,
      serializedDataLiteral,
    );
  } catch (_caughtHardwareError: unknown) {
    /** 🛡️ Silencio Operativo: La telemetría nunca debe bloquear el hilo principal. */
  }
};
