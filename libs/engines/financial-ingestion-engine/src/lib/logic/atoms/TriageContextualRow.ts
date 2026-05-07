/**
 * @section Financial Ingestion - Row Triage Engine
 * @description Átomo encargado de clasificar la naturaleza de la fila entrante
 * (Categoría vs Profesional) y delegar su procesamiento a los átomos de captura.
 * Actúa como el selector de comportamiento de la máquina de estados de ingesta.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Type Safety.
 * SANEADO Zenith: Erradicación de 'any' mediante puente de mutabilidad controlada.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type ExcelJS from 'exceljs';

/* 1. Infraestructura de Estándares (Ground Truth) */
import { WORKBOOK_INGESTION_STANDARDS } from '../../constants/WorkbookIngestion.config';

/* 2. ADN Estructural (Contracts) */
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/* 3. Enjambre Atómico de Ejecución */
import { CaptureMonthlyAmounts } from './CaptureMonthlyAmounts';
import { ReportProfessionalContext } from './ReportProfessionalContext';

/**
 * @interface IInternalMutableContext
 * @description Puente de tipos para permitir la mutación controlada de la
 * máquina de estados de ingesta, cumpliendo con 'verbatimModuleSyntax'.
 */
interface IInternalMutableContext extends Omit<IExtractionContext, 'activeCategorySpecificationLiteral'> {
  activeCategorySpecificationLiteral: string;
}

/**
 * Analiza la fila física y dispara la acción correspondiente según marcadores institucionales.
 *
 * @param currentRowInstance - Fila física extraída por el motor ExcelJS.
 * @param rowNumberNumeric - Índice de posición en la hoja de cálculo.
 * @param processContext - Memoria de la transacción (Casteada a Mutable internamente).
 */
export const TriageContextualRow = (
  currentRowInstance: ExcelJS.Row,
  rowNumberNumeric: number,
  processContext: IExtractionContext
): void => {
  /**
   * @section Frontera de Seguridad
   * Omitimos las filas de metadatos superiores y cabeceras técnicas definidas
   * en los estándares de la ONG.
   */
  if (rowNumberNumeric <= WORKBOOK_INGESTION_STANDARDS.HEADER_ROW_INDEX_QUANTITY) {
    return;
  }

  // 1. CAPTURA DE SEÑALES VISUALES (Sensors)
  const firstCellContentLiteral = currentRowInstance.getCell(1).text?.trim();
  const thirdCellContentLiteral = currentRowInstance.getCell(3).text?.trim();

  /**
   * 🛡️ SANEADO Zenith: Puente de mutabilidad.
   * La interfaz externa es Readonly para el orquestador, pero este átomo
   * actúa como el escritor de la máquina de estados interna.
   */
  const mutableContextReference = processContext as unknown as IInternalMutableContext;

  /**
   * @section Lógica de Decisión (Fuzzy Markers)
   *
   * CASO A: Identificación de Categoría Presupuestaria.
   * Se identifica cuando la columna 1 tiene texto y la columna 3 contiene el símbolo 'R$'.
   */
  const isCategoryHeaderRecordBoolean =
    !!firstCellContentLiteral &&
    thirdCellContentLiteral?.includes(WORKBOOK_INGESTION_STANDARDS.MARKERS.CURRENCY_SYMBOL);

  if (isCategoryHeaderRecordBoolean) {
    // Actualizamos el estado de la categoría para las filas subsiguientes.
    mutableContextReference.activeCategorySpecificationLiteral = firstCellContentLiteral;

    // Delegación inmediata para capturar los montos mensuales de esta fila.
    CaptureMonthlyAmounts(currentRowInstance, processContext);
    return;
  }

  /**
   * CASO B: Identificación de Ejecutor Humano (Profesional).
   * Se identifica por la marca de verificación '✓' en la columna 3, siempre
   * que exista una categoría activa en el contexto.
   */
  const isHumanExecutionRecordBoolean =
    thirdCellContentLiteral === WORKBOOK_INGESTION_STANDARDS.MARKERS.HUMAN_EXECUTION_CHECK &&
    !!mutableContextReference.activeCategorySpecificationLiteral;

  if (isHumanExecutionRecordBoolean) {
    ReportProfessionalContext(
      currentRowInstance,
      mutableContextReference.activeCategorySpecificationLiteral,
      mutableContextReference.correlationIdentifier
    );
  }
};
