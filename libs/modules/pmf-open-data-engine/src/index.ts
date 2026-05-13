/**
 * @section PMF Open Data Engine - Package Entry Point (Barrel Master)
 * @description Único punto de exportación autorizado para el búnker de inteligencia
 * de datos abiertos. Orquesta la visibilidad de los contratos de ADN, esquemas
 * de validación gubernamental y motores de auditoría fiscal para el enjambre.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ESM Strict Syntax.
 * SANEADO Zenith: Resolución de TS2305 (Sincronización ISO de Parámetros),
 * inyección de extensiones '.js' y visibilidad de métricas de fidelidad.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.4.0
 * Estatus: Nivelación Zenith completada. Grafo de tipos unificado y
 * compatible con la arquitectura de enjambre concurrente.
 */
export const MODULE_PMF_OPEN_DATA_ENGINE_VERSION = '1.4.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 * @description Exportación de contratos inalterables para la validación de protocolos.
 */

// 1.1. Protocolo de Red Gubernamental (E-Pública Raw)
/** 🛡️ SANEADO Zenith: Resolución de rutas mediante extensiones obligatorias. */
export {
  EPublicaApiResponseSchema,
  EPublicaExpenseSchema,
  EPublicaMovementSchema,
} from './lib/schemas/protocol/EPublicaExpense.schema.js';

export type {
  IEPublicaApiResponse,
  IEPublicaExpenseRaw,
  IEPublicaMovementSnapshot,
} from './lib/schemas/protocol/EPublicaExpense.schema.js';

// 1.2. Contratos Soberanos (Sovereign Data Normalized)
export {
  PublicExpenditureIdentifierSchema,
  ProviderTaxIdentifierSchema,
  PublicExpenditureSchema,
  TerritorialTechnicalIdentifierSchema,
} from './lib/schemas/sovereign/PublicExpenditure.schema.js';

export type {
  IPublicExpenditure,
  TProviderTaxIdentifier,
  TPublicExpenditureIdentifier,
  TTerritorialTechnicalIdentifier,
} from './lib/schemas/sovereign/PublicExpenditure.schema.js';

/**
 * @section Capa 2: Almas Lingüísticas (Internationalization)
 */
export { PmfOpenDataI18nSchema } from './lib/i18n/PmfOpenDataI18n.schema.js';
export type { IPmfOpenDataI18n } from './lib/i18n/PmfOpenDataI18n.schema.js';

/**
 * @section Capa 3: Motores de Lógica y Orquestadores (Swarm Intelligence)
 * @description Motores de ejecución coordinada para la ingesta y persistencia.
 */
export { IngestMunicipalityData } from './lib/logic/orchestrators/MunicipalityDataIngestor.js';
export { SyncMunicipalityExpenditure } from './lib/logic/orchestrators/SyncMunicipalityExpenditure.js';
export { SovereignPersistenceSentry } from './lib/logic/orchestrators/SovereignPersistenceSentry.js';
export { FetchRawEPublicaData } from './lib/logic/atomic/fetchers/FetchRawEPublicaData.js';

/**
 * @section Capa 4: Interfaces de Parametrización y Métricas
 * @description Tipado para la orquestación de flujos y auditoría de fidelidad.
 */
export type { IEPublicaFetchParameters } from './lib/logic/atomic/fetchers/FetchRawEPublicaData.js';

/** 🛡️ SANEADO Zenith (Fix TS2305): Sincronización con el nombre ISO nivelado. */
export type {
  ISyncMunicipalityExpenditureParameters
} from './lib/logic/atomic/schemas/SyncMunicipalityExpenditure.schema.js';

/** 🛡️ SANEADO Zenith: Exposición del contrato de fidelidad para el Neural Sentinel. */
export type {
  IIngestionFidelityMetrics
} from './lib/logic/atomic/mappers/CalculateIngestionFidelity.js';
