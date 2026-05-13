/**
 * @section Financial Ingestion - Contextual Workbook Extractor (Orchestrator)
 * @description Orquestador supremo encargado de la extracción lógica de matrices XLSX.
 * Coordina el enjambre de átomos de I/O, triaje y aduanas de ADN para garantizar
 * que la evidencia presupuestaria cumpla con el estándar de integridad de la ONG.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Pulverización de hardware I/O y bucles de escaneo en sub-átomos.
 * Complejidad ciclomática reducida a 1 (Pure Flow Pattern).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { Workbook } from 'exceljs';
import type { Row, Worksheet } from 'exceljs';

/* 1. Infraestructura Core & Excepciones (Clean Paths) */
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. ADN Estructural y Estándares (Ground Truth) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/* 3. Enjambre Atómico Local (Swiss-Watch Swarm) */
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
export interface IExtractionParameters {
  readonly absoluteFilePathLiteral: string;
  readonly correlationIdentifier?: string;
}

/**
 * @private Sub-Aparato: Aislamiento de Hardware (I/O Sentry)
 * @description Extrae la lógica de lectura física del disco y validación inicial de la hoja.
 */
const loadWorksheetFromHardware = async (absoluteFilePathLiteral: string): Promise<Worksheet> => {
  const workbookInstance = new Workbook();
  await workbookInstance.xlsx.readFile(absoluteFilePathLiteral);

  const targetWorksheetSnapshot: Worksheet | undefined = workbookInstance.worksheets[0];

  if (!targetWorksheetSnapshot) {
    throw new InternalSystemException('WORKSHEET_IDENTIFICATION_FAULT', {
      targetFileLiteral: absoluteFilePathLiteral
    });
  }

  return targetWorksheetSnapshot;
};

/**
 * @private Sub-Aparato: Escáner de Enjambre (Swarm Iterator)
 * @description Extrae el bucle de iteración física aislando el orquestador de la librería exceljs.
 */
const processWorksheetRows = (
  targetWorksheetSnapshot: Worksheet,
  extractionContext: IExtractionContext
): void => {
  targetWorksheetSnapshot.eachRow((currentRowInstance: Row, rowNumberNumeric: number) => {
    TriageContextualRow(currentRowInstance, rowNumberNumeric, extractionContext);
  });
};

/**
 * Ejecuta la extracción purificada de datos financieros desde una matriz física.
 * Implementa el patrón 'Pure Flow Orchestration' con delegación atómica absoluta.
 *
 * @param parametersSnapshot - Rutas y metadatos de ejecución.
 * @returns {Promise<readonly IProjectFinancialRecord[]>} Lote financiero inmutable.
 * @throws {InternalSystemException} Si el hardware colapsa o el ADN del archivo es inválido.
 */
export const ExtractWorkbookData = async (
  parametersSnapshot: IExtractionParameters,
): Promise<readonly IProjectFinancialRecord[]> => {
  const correlationIdentifier = parametersSnapshot.correlationIdentifier ?? GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_WORKBOOK_INGESTION_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: CARGA DE HARDWARE (Delegación de I/O) ---
        const targetWorksheetSnapshot = await loadWorksheetFromHardware(
          parametersSnapshot.absoluteFilePathLiteral
        );

        // --- FASE 2: MAPEO CRONOLÓGICO Y CONTEXTO ---
        const headerRowIndexNumeric = WORKBOOK_INGESTION_STANDARDS.HEADER_ROW_INDEX_QUANTITY;
        const monthHeadersMapping = IdentifyMonthHeaders(
          targetWorksheetSnapshot.getRow(headerRowIndexNumeric)
        );

        const extractionContextSnapshot = InitializeExtractionContext(
          monthHeadersMapping,
          correlationIdentifier
        );

        // --- FASE 3: ESCANEO POR ENJAMBRE (Delegación de Iteración) ---
        processWorksheetRows(targetWorksheetSnapshot, extractionContextSnapshot);

        // --- FASE 4: ADUANA DE ADN FINAL (Lote Validation) ---
        const finalSovereignBatchSnapshot = ValidateExtractedBatchADN(
          extractionContextSnapshot.recordsCollection as unknown[]
        );

        // --- FASE 5: REPORTE DE ÉXITO (SRE Visibility) ---
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'WORKBOOK_EXTRACTION_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Extracción física de matriz presupuestaria finalizada.',
          semanticIntentTag: 'FINANCIAL_DATA_ACQUISITION',
          contextMetadataSnapshot: {
            extractedRecordsQuantity: finalSovereignBatchSnapshot.length,
            sourceFileLiteral: parametersSnapshot.absoluteFilePathLiteral
          }
        });

        return finalSovereignBatchSnapshot;

      } catch (caughtError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---
        if (caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'WORKBOOK_ORCHESTRATION_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de ingesta financiera.',
          semanticIntentTag: 'DATA_PIPELINE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            targetFileLiteral: parametersSnapshot.absoluteFilePathLiteral
          }
        });

        throw new InternalSystemException('FALLO_EN_EXTRACCION_DE_LIBRO_FINANCIERO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
