/**
 * @section Shared State Store - Persistence Configuration Constants (Atom)
 * @description Única Fuente de Verdad (SSOT) para la clave física de almacenamiento local,
 * claves legadas sujetas a migración transparente y versión de esquema persistido (ADR 0025).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @name STATE_STORE_CONFIGURATION
 * @description Parámetros inmutables de persistencia en cliente para el almacén global.
 */
export const STATE_STORE_CONFIGURATION = Object.freeze({
  /** Clave canónica vigente en `localStorage` bajo nomenclatura técnica OEDP-V18.1. */
  PERSISTENCE_STORAGE_KEY_LITERAL: 'floripa-dignidade-state-store',

  /** Claves históricas desde las cuales migrar datos de forma transparente en la primera lectura. */
  LEGACY_STORAGE_KEYS_COLLECTION: Object.freeze(['fd-sovereign-vault-v2']),

  /** Versión estructural actual del contrato persistido (`PersistedStateSnapshotSchema`). */
  SCHEMA_VERSION_QUANTITY: 3,
});
