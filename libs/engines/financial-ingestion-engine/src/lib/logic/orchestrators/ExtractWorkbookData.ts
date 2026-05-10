/**
 * @section Financial Ingestion - Contextual Workbook Extractor (Orchestrator)
 * @description Orquestador supremo encargado de la lectura física y extracción
 * lógica de matrices XLSX. Coordina el enjambre de átomos de triaje y
 * asegura que el resultado cumpla con el contrato de integridad de la ONG.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Sincronización con Puente Soberano (Row/Worksheet),
 * pulverización de sub-procesos y reporte de telemetría de hardware.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Workbook } from 'exceljs';
import type { Row, Worksheet } from 'exceljs';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Estándares (Ground Truth) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { IdentifyMonthHeaders } from '../atoms/IdentifyMonthHeaders';
import { TriageContextualRow } from '../atoms/TriageContextualRow';
import { InitializeExtractionContext } from './atoms/InitializeExtractionContext';
import { ValidateExtractedBatchADN } from './atoms/ValidateExtractedBatchADN';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'FINANCIAL_WORKBOOK_ORCHESTRATOR';

/**
 * @interface IExtractionParameters
 * @description Contrato inmutable para la parametrización de la auditoría de hardware.
 */
interface IExtractionParameters {
  readonly absoluteFilePathLiteral: string;
  readonly correlationIdentifier?: string;
}

/**
 * Ejecuta la extracción purificada de datos financieros desde una matriz física.
 * Implementa el patrón 'Contextual Ingestion' con aislamiento de hardware I/O.
 *
 * @param parameters - Rutas y metadatos de ejecución.
 * @returns {Promise<readonly IProjectFinancialRecord[]>} Lote financiero inmutable.
 */
export const ExtractWorkbookData = async (
  parameters: IExtractionParameters,
): Promise<readonly IProjectFinancialRecord[]> => {
  const correlationIdentifier = parameters.correlationIdentifier ?? GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_WORKBOOK_INGESTION_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // 1. CARGA DE HARDWARE (I/O Sentry)
        const workbookInstance = new Workbook();
        await workbookInstance.xlsx.readFile(parameters.absoluteFilePathLiteral);

        const targetWorksheet: Worksheet | undefined = workbookInstance.worksheets[0];

        if (!targetWorksheet) {
          throw new InternalSystemException('WORKSHEET_IDENTIFICATION_FAULT', {
            targetFile: parameters.absoluteFilePathLiteral
          });
        }

        // 2. MAPEO CRONOLÓGICO (Temporal Axis)
        const headerRowIndexNumeric = WORKBOOK_INGESTION_STANDARDS.HEADER_ROW_INDEX_QUANTITY;
        const monthHeadersMapping = IdentifyMonthHeaders(targetWorksheet.getRow(headerRowIndexNumeric));

        // 3. INICIALIZACIÓN DE MEMORIA (Delegación Atómica)
        const extractionContext = InitializeExtractionContext(monthHeadersMapping, correlationIdentifier);

        // 4. ESCANEO POR ENJAMBRE (Hardware Iteration)
        /**
         * 🛡️ SANEADO Zenith: Uso de tipos nominales 'Row' provenientes del puente.
         * Garantiza que el callback sea 100% Type-Safe ante el motor de ExcelJS.
         */
        targetWorksheet.eachRow((currentRowInstance: Row, rowNumberNumeric: number) => {
          TriageContextualRow(currentRowInstance, rowNumberNumeric, extractionContext);
        });

        // 5. ADUANA DE ADN FINAL (Lote Validation)
        const finalSovereignBatch = ValidateExtractedBatchADN(extractionContext.recordsCollection);

        // 6. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'WORKBOOK_EXTRACTION_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Extracción física de matriz presupuestaria finalizada.',
          /** Clasificación para el Neural Sentinel */
          semanticIntentTag: 'FINANCIAL_DATA_ACQUISITION',
          contextMetadataSnapshot: {
            extractedRecordsQuantity: finalSovereignBatch.length,
            sourceFileLiteral: parameters.absoluteFilePathLiteral
          }
        });

        return finalSovereignBatch;

      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)

        // Si es una excepción interna ya tipada, se propaga intacta.
        if (caughtError instanceof InternalSystemException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        throw new InternalSystemException('WORKBOOK_ORCHESTRATION_FAULT', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          targetFileLiteral: parameters.absoluteFilePathLiteral
        });
      }
    },
  );
};
