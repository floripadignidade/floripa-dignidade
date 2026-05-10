/**
 * @section Financial Ingestion - Row Triage Engine
 * @description Átomo encargado de clasificar la naturaleza de la fila entrante
 * (Categoría Presupuestaria vs Ejecución Profesional) y delegar su procesamiento.
 * Actúa como el cerebro de control de la máquina de estados de ingesta.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS2503 (Namespace collision) mediante importación
 * nombrada 'Row' y blindaje de mutabilidad controlada.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ SANEADO Zenith: Transición de importación por defecto a importación de
 * interfaz nombrada para alineación con el puente 'index.d.ts'.
 */
import type { Row } from 'exceljs';

/* 1. Infraestructura de Estándares (Ground Truth) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';

/* 2. ADN Estructural (Verbatim Module Syntax) */
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/* 3. Enjambre Atómico de Ejecución (Sub-Atoms) */
import { CaptureMonthlyAmounts } from './CaptureMonthlyAmounts';
import { ReportProfessionalContext } from './ReportProfessionalContext';

/**
 * @interface IInternalMutableContext
 * @description Puente de tipos para permitir la mutación de la máquina de estados
 * interna sin violar el contrato '.readonly()' del esquema Zod externo.
 */
interface IInternalMutableContext extends Omit<IExtractionContext, 'activeCategorySpecificationLiteral'> {
  activeCategorySpecificationLiteral: string;
}

/**
 * Analiza la fila física y clasifica su propósito según marcadores institucionales.
 * Implementa lógica de flujo descendente: detecta el contexto y dispara sensores.
 *
 * @param currentRowInstance - Fila física extraída por el motor de hardware.
 * @param rowNumberNumeric - Índice de posición en la matriz XLSX.
 * @param processContext - Memoria de la transacción (Contexto de extracción).
 * @returns {void} Operación de triaje lógica.
 */
export const TriageContextualRow = (
  currentRowInstance: Row,
  rowNumberNumeric: number,
  processContext: IExtractionContext
): void => {
  /**
   * @section Frontera de Seguridad (Metadata Skip)
   * Omitimos las filas de encabezados técnicos y metadatos superiores
   * definidos en los estándares físicos de la ONG.
   */
  if (rowNumberNumeric <= WORKBOOK_INGESTION_STANDARDS.HEADER_ROW_INDEX_QUANTITY) {
    return;
  }

  // 1. CAPTURA DE SEÑALES VISUALES (Cell Sensors)
  const firstCellContentLiteral = currentRowInstance.getCell(1).text?.trim();
  const thirdCellContentLiteral = currentRowInstance.getCell(3).text?.trim();

  /**
   * 🛡️ SANEADO Zenith: Puente de mutabilidad.
   * El orquestador ve el contexto como inmutable, pero este motor de triaje
   * tiene la autoridad de actualizar la 'Partida Presupuestaria' activa.
   */
  const mutableContextReference = processContext as unknown as IInternalMutableContext;

  /**
   * @section Lógica de Decisión (Fuzzy Semantic Matching)
   *
   * CASO A: Identificación de Categoría Presupuestaria (Header de Grupo).
   * Se identifica cuando la columna 1 posee la descripción y la columna 3
   * contiene el rastro monetario 'R$'.
   */
  const isCategoryHeaderRecordBoolean =
    !!firstCellContentLiteral &&
    thirdCellContentLiteral?.includes(WORKBOOK_INGESTION_STANDARDS.MARKERS.CURRENCY_SYMBOL);

  if (isCategoryHeaderRecordBoolean) {
    // ACTUALIZACIÓN DE ESTADO: Definimos la nueva categoría para las filas hijas.
    mutableContextReference.activeCategorySpecificationLiteral = firstCellContentLiteral;

    // CAPTURA INMEDIATA: Procesamos los montos financieros de esta fila principal.
    CaptureMonthlyAmounts(currentRowInstance, processContext);
    return;
  }

  /**
   * CASO B: Identificación de Ejecución Profesional (Hijo de Categoría).
   * Se identifica por la marca de verificación '✓' en la columna 3, indicando
   * que el profesional está asignado a la categoría activa en el contexto.
   */
  const isHumanExecutionRecordBoolean =
    thirdCellContentLiteral === WORKBOOK_INGESTION_STANDARDS.MARKERS.HUMAN_EXECUTION_CHECK &&
    !!mutableContextReference.activeCategorySpecificationLiteral;

  if (isHumanExecutionRecordBoolean) {
    /**
     * DISPARO DE SENSOR: Reportamos el contexto profesional a telemetría
     * para auditoría de recursos humanos.
     */
    ReportProfessionalContext(
      currentRowInstance,
      mutableContextReference.activeCategorySpecificationLiteral,
      mutableContextReference.correlationIdentifier
    );
  }
};
