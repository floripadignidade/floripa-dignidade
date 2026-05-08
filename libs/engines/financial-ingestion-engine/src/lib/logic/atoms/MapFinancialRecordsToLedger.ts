/**
 * @section Financial Ingestion - Ledger Data Mapper Atom
 * @description Átomo de lógica pura encargado de transformar la colección de
 * registros financieros (ADN de dominio) al esquema físico de columnas del
 * Ledger institucional (Persistencia). Garantiza la trazabilidad individual
 * mediante la inyección de marcas temporales y IDs de correlación.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Technical Naming.
 * SANEADO Zenith: Inmutabilidad total de salida y sincronización de contratos de red.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural (Domain Contracts) */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';

/**
 * @interface IFinancialLedgerRow
 * @description Representación física inmutable de una fila en la tabla
 * 'project_financial_ledger' de la base de datos soberana.
 * Sincronizado con: database/migration_master_schema.sql
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

/**
 * Transforma una colección de registros purificados en un snapshot listo para la nube.
 * Implementa una función pura y determinística sin efectos secundarios.
 *
 * @param financialRecordsCollection - Lista de registros validados (Inmutable).
 * @param correlationIdentifier - Identificador de trazabilidad forense del proceso.
 * @returns {readonly IFinancialLedgerRow[]} Colección mapeada bajo el estándar físico PostgREST.
 */
export const MapFinancialRecordsToLedger = (
  financialRecordsCollection: readonly IProjectFinancialRecord[],
  correlationIdentifier: string
): readonly IFinancialLedgerRow[] => {
  /**
   * @section Captura de Marca Temporal
   * Generamos un único rastro de tiempo para todo el lote para asegurar la
   * consistencia atómica y facilitar auditorías por periodos de ingesta.
   */
  const currentIngestionTimestampISO = new Date().toISOString();

  /**
   * @section Algoritmo de Mapeo (Transformation Swarm)
   * Realizamos la traslación de CamelCase (Domain) a SnakeCase (Persistence).
   */
  const mappedLedgerRowsCollection: IFinancialLedgerRow[] = financialRecordsCollection.map(
    (recordSnapshot) => {
      return {
        // Mapeo de Identidad Institucional
        organization_name_literal: recordSnapshot.organizationNameLiteral,
        project_name_literal: recordSnapshot.projectNameLiteral,

        // Mapeo de Datos Financieros
        specification_category_literal: recordSnapshot.specificationCategoryLiteral,
        reference_month_year_literal: recordSnapshot.referenceMonthYearLiteral,
        allocated_amount_numeric: recordSnapshot.allocatedAmountNumeric,

        // Mapeo de Auditoría y SRE
        correlation_id: correlationIdentifier,
        last_ingestion_at: currentIngestionTimestampISO,
      };
    }
  );

  /**
   * 🛡️ SANEADO Zenith: Sellado de la colección para asegurar que la
   * persistencia reciba un ADN inalterable.
   */
  return Object.freeze(mappedLedgerRowsCollection);
};
