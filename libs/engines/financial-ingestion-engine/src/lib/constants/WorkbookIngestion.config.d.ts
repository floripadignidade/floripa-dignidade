/**
 * @section Financial Ingestion - Standards Configuration
 * @description Define las constantes físicas de las plantillas XLSX de la ONG.
 */
export declare const WORKBOOK_INGESTION_STANDARDS: {
    /** Fila donde residen los literales de meses/años. */
    readonly HEADER_ROW_INDEX_QUANTITY: 8;
    /** Rango de columnas técnicas (C a N). */
    readonly TEMPORAL_AXIS_RANGE: {
        readonly START_COLUMN: 3;
        readonly END_COLUMN: 14;
    };
    /** Marcadores visuales de la plantilla. */
    readonly MARKERS: {
        readonly CURRENCY_SYMBOL: "R$";
        readonly HUMAN_EXECUTION_CHECK: "✓";
    };
};
//# sourceMappingURL=WorkbookIngestion.config.d.ts.map