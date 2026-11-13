/**
 * @section Financial Ingestion - Temporal Axis Identifier
 * @description Átomo de lógica pura encargado de extraer los literales de mes y año
 * desde la fila de cabecera técnica del libro de Excel. Genera el mapa de
 * coordenadas necesario para la captura de montos mensuales.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * SANEADO Zenith: Resolución de TS2503 (Namespace collision) mediante importación
 * de interfaz nombrada 'Row' y cumplimiento de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ SANEADO Zenith: Transición de Namespace a importación nombrada.
 * Alineado con el contrato definido en 'src/index.d.ts'.
 */
import type { Row } from 'exceljs';

/* 1. Infraestructura de Estándares (Ground Truth) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';

/**
 * Analiza una fila física y mapea las columnas con sus literales de tiempo.
 * Implementa el estándar de columnas C a N (3 a 14) definido en la ontología de la ONG.
 *
 * @param headerRowInstance - Instancia de la fila que contiene las etiquetas cronológicas.
 * @returns {Record<number, string>} Mapeo inmutable de [Índice de Columna]: "Mes Año".
 */
export const IdentifyMonthHeaders = (headerRowInstance: Row): Record<number, string> => {
  const monthYearMappingCollection: Record<number, string> = {};

  const { START_COLUMN, END_COLUMN } = WORKBOOK_INGESTION_STANDARDS.TEMPORAL_AXIS_RANGE;

  /**
   * @section Algoritmo de Mapeo de Ejes
   * Recorremos el rango técnico de columnas para identificar los periodos activos.
   */
  for (let columnNumeric = START_COLUMN; columnNumeric <= END_COLUMN; columnNumeric++) {
    /**
     * Capturamos el rastro textual de la celda.
     * SANEADO: El puente garantiza que '.text' es una propiedad válida de 'Cell'.
     */
    const monthYearLiteral = headerRowInstance.getCell(columnNumeric).text?.trim();

    /**
     * Registro de Columna Activa.
     * Solo mapeamos columnas que posean un rastro cronológico explícito.
     */
    if (monthYearLiteral) {
      monthYearMappingCollection[columnNumeric] = monthYearLiteral;
    }
  }

  /** Retorno del mapa de coordenadas sellado. */
  return Object.freeze(monthYearMappingCollection);
};
