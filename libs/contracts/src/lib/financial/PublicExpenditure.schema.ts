/**
 * @section Global DNA - Public Expenditure Contract
 * @description Contrato de Verdad Única (SSOT) para el gasto público institucional.
 * Orquesta la integridad fiscal, territorial y presupuestaria del ecosistema.
 *
 * Protocolo OEDP-V18.1 - High Performance & Data Sovereignty.
 */

import { z } from 'zod';

/** 🛡️ ADN Criptográfico: Tipificación Nominal (Branding) */
export const PublicExpenditureIdentifierSchema = z.string()
  .uuid()
  .brand<'PublicExpenditureIdentifier'>();

export type TPublicExpenditureIdentifier = z.infer<typeof PublicExpenditureIdentifierSchema>;

export const TerritorialTechnicalIdentifierSchema = z.string()
  .brand<'TerritorialTechnicalIdentifier'>();

export type TTerritorialTechnicalIdentifier = z.infer<typeof TerritorialTechnicalIdentifierSchema>;

export const ProviderTaxIdentifierSchema = z.string()
  .regex(/^\d{11,14}$/, 'IDENTIFICADOR_FISCAL_INVALIDO')
  .brand<'SovereignTaxIdentifier'>();

export type TProviderTaxIdentifier = z.infer<typeof ProviderTaxIdentifierSchema>;

/** Estructura ontológica de jerarquía funcional */
export const FunctionalCategorySchema = z.object({
  functionNameLiteral: z.string(),
  subFunctionNameLiteral: z.string(),
  programNameLiteral: z.string(),
}).readonly();

/** Metadatos legales del proveedor */
export const ProviderMetadataSchema = z.object({
  legalNameLiteral: z.string().transform((val) => val.toUpperCase().trim()),
  taxIdentificationNumber: ProviderTaxIdentifierSchema,
}).readonly();

/** Auditoría forense */
export const ExpenditureAuditMetadataSchema = z.object({
  sourceSoftwareLiteral: z.string().default('E-PUBLICA'),
  extractionTimestampISO: z.string().datetime(),
  lastAnomalyScoreNumeric: z.number().min(0).max(1).default(0),
}).readonly();

/** ADN Maestro del Gasto */
export const PublicExpenditureSchema = z.object({
  expenditureIdentifier: PublicExpenditureIdentifierSchema,
  managementUnitTechnicalCode: z.number().int().positive(),
  governmentTechnicalReferenceLiteral: z.string(),
  targetTerritoryIdentifier: TerritorialTechnicalIdentifierSchema,
  totalExecutedAmountNumeric: z.number().nonnegative(),
  providerMetadata: ProviderMetadataSchema,
  functionalCategory: FunctionalCategorySchema,
  serviceDescriptionLiteral: z.string().min(5),
  auditMetadata: ExpenditureAuditMetadataSchema,
}).readonly();

export type IPublicExpenditure = z.infer<typeof PublicExpenditureSchema>;
