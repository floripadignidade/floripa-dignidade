/**
 * @section Territorial Engine - Package Entry Point
 * @description Puerta de enlace soberana para el búnker de inteligencia territorial.
 * Expone contratos de ADN, utilidades de saneamiento y orquestadores de sincronización.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Zenith Standard.
 */

/**
 * @section ADN ESTRUCTURAL (Contracts)
 * Exportación explícita para garantizar la visibilidad de tipos bridados (Brands).
 */
export {
  TerritorialEntitySchema,
  TerritorialTechnicalIdentifierSchema,
  AdministrativeHierarchySchema,
  GeographicCoordinatesSchema,
} from './lib/schemas/TerritorialEntity.schema.js';

/** 🛡️ EXPORTACIONES NOMINALES: Resolución de TS2305 en motores externos */
export type {
  ITerritorialEntity,
  TTerritorialTechnicalIdentifier, // Sello de identidad para Open Data
  TAdministrativeHierarchy,
  TGeographicCoordinates,
} from './lib/schemas/TerritorialEntity.schema.js';

export * from './lib/schemas/IbgeTerritorialProtocols.schema.js';
export * from './lib/i18n/TerritorialEngineI18n.schema.js';

/**
 * @section UTILIDADES ATÓMICAS (Shared Logic)
 */
export { SanitizeTerritoryName } from './lib/logic/atomic/SanitizeTerritoryName.js';

/**
 * @section MOTORES DE LÓGICA (Orchestrators)
 */
export { SyncFlorianopolisTerritorialData } from './lib/logic/SyncFlorianopolisTerritorialData.js';

/**
 * Versión de búnker alineada con la arquitectura Zenith.
 */
export const TERRITORIAL_ENGINE_VERSION = '1.2.0';
