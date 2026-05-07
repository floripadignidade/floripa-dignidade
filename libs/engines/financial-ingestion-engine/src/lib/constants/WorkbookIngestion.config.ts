/**
 * @section Financial Ingestion - Standards Configuration
 * @description Define las constantes físicas de las plantillas XLSX de la ONG.
 */
export const WORKBOOK_INGESTION_STANDARDS = {
  /** Fila donde residen los literales de meses/años. */
  HEADER_ROW_INDEX_QUANTITY: 8,

  /** Rango de columnas técnicas (C a N). */
  TEMPORAL_AXIS_RANGE: {
    START_COLUMN: 3,
    END_COLUMN: 14
  },

  /** Marcadores visuales de la plantilla. */
  MARKERS: {
    CURRENCY_SYMBOL: 'R$',
    HUMAN_EXECUTION_CHECK: '✓'
  }
} as const;
