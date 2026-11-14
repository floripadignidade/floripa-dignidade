/**
 * @section Territorial Module - Master Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el módulo de inteligencia
 * territorial. Centraliza contratos de entidades geográficas, protocolos del IBGE,
 * contratos lingüísticos, utilidades de normalización toponímica y el orquestador
 * de sincronización bajo arquitectura Source-First.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Modularidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión técnica sincronizada tras la nivelación de rutas limpias para Turbopack. */
export const TERRITORIAL_ENGINE_VERSION = '1.2.1';

/**
 * @section 1. Contratos de Entidad Territorial (SSOT)
 */
export {
  AdministrativeHierarchySchema,
  GeographicCoordinatesSchema,
  TerritorialEntitySchema,
  TerritorialTechnicalIdentifierSchema,
} from './lib/schemas/TerritorialEntity.schema';

export type {
  ITerritorialEntity,
  TAdministrativeHierarchy,
  TGeographicCoordinates,
  TTerritorialTechnicalIdentifier,
} from './lib/schemas/TerritorialEntity.schema';

/**
 * @section 2. Protocolos Externos IBGE
 */
export {
  IbgeDistrictCollectionSchema,
  IbgeDistrictRawResponseSchema,
} from './lib/schemas/IbgeTerritorialProtocols.schema';

export type {
  IIbgeDistrictCollection,
  IIbgeDistrictRawResponse,
} from './lib/schemas/IbgeTerritorialProtocols.schema';

/**
 * @section 3. Contratos Lingüísticos (i18n)
 */
export { TerritorialEngineI18nSchema } from './lib/i18n/TerritorialEngineI18n.schema';

export type { ITerritorialEngineI18n } from './lib/i18n/TerritorialEngineI18n.schema';

/**
 * @section 4. Utilidades Atómicas y Orquestadores
 */
export { SanitizeTerritoryName } from './lib/logic/atomic/SanitizeTerritoryName';
export { SyncFlorianopolisTerritorialData } from './lib/logic/SyncFlorianopolisTerritorialData';
