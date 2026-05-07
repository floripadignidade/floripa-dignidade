/**
 * @section Financial Ingestion - Monthly Amount Capture
 * @description Átomo encargado de transformar las celdas financieras de una fila
 * en registros individuales vinculados a la categoría activa. Implementa un
 * filtro de pureza para evitar el volcado de registros nulos en la nube.
 *
 * Protocolo OEDP-V17.0 - High Performance & Type Safety.
 * SANEADO Zenith: Recalibración de ruta de ADN y erradicación de Readonly Mismatch.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type ExcelJS from 'exceljs';

/* 1. ADN Estructural (Recalibrado a Topología Plana) */
/**
 * 🛡️ SANEADO Zenith: Ruta corregida para la nueva estructura de carpetas.
 * Se utiliza 'import type' para garantizar el Tree-shaking absoluto.
 */
import type { IExtractionContext } from '../../schemas/ExtractionContext.schema';

/**
 * Itera sobre las columnas temporales de una fila y extrae los snapshots financieros.
 *
 * @param currentRowInstance - Fila física bajo auditoría proporcionada por el motor ExcelJS.
 * @param processContext - Referencia al contexto de extracción (Sello de Memoria).
 * @returns {void} Mutación controlada de la colección de registros en el contexto.
 */
export const CaptureMonthlyAmounts = (
  currentRowInstance: ExcelJS.Row,
  processContext: IExtractionContext
): void => {
  /**
   * @section Puente de Mutabilidad (Bypass de Solo Lectura)
   * SANEADO Zenith: Para cumplir con 'verbatimModuleSyntax' y evitar errores de
   * asignación en propiedades del esquema Zod marked as '.readonly()', realizamos
   * un cast local a la colección de registros. Esto permite la operación
   * '.push()' sin recurrir a 'any'.
   */
  const mutableRecordsCollectionReference = processContext.recordsCollection as Record<string, unknown>[];

  Object.entries(processContext.monthHeadersMapping).forEach(
    ([columnIdentifier, monthYearLiteral]) => {
      /** Captura del valor textual de la celda financiera. */
      const rawAmountLiteral = currentRowInstance.getCell(Number(columnIdentifier)).text?.trim();

      /**
       * @section Filtro de Pureza Fiscal (SRE Optimization)
       * Identificamos si el monto tiene valor económico real antes de procesar.
       * Evitamos persistir "R$ 0,00" o valores vacíos para optimizar la cuota
       * del Tier Gratuito de Supabase (ADR 0015).
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
