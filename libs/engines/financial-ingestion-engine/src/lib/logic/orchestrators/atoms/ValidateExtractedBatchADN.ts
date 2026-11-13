/**
 * @section Financial Ingestion - Batch DNA Aduana
 * @description Átomo encargado de la validación final del lote recolectado.
 * Garantiza que la salida cumpla con el estándar de integridad financiera.
 *
 * Protocolo OEDP-V17.0 - Zod Sovereign Aduana.
 */

import { FinancialIngestionBatchSchema } from '../../../schemas/ProjectFinancialLedger.schema';
import type { IProjectFinancialRecord } from '../../../schemas/ProjectFinancialLedger.schema';
import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Valida la colección de registros contra el esquema soberano.
 *
 * @param rawRecordsCollection - Búfer de registros recolectados.
 * @returns {readonly IProjectFinancialRecord[]} Lote purificado y sellado.
 */
export const ValidateExtractedBatchADN = (
  rawRecordsCollection: unknown[],
): readonly IProjectFinancialRecord[] => {
  const validationResult = FinancialIngestionBatchSchema.safeParse(rawRecordsCollection);

  if (!validationResult.success) {
    throw new InternalSystemException('EXCEL_DNA_INCONSISTENCY', {
      structuralIssuesCollection: validationResult.error.flatten(),
    });
  }

  return Object.freeze(validationResult.data);
};
