/**
 * @section Telemetry Logic - LocalStorage Retrieval Atom
 * @description Átomo encargado de la extracción y validación de rastro desde el hardware.
 *
 * Protocolo OEDP-V17.0 - Zod Sovereign DNA.
 */

import { TelemetrySignalSchema } from '../../schemas/TelemetrySignal.schema';
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
import { GetLocalStorageSafeReference } from './internal/GetLocalStorageSafeReference';
import { SOVEREIGN_STORAGE_CONFIGURATION } from './internal/SovereignStorageConfiguration';

/**
 * Recupera todas las señales pendientes de la bóveda local.
 *
 * @returns {ITelemetrySignal[]} Colección de señales validadas por la Aduana Zod.
 */
export const RetrieveTelemetryBatchFromLocalStorage = (): ITelemetrySignal[] => {
  const localStorageReference = GetLocalStorageSafeReference();

  if (!localStorageReference) {
    return [];
  }

  const rawVaultDataLiteral = localStorageReference.getItem(
    SOVEREIGN_STORAGE_CONFIGURATION.VAULT_KEY_LITERAL,
  );

  if (!rawVaultDataLiteral) {
    return [];
  }

  try {
    const parsedCollection = JSON.parse(rawVaultDataLiteral);

    if (!Array.isArray(parsedCollection)) {
      return [];
    }

    /**
     * 🛡️ ADUANA DE ADN: Validamos cada registro recuperado del disco local
     * para asegurar que el rastro no haya sido contaminado.
     */
    return parsedCollection
      .map((signalSnapshot) => {
        const result = TelemetrySignalSchema.safeParse(signalSnapshot);
        return result.success ? result.data : null;
      })
      .filter((item): item is ITelemetrySignal => item !== null);
  } catch (_caughtParseError: unknown) {
    return [];
  }
};
