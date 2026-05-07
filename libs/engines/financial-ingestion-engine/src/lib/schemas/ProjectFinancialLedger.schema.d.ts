/**
 * @section Financial Ingestion DNA - Ledger Schema
 * @description Contrato soberano para la validación de registros presupuestarios.
 * Implementa purificación matemática desde formato BRL hacia Float puro.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * SANEADO Zenith: Tipado explícito de callbacks para blindaje contra TS7006.
 *
 * @author Raz Podestá - MetaShark Tech
 */
import { z } from 'zod';
/**
 * @name ProjectFinancialRecordSchema
 * @description Estructura inmutable de un egreso presupuestario auditado.
 */
export declare const ProjectFinancialRecordSchema: z.ZodReadonly<z.ZodObject<{
    organizationNameLiteral: z.ZodDefault<z.ZodString>;
    projectNameLiteral: z.ZodDefault<z.ZodString>;
    specificationCategoryLiteral: z.ZodString;
    referenceMonthYearLiteral: z.ZodString;
    allocatedAmountNumeric: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    organizationNameLiteral: string;
    projectNameLiteral: string;
    specificationCategoryLiteral: string;
    referenceMonthYearLiteral: string;
    allocatedAmountNumeric: number;
}, {
    specificationCategoryLiteral: string;
    referenceMonthYearLiteral: string;
    allocatedAmountNumeric: string;
    organizationNameLiteral?: string | undefined;
    projectNameLiteral?: string | undefined;
}>>;
export declare const FinancialIngestionBatchSchema: z.ZodReadonly<z.ZodArray<z.ZodReadonly<z.ZodObject<{
    organizationNameLiteral: z.ZodDefault<z.ZodString>;
    projectNameLiteral: z.ZodDefault<z.ZodString>;
    specificationCategoryLiteral: z.ZodString;
    referenceMonthYearLiteral: z.ZodString;
    allocatedAmountNumeric: z.ZodEffects<z.ZodEffects<z.ZodString, number, string>, number, string>;
}, "strip", z.ZodTypeAny, {
    organizationNameLiteral: string;
    projectNameLiteral: string;
    specificationCategoryLiteral: string;
    referenceMonthYearLiteral: string;
    allocatedAmountNumeric: number;
}, {
    specificationCategoryLiteral: string;
    referenceMonthYearLiteral: string;
    allocatedAmountNumeric: string;
    organizationNameLiteral?: string | undefined;
    projectNameLiteral?: string | undefined;
}>>, "many">>;
/** 🛡️ ADN Tipado para el Enjambre */
export type IProjectFinancialRecord = z.infer<typeof ProjectFinancialRecordSchema>;
//# sourceMappingURL=ProjectFinancialLedger.schema.d.ts.map