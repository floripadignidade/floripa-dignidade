/**
 * @section PMF Open Data Engine - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el búnker de inteligencia
 * de datos abiertos. Orquesta la visibilidad de los contratos de ADN, esquemas
 * de validación gubernamental y motores de auditoría fiscal.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Bundler-Ready Syntax.
 * SANEADO Zenith: Sincronización nominal de identidades fiscales (TProviderTaxIdentifier).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.1
 * Estatus: Nivelación Zenith completada. Grafo de tipos unificado.
 */
export const MODULE_PMF_OPEN_DATA_ENGINE_VERSION = '1.3.1';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 */

// 1.1. Protocolo de Red Gubernamental (E-Pública Raw)
export {
  EPublicaApiResponseSchema,
  EPublicaExpenseSchema,
  EPublicaMovementSchema,
} from './lib/schemas/protocol/EPublicaExpense.schema';

export type {
  IEPublicaApiResponse,
  IEPublicaExpenseRaw,
  IEPublicaMovementSnapshot,
} from './lib/schemas/protocol/EPublicaExpense.schema';

// 1.2. Contratos Soberanos (Sovereign Data Normalized)
/**
 * 🛡️ INTEGRIDAD SOBERANA: Exportación de contratos nominales (Branded Types).
 */
export {
  PublicExpenditureIdentifierSchema,
  ProviderTaxIdentifierSchema,
  PublicExpenditureSchema,
  TerritorialTechnicalIdentifierSchema,
} from './lib/schemas/sovereign/PublicExpenditure.schema';

export type {
  TPublicExpenditureIdentifier,
  IPublicExpenditure,
  TProviderTaxIdentifier,
  TTerritorialTechnicalIdentifier,
} from './lib/schemas/sovereign/PublicExpenditure.schema';

/**
 * @section Capa 2: Almas Lingüísticas (Internationalization)
 */
export { PmfOpenDataI18nSchema } from './lib/i18n/PmfOpenDataI18n.schema';
export type { IPmfOpenDataI18n } from './lib/i18n/PmfOpenDataI18n.schema';

/**
 * @section Capa 3: Motores de Lógica y Orquestadores (Swarm Intelligence)
 */
export { IngestMunicipalityData } from './lib/logic/orchestrators/MunicipalityDataIngestor';
export { SyncMunicipalityExpenditure } from './lib/logic/orchestrators/SyncMunicipalityExpenditure';
export { SovereignPersistenceSentry } from './lib/logic/orchestrators/SovereignPersistenceSentry';
export { FetchRawEPublicaData } from './lib/logic/atomic/fetchers/FetchRawEPublicaData';

/**
 * @section Capa 4: Interfaces de Parametrización
 */
export type { IEPublicaFetchParameters } from './lib/logic/atomic/fetchers/FetchRawEPublicaData';
export type { ISyncExpenditureParameters } from './lib/logic/orchestrators/SyncMunicipalityExpenditure';
