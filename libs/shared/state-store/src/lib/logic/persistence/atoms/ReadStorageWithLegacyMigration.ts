/**
 * @file libs/shared/state-store/src/lib/logic/persistence/atoms/ReadStorageWithLegacyMigration.ts
 * @section Shared State Store - Legacy Storage Migration Reader (Atom)
 * @description Átomo de lógica pura encargado de leer la clave canónica vigente en
 * `localStorage` o migrar de forma transparente desde claves históricas declaradas en
 * `STATE_STORE_CONFIGURATION.LEGACY_STORAGE_KEYS_COLLECTION`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { STATE_STORE_CONFIGURATION } from '../../../constants/StateStoreConfiguration';

/**
 * Lee el estado serializado aplicando migración transparente de claves históricas.
 *
 * @param browserStorageReference - Referencia `Storage` validada del navegador.
 * @param storageKeyLiteral - Clave canónica activa de almacenamiento local.
 * @returns {string | null} Cadena JSON serializada o `null` si no existe snapshot previo.
 */
export const ReadStorageWithLegacyMigration = (
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
