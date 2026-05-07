/**
 * @section Financial Ingestion - Temporal Axis Identifier
 * @description Átomo de lógica pura encargado de extraer los literales de mes y año
 * desde la fila de cabecera técnica del libro de Excel. Proporciona el mapa
 * de coordenadas para la captura de montos.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type ExcelJS from 'exceljs';
/**
 * Analiza una fila física y mapea las columnas con sus literales de tiempo.
 * Implementa el estándar de columnas C a N (3 a 14) definido por la ONG.
 *
 * @param headerRowInstance - Instancia de la fila de ExcelJS que contiene los meses.
 * @returns {Record<number, string>} Mapeo inmutable de [Índice de Columna]: "Mes Año".
 */
export declare const IdentifyMonthHeaders: (headerRowInstance: ExcelJS.Row) => Record<number, string>;
//# sourceMappingURL=IdentifyMonthHeaders.d.ts.map