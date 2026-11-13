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
 * @section Transformador de Divisas (BRL a Float)
 * Transmuta representaciones visuales ("R$ 3.466,75") a valores de base de datos (3466.75)
 */
const BrazilianCurrencyParserSchema = z
  .string()
  .transform((currencyLiteral: string) => {
    // 1. Elimina tokens de moneda, letras y espacios. Preserva dígitos, coma y menos.
    const sanitizedCurrencyLiteral = currencyLiteral.replace(/[^\d,-]/g, '');

    // 2. Transición técnica: Convierte separador de decimales de formato BR a formato ISO.
    const floatStringLiteral = sanitizedCurrencyLiteral.replace(',', '.');

    return parseFloat(floatStringLiteral);
  })
  .refine((parsedNumeric: number) => !isNaN(parsedNumeric), {
    message: 'FINANCIAL_PARSING_FAULT_UNREADABLE_CURRENCY_FORMAT',
  });

/**
 * @name ProjectFinancialRecordSchema
 * @description Estructura inmutable de un egreso presupuestario auditado.
 */
export const ProjectFinancialRecordSchema = z
  .object({
    organizationNameLiteral: z.string().default('ASSOCIAÇÃO ALBERTO DE SOUZA'),
    projectNameLiteral: z.string().default('PROJETO RUMO CERTO'),

    specificationCategoryLiteral: z
      .string()
      .min(2)
      .describe('Categoría funcional del gasto (Ej: Encargos e Benefícios).'),

    referenceMonthYearLiteral: z
      .string()
      .min(5)
      .describe('Mes y año de ejecución (Ej: 01 - Jan. 2026).'),

    allocatedAmountNumeric: BrazilianCurrencyParserSchema.describe(
      'Monto financiero neto purificado y listo para el Ledger.',
    ),
  })
  .readonly();

export const FinancialIngestionBatchSchema = z.array(ProjectFinancialRecordSchema).readonly();

/** 🛡️ ADN Tipado para el Enjambre */
export type IProjectFinancialRecord = z.infer<typeof ProjectFinancialRecordSchema>;
