/**
 * @section Financial Ingestion - Contextual Workbook Extractor (Orchestrator)
 * @description Orquestador supremo encargado de la lectura física y extracción
 * lógica de matrices XLSX. Coordina el enjambre de átomos de triaje y
 * asegura que el resultado cumpla con el contrato de integridad de la ONG.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Absolute Functional Atomicity.
 * SANEADO Zenith: Resolución de TS7006 (Implicit Any), tipado de hardware y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import ExcelJS from 'exceljs';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Configuración (SSOT) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';
import { FinancialIngestionBatchSchema } from '../../schemas/ProjectFinancialLedger.schema';
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/* 2. Enjambre Atómico Local (Atoms Swarm) */
import { IdentifyMonthHeaders } from '../atoms/IdentifyMonthHeaders';
import { TriageContextualRow } from '../atoms/TriageContextualRow';

/**
 * @interface IExtractionParameters
 * @description Contrato inmutable para la parametrización de la auditoría de hardware.
 */
interface IExtractionParameters {
  /** Ruta absoluta del archivo XLSX en el sistema de archivos del servidor/CLI. */
  readonly absoluteFilePathLiteral: string;
  /** Identificador opcional para mantener la cadena de custodia si el proceso es disparado por otra lib. */
  readonly correlationIdentifier?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'FINANCIAL_WORKBOOK_ORCHESTRATOR';

/**
 * Ejecuta la extracción purificada de datos financieros desde una matriz física.
 * Implementa el patrón 'Contextual Ingestion' para resolver jerarquías de filas.
 *
 * @param parameters - Rutas y metadatos de ejecución.
 * @returns {Promise<readonly IProjectFinancialRecord[]>} Colección inmutable homologada por Zod.
 * @throws {InternalSystemException} Si el libro es ilegible o el ADN está corrupto.
 */
export const ExtractWorkbookData = async (
  parameters: IExtractionParameters,
): Promise<readonly IProjectFinancialRecord[]> => {
  /**
   * Generamos la "Traza de Sangre Digital" que vinculará la lectura física
   * con el rastro de auditoría en la nube.
   */
  const correlationIdentifier = parameters.correlationIdentifier ?? GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_WORKBOOK_INGESTION_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // 1. CARGA DE HARDWARE (I/O)
        const workbookInstance = new ExcelJS.Workbook();

        /** 🛡️ SANEADO Zenith: Protección de lectura física para captura forense. */
        await workbookInstance.xlsx.readFile(parameters.absoluteFilePathLiteral);

        const targetWorksheet = workbookInstance.worksheets[0];
        if (!targetWorksheet) {
          throw new Error('WORKSHEET_NOT_IDENTIFIED_IN_HARDWARE');
        }

        // 2. INICIALIZACIÓN DE CABECERAS (Temporal Axis)
        /** Delegamos la identificación de meses al átomo especializado. */
        const headerRowIndexNumeric = WORKBOOK_INGESTION_STANDARDS.HEADER_ROW_INDEX_QUANTITY;
        const monthHeadersMapping = IdentifyMonthHeaders(targetWorksheet.getRow(headerRowIndexNumeric));

        // 3. CONSTRUCCIÓN DE MEMORIA DE PROCESO (Context)
        /**
         * 🛡️ SANEADO Zenith: Se utiliza el tipo nominal IExtractionContext
         * para garantizar que el enjambre de átomos comparta la misma verdad.
         */
        const extractionContext: IExtractionContext = {
          activeCategorySpecificationLiteral: '',
          monthHeadersMapping,
          recordsCollection: [],
          correlationIdentifier,
        };

        // 4. ESCANEO POR DELEGACIÓN (Swarm Execution)
        /**
         * 🛡️ SANEADO Zenith: Resolución de TS7006.
         * Tipamos explícitamente los parámetros del motor de ExcelJS para
         * cumplir con la norma 'noImplicitAny' de la arquitectura.
         */
        targetWorksheet.eachRow((currentRow: ExcelJS.Row, rowNumberNumeric: number) => {
          TriageContextualRow(currentRow, rowNumberNumeric, extractionContext);
        });

        // 5. ADUANA DE ADN (Validación de Lote)
        /**
         * Transformamos la colección cruda en un lote de registros tipados.
         * La aduana Zod purificará los montos (R$ -> Float) en este paso.
         */
        const validationResult = FinancialIngestionBatchSchema.safeParse(
          extractionContext.recordsCollection,
        );

        if (!validationResult.success) {
          throw new InternalSystemException('EXCEL_DNA_INCONSISTENCY', {
            structuralIssuesCollection: validationResult.error.flatten(),
            correlationIdentifier,
            targetPath: parameters.absoluteFilePathLiteral
          });
        }

        /**
         * Retorno del rastro financiero nominalmente puro y sellado.
         */
        return Object.freeze(validationResult.data);

      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE COLAPSO (Resilience)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        throw new InternalSystemException('WORKBOOK_EXTRACTION_FAULT', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          targetFileLiteral: parameters.absoluteFilePathLiteral
        });
      }
    },
  );
};
