/**
 * @section PMF Engine DNA - Sovereign Expenditure Schema
 * @description Contrato de "Verdad Única" para el gasto público institucional.
 * Define la estructura inmutable de los egresos purificados, gestionando la
 * integridad fiscal, territorial y presupuestaria.
 *
 * Protocolo OEDP-V17.0 - High Performance & Data Sovereignty.
 * SANEADO Zenith: Soporte para CPF/CNPJ, inyección de Unidad Gestora e integridad matemática.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section IDENTIDADES SOBERANAS (Branded Types)
 * @description Sellos de marca nominal que garantizan la cadena de custodia del dato.
 */

export const PublicExpenditureIdentifierSchema = z.string()
  .uuid()
  .brand<'PublicExpenditureIdentifier'>();

export type TPublicExpenditureIdentifier = z.infer<typeof PublicExpenditureIdentifierSchema>;

/** 🛡️ SANEADO Zenith: Sincronizado con el motor territorial nivelado. */
export const TerritorialTechnicalIdentifierSchema = z.string()
  .brand<'TerritorialTechnicalIdentifier'>();

export type TTerritorialTechnicalIdentifier = z.infer<typeof TerritorialTechnicalIdentifierSchema>;

/**
 * 🛡️ SANEADO Zenith: Transmutado de CNPJ a TaxIdentifier para soportar 11 y 14 dígitos.
 */
export const ProviderTaxIdentifierSchema = z.string()
  .regex(/^\d{11,14}$/, 'IDENTIFICADOR_FISCAL_INVALIDO_SOLO_NUMEROS')
  .brand<'SovereignTaxIdentifier'>();

export type TProviderTaxIdentifier = z.infer<typeof ProviderTaxIdentifierSchema>;

/**
 * @section COMPONENTES ATÓMICOS DEL ADN
 */

/** Clasificación Funcional de Gobierno (Taxonomía Presupuestaria) */
export const FunctionalCategorySchema = z.object({
  functionNameLiteral: z.string().describe('Área macro de gobierno (Ej: Saúde).'),
  subFunctionNameLiteral: z.string().describe('Especialidad técnica (Ej: Atenção Básica).'),
  programNameLiteral: z.string().describe('Programa institucional vinculado.'),
}).readonly();

/** Metadata del Proveedor (Entidad Beneficiaria de la Soberanía) */
export const ProviderMetadataSchema = z.object({
  legalNameLiteral: z.string()
    .transform((value) => value.toUpperCase().trim())
    .describe('Razón social o nombre legal purificado.'),
  taxIdentificationNumber: ProviderTaxIdentifierSchema,
}).readonly();

/** Rastro Forense y Auditoría SRE */
export const ExpenditureAuditMetadataSchema = z.object({
  sourceSoftwareLiteral: z.string().default('E-PUBLICA'),
  extractionTimestampISO: z.string().datetime(),
  /** 🛡️ Zenith Inalytics Integration: Score de anomalía calculado por la IA. */
  lastAnomalyScoreNumeric: z.number().min(0).max(1).default(0),
}).readonly();

/**
 * @name PublicExpenditureSchema
 * @description Contrato maestro para la persistencia e historización de egresos.
 * Este objeto es la base para el Observatorio de Gastos del portal ciudadano.
 */
export const PublicExpenditureSchema = z.object({
  /** ID Soberano (Hash determinista generado por la ONG). */
  expenditureIdentifier: PublicExpenditureIdentifierSchema,

  /** 🛡️ SANEADO Zenith: Vínculo con el catálogo de Unidades Gestoras de la PMF. */
  managementUnitTechnicalCode: z.number().int().positive()
    .describe('ID técnico de la unidad responsable (Ej: 9 para Fundo Municipal de Saúde).'),

  /** Referencia oficial original para trazabilidad en portales gubernamentales. */
  governmentTechnicalReferenceLiteral: z.string()
    .describe('Número de empenho original del portal de transparencia.'),

  /** Vínculo con el búnker territorial (Código IBGE). */
  targetTerritoryIdentifier: TerritorialTechnicalIdentifierSchema,

  /** 🛡️ SANEADO Zenith: Validación de monto no negativo. */
  totalExecutedAmountNumeric: z.number().nonnegative()
    .describe('Monto financiero neto tras auditoría de movimientos (Pagos - Estornos).'),

  providerMetadata: ProviderMetadataSchema,
  functionalCategory: FunctionalCategorySchema,

  serviceDescriptionLiteral: z.string().min(5)
    .describe('Descripción resumida del objeto contractual para análisis semántico.'),

  auditMetadata: ExpenditureAuditMetadataSchema,

}).readonly();

/**
 * --- EXPORTACIONES NOMINALES ---
 */
export type IPublicExpenditure = z.infer<typeof PublicExpenditureSchema>;
export type TFunctionalCategory = z.infer<typeof FunctionalCategorySchema>;
export type TProviderMetadata = z.infer<typeof ProviderMetadataSchema>;
