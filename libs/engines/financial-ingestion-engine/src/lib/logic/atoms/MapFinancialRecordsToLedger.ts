/**
 * @section Financial Ingestion - Ledger Data Mapper Orchestrator
 * @description Átomo encargado de transformar una colección de registros financieros
 * al esquema físico de persistencia. Orquesta el enjambre de mapeo individual
 * y garantiza la integridad temporal del lote.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Pulverización de lógica unitaria y reporte de latencia síncrona.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural (Domain Contracts) */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';

/* 2. Infraestructura Core y Utilidades */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/* 3. Sub-átomos de Especialidad */
import { MapProjectFinancialRecordToLedgerRow } from './MapProjectFinancialRecordToLedgerRow';

/**
 * @interface IFinancialLedgerRow
 * @description Representación física inmutable de una fila en la tabla
 * 'project_financial_ledger' de la base de datos soberana.
 */
export interface IFinancialLedgerRow {
  readonly organization_name_literal: string;
  readonly project_name_literal: string;
  readonly specification_category_literal: string;
  readonly reference_month_year_literal: string;
  readonly allocated_amount_numeric: number;
  readonly correlation_id: string;
  readonly last_ingestion_at: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const MAPPER_IDENTIFIER = 'FINANCIAL_LEDGER_MAPPER_ATOM';

/**
 * Transforma una colección de registros purificados en un snapshot listo para la nube.
 * Implementa una función pura y determinística con reporte telemétrico.
 *
 * @param financialRecordsCollection - Lista de registros validados (Inmutable).
 * @param correlationIdentifier - Identificador de trazabilidad forense del proceso.
 * @returns {readonly IFinancialLedgerRow[]} Colección mapeada bajo el estándar físico PostgREST.
 */
export const MapFinancialRecordsToLedger = (
  financialRecordsCollection: readonly IProjectFinancialRecord[],
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): readonly IFinancialLedgerRow[] => {
  // 1. FILTRO DE ATOMICIDAD: Si no hay datos, no hay proceso.
  if (financialRecordsCollection.length === 0) {
    return Object.freeze([]);
  }

  /**
   * @section Captura de Hitos Técnicos
   * Utilizamos una única marca temporal para garantizar el atomismo lógico del lote
   * durante auditorías de series temporales en el Data Lake.
   */
  const currentIngestionTimestampISO = new Date().toISOString();
  const startTimeNumeric = performance.now();

  /**
   * @section Algoritmo de Mapeo (Transformation Swarm)
   * Delegamos el mapeo de cada registro al sub-átomo de especialidad.
   */
  const mappedLedgerRowsCollection: IFinancialLedgerRow[] = financialRecordsCollection.map(
    (recordSnapshot) =>
      MapProjectFinancialRecordToLedgerRow(
        recordSnapshot,
        currentIngestionTimestampISO,
        correlationIdentifier,
      ),
  );

  // 2. REPORTE DE MÉTRICAS SÍNCRONAS (SRE Visibility)
  const executionLatencyInMillisecondsQuantity = performance.now() - startTimeNumeric;

  void EmitTelemetrySignal({
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: MAPPER_IDENTIFIER,
    operationCodeLiteral: 'DATA_MAPPING_NOMINAL',
    correlationIdentifier,
    messageContentLiteral: 'Transformación de ADN financiero a esquema de Ledger finalizada.',
    executionLatencyInMillisecondsQuantity,
    contextMetadataSnapshot: {
      processedRecordsQuantity: financialRecordsCollection.length,
      timestampISO: currentIngestionTimestampISO,
    },
  });

  /**
   * 🛡️ SANEADO Zenith: Sellado de la colección.
   * Garantizamos que la salida sea inalterable para el despachador de red.
   */
  return Object.freeze(mappedLedgerRowsCollection);
};
