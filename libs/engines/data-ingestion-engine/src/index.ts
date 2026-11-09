/**
 * @section Municipal Open Data & Fiscal Ingestion - Package Master Barrel
 * @description Único punto de exportación autorizado para el motor de ingestión
 * y normalización de datos abiertos municipales e indicadores de gasto público.
 * Expone el orquestador de sincronización fiscal, los esquemas de validación de
 * parámetros y re-exporta los contratos de datos presupuestarios institucionales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Modularidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.1
 * Identificador de versión sincronizado con package.json.
 */
export const DATA_INGESTION_ENGINE_VERSION = '1.2.1';

/**
 * @section 1. Orquestadores de Sincronización Fiscal
 * Flujo principal de captura, validación perimetral y normalización de cuentas públicas.
 */
export {
  SyncMunicipalityExpenditure,
  SyncMunicipalityExpenditureParametersSchema,
} from './lib/logic/orchestrators/SyncMunicipalityExpenditure';

export type {
  ISyncMunicipalityExpenditureParameters,
} from './lib/logic/orchestrators/SyncMunicipalityExpenditure';

/**
 * @section 2. Contratos Centralizados de Dominio Presupuestario
 * Re-exportación de contratos de Verdad Única (SSOT) para garantizar compatibilidad
 * absoluta y desacoplamiento en las aplicaciones consumidoras del ecosistema.
 */
export {
  PublicExpenditureSchema,
  PublicExpenditureIdentifierSchema,
  ProviderTaxIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
  FunctionalCategorySchema,
  ProviderMetadataSchema,
  ExpenditureAuditMetadataSchema,
} from '@floripa-dignidade/contracts';

export type {
  IPublicExpenditure,
  TPublicExpenditureIdentifier,
  TProviderTaxIdentifier,
  TTerritorialTechnicalIdentifier,
} from '@floripa-dignidade/contracts';