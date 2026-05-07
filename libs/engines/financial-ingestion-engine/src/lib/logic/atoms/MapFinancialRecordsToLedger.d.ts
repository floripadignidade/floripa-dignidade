/**
 * @section Financial Ingestion - Ledger Data Mapper
 * @description Átomo de lógica pura encargado de transformar la colección de
 * registros financieros (ADN de dominio) al esquema físico de columnas del
 * Ledger institucional (Persistencia). Garantiza la trazabilidad individual
 * mediante la inyección de marcas temporales y IDs de correlación.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Standard Naming.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
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
 * Implementa una función pura y determinística.
 *
 * @param financialRecordsCollection - Lista de registros validados por la aduana Zod.
 * @param correlationIdentifier - Identificador de trazabilidad forense del proceso.
 * @returns {IFinancialLedgerRow[]} Colección mapeada bajo el estándar físico PostgREST.
 */
export declare const MapFinancialRecordsToLedger: (financialRecordsCollection: readonly IProjectFinancialRecord[], correlationIdentifier: string) => IFinancialLedgerRow[];
//# sourceMappingURL=MapFinancialRecordsToLedger.d.ts.map