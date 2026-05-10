/**
 * @section Financial Ingestion - Monthly Amount Capture
 * @description Átomo encargado de transformar las celdas financieras de una fila
 * en registros individuales vinculados a la categoría activa. Implementa un
 * filtro de pureza para evitar el volcado de registros nulos en la nube.
 *
 * Protocolo OEDP-V17.0 - High Performance & Type Safety.
 * SANEADO Zenith: Resolución de TS2503 (Namespace collision) mediante importación
 * nombrada y cumplimiento de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ SANEADO Zenith: Transición de importación por defecto (Namespace) a
 * importación de interfaz nombrada para alineación con el puente 'index.d.ts'.
 */
import type { Row } from 'exceljs';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/**
 * Itera sobre las columnas temporales de una fila y extrae los snapshots financieros.
 * Implementa una función pura de mapeo con filtro de relevancia fiscal.
 *
 * @param currentRowInstance - Fila física bajo auditoría proporcionada por el motor.
 * @param processContext - Referencia al contexto de extracción (Memoria de proceso).
 * @returns {void} Mutación controlada de la colección de registros en el contexto.
 */
export const CaptureMonthlyAmounts = (
  currentRowInstance: Row,
  processContext: IExtractionContext
): void => {
  /**
   * @section Puente de Mutabilidad (Bypass de Solo Lectura)
   * SANEADO Zenith: El casteo permite la operación '.push()' en la colección
   * residentes en el contexto sin comprometer el contrato '.readonly()' externo.
   */
  const mutableRecordsCollectionReference = processContext.recordsCollection as Record<string, unknown>[];

  /**
   * @section Ciclo de Captura Mensual
   * Procesamos las cabeceras identificadas previamente para extraer los montos.
   */
  Object.entries(processContext.monthHeadersMapping).forEach(
    ([columnIdentifier, monthYearLiteral]) => {
      /** Captura del valor textual de la celda financiera. */
      const rawAmountLiteral = currentRowInstance.getCell(Number(columnIdentifier)).text?.trim();

      /**
       * @section Filtro de Pureza Fiscal (SRE Optimization)
       * Identificamos si el monto tiene valor económico real antes de procesar.
       * Evitamos persistir "R$ 0,00" o valores vacíos para optimizar la cuota
       * del Tier Gratuito (ADR 0015).
       */
      const isRecordWorthProcessingBoolean =
        !!rawAmountLiteral &&
        rawAmountLiteral !== 'R$ 0,00' &&
        rawAmountLiteral !== '0';

      if (isRecordWorthProcessingBoolean) {
        /**
         * Inyectamos el registro en la colección temporal.
         * La especificación de categoría se hereda de la máquina de estados
         * mantenida en el 'activeCategorySpecificationLiteral' del contexto.
         */
        mutableRecordsCollectionReference.push({
          specificationCategoryLiteral: processContext.activeCategorySpecificationLiteral,
          referenceMonthYearLiteral: monthYearLiteral,
          allocatedAmountNumeric: rawAmountLiteral,
        });
      }
    }
  );
};
