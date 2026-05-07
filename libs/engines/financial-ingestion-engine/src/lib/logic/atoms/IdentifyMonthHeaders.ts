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

/* 1. Infraestructura de Estándares */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';

/**
 * Analiza una fila física y mapea las columnas con sus literales de tiempo.
 * Implementa el estándar de columnas C a N (3 a 14) definido por la ONG.
 *
 * @param headerRowInstance - Instancia de la fila de ExcelJS que contiene los meses.
 * @returns {Record<number, string>} Mapeo inmutable de [Índice de Columna]: "Mes Año".
 */
export const IdentifyMonthHeaders = (
  headerRowInstance: ExcelJS.Row
): Record<number, string> => {
  const headersMapping: Record<number, string> = {};

  const { START_COLUMN, END_COLUMN } = WORKBOOK_INGESTION_STANDARDS.TEMPORAL_AXIS_RANGE;

  /**
   * @section Algoritmo de Mapeo de Ejes
   * Recorremos el rango técnico de columnas para identificar los periodos activos.
   */
  for (
    let columnNumeric = START_COLUMN;
    columnNumeric <= END_COLUMN;
    columnNumeric++
  ) {
    const monthYearLiteral = headerRowInstance.getCell(columnNumeric).text?.trim();

    /**
     * Solo registramos columnas que posean un literal de tiempo,
     * permitiendo que la plantilla tenga meses vacíos sin romper el mapeo.
     */
    if (monthYearLiteral) {
      headersMapping[columnNumeric] = monthYearLiteral;
    }
  }

  return headersMapping;
};
