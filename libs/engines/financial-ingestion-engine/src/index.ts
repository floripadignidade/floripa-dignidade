/**
 * @section Financial Ingestion Engine - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el búnker de inteligencia
 * financiera. Orquesta la visibilidad de los contratos de ADN, configuraciones
 * técnicas y flujos de ingesta masiva para el ecosistema Floripa Dignidade.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Verbatim Module Syntax.
 * SANEADO Zenith: Sincronización final tras reingeniería de topología plana.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.0
 * Estatus: Nivelación Zenith completada. Estructura de enjambre (Atoms/Orchestrators)
 * validada y rutas internas sanadas tras la purga de hemorragia de profundidad.
 */
export const MODULE_FINANCIAL_INGESTION_ENGINE_VERSION = '1.2.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 * @description Exportación de contratos inmutables para la validación de
 * registros presupuestarios y purificación de divisas (R$ -> Float).
 */
export {
  FinancialIngestionBatchSchema,
  ProjectFinancialRecordSchema,
} from './lib/schemas/ProjectFinancialLedger.schema';

export type { IProjectFinancialRecord } from './lib/schemas/ProjectFinancialLedger.schema';

/**
 * @section Capa 2: Interfaces de Contexto (Process DNA)
 * @description Exportación de tipos necesarios para el rastro forense y
 * la gestión del estado interno de la máquina de ingesta.
 */
export type { IExtractionContext } from './lib/schemas/ExtractionContext.schema';

/**
 * @section Capa 3: Configuración y Estándares (Ground Truth)
 * @description Exportación de constantes físicas de las plantillas XLSX para
 * auditoría y sincronización de herramientas externas.
 */
export { WORKBOOK_INGESTION_STANDARDS } from './lib/constants/WorkbookIngestion.config';

/**
 * @section Capa 4: Orquestadores de Negocio (High-Level Flows)
 * @description Motores de ejecución que coordinan el enjambre de átomos para
 * realizar tareas complejas de extracción y persistencia cloud.
 */

/** Orquestador encargado de la lectura física y triaje de matrices XLSX. */
export { ExtractWorkbookData } from './lib/logic/orchestrators/ExtractWorkbookData';

/** Orquestador encargado de la sincronización inmutable con el Data Lake. */
export { PersistFinancialLedgerToCloud } from './lib/logic/orchestrators/PersistFinancialLedgerToCloud';
