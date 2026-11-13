/**
 * @section Financial Ingestion - Single Record Mapper
 * @description Átomo de lógica pura encargado de transformar una unidad de ADN
 * de dominio al esquema físico del Ledger.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Technical Naming.
 */

import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';
import type { IFinancialLedgerRow } from './MapFinancialRecordsToLedger';

/**
 * Transforma un registro unitario de dominio a su representación en base de datos.
 *
 * @param recordSnapshot - El rastro financiero purificado.
 * @param ingestionTimestampISO - Marca temporal compartida para el lote.
 * @param correlationIdentifier - ID de trazabilidad forense.
 * @returns {IFinancialLedgerRow} Fila mapeada para el protocolo PostgREST.
 */
export const MapProjectFinancialRecordToLedgerRow = (
  recordSnapshot: IProjectFinancialRecord,
  ingestionTimestampISO: string,
  correlationIdentifier: string,
): IFinancialLedgerRow => {
  return {
    organization_name_literal: recordSnapshot.organizationNameLiteral,
    project_name_literal: recordSnapshot.projectNameLiteral,
    specification_category_literal: recordSnapshot.specificationCategoryLiteral,
    reference_month_year_literal: recordSnapshot.referenceMonthYearLiteral,
    allocated_amount_numeric: recordSnapshot.allocatedAmountNumeric,
    correlation_id: correlationIdentifier,
    last_ingestion_at: ingestionTimestampISO,
  };
};
