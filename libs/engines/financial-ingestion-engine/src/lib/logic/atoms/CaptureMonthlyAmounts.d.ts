/**
 * @section Financial Ingestion - Monthly Amount Capture
 * @description Átomo encargado de transformar las celdas financieras de una fila
 * en registros individuales vinculados a la categoría activa. Implementa un
 * filtro de pureza para evitar el volcado de registros nulos en la nube.
 *
 * Protocolo OEDP-V17.0 - High Performance & Type Safety.
 * SANEADO Zenith: Recalibración de ruta de ADN y erradicación de Readonly Mismatch.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type ExcelJS from 'exceljs';
/**
 * 🛡️ SANEADO Zenith: Ruta corregida para la nueva estructura de carpetas.
 * Se utiliza 'import type' para garantizar el Tree-shaking absoluto.
 */
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';
/**
 * Itera sobre las columnas temporales de una fila y extrae los snapshots financieros.
 *
 * @param currentRowInstance - Fila física bajo auditoría proporcionada por el motor ExcelJS.
 * @param processContext - Referencia al contexto de extracción (Sello de Memoria).
 * @returns {void} Mutación controlada de la colección de registros en el contexto.
 */
export declare const CaptureMonthlyAmounts: (currentRowInstance: ExcelJS.Row, processContext: IExtractionContext) => void;
//# sourceMappingURL=CaptureMonthlyAmounts.d.ts.map