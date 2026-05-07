/**
 * @section Financial Ingestion - Contextual Workbook Extractor (Orchestrator)
 * @description Orquestador supremo encargado de la lectura física y extracción
 * lógica de matrices XLSX. Coordina el enjambre de átomos de triaje y
 * asegura que el resultado cumpla con el contrato de integridad de la ONG.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Absolute Functional Atomicity.
 * SANEADO Zenith: Reconexión de rutas tras reingeniería y reducción de complejidad a 2.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';
/**
 * @interface IExtractionParameters
 * @description Contrato inmutable para la parametrización de la auditoría de hardware.
 */
interface IExtractionParameters {
    /** Ruta absoluta del archivo XLSX en el sistema de archivos del servidor/CLI. */
    readonly absoluteFilePathLiteral: string;
    /** Identificador opcional para mantener la cadena de custodia si el proceso es disparado por otra lib. */
    readonly correlationIdentifier?: string;
}
/**
 * Ejecuta la extracción purificada de datos financieros desde una matriz física.
 * Implementa el patrón 'Contextual Ingestion' para resolver jerarquías de filas.
 *
 * @param parameters - Rutas y metadatos de ejecución.
 * @returns {Promise<readonly IProjectFinancialRecord[]>} Colección inmutable homologada por Zod.
 * @throws {InternalSystemException} Si el libro es ilegible o el ADN está corrupto.
 */
export declare const ExtractWorkbookData: (parameters: IExtractionParameters) => Promise<readonly IProjectFinancialRecord[]>;
export {};
//# sourceMappingURL=ExtractWorkbookData.d.ts.map