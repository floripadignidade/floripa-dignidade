/**
 * @section Financial Ingestion - Row Triage Engine
 * @description Átomo encargado de clasificar la naturaleza de la fila entrante
 * (Categoría vs Profesional) y delegar su procesamiento a los átomos de captura.
 * Actúa como el selector de comportamiento de la máquina de estados de ingesta.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Type Safety.
 * SANEADO Zenith: Erradicación de 'any' mediante puente de mutabilidad controlada.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type ExcelJS from 'exceljs';
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';
/**
 * Analiza la fila física y dispara la acción correspondiente según marcadores institucionales.
 *
 * @param currentRowInstance - Fila física extraída por el motor ExcelJS.
 * @param rowNumberNumeric - Índice de posición en la hoja de cálculo.
 * @param processContext - Memoria de la transacción (Casteada a Mutable internamente).
 */
export declare const TriageContextualRow: (currentRowInstance: ExcelJS.Row, rowNumberNumeric: number, processContext: IExtractionContext) => void;
//# sourceMappingURL=TriageContextualRow.d.ts.map