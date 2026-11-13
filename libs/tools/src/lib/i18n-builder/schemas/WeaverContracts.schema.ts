/**
 * @section Tools & Infrastructure - Weaver Structural Contracts (Atom)
 * @description Contratos Zod inmutables para la auditoría de silos lingüísticos,
 * soporte transicional dual (ADR 0030 carpeta por idioma + formato plano legado),
 * detección de asimetrías de claves y emisión del reporte forense de compilación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name LinguisticSiloFormatSchema
 * @description Formato físico detectado en disco para un silo `i18n/`.
 */
export const LinguisticSiloFormatSchema = z
  .enum(['FOLDER_PER_LOCALE', 'LEGACY_FLAT_FILE'])
  .describe('Estructura física del silo: carpeta por código BCP 47 o archivo JSON plano legado.');

export type TLinguisticSiloFormat = z.infer<typeof LinguisticSiloFormatSchema>;

/**
 * @name LinguisticParityViolationSchema
 * @description Detalle inmutable de una inconsistencia de claves o archivo faltante frente al idioma base.
 */
export const LinguisticParityViolationSchema = z
  .object({
    moduleIdentifierLiteral: z.string().min(1),
    localeCodeLiteral: z.string().min(2),
    namespaceLiteral: z.string().min(1),
    violationTypeLiteral: z.enum([
      'MISSING_LOCALE_FILE',
      'MISSING_TRANSLATION_KEY',
      'EXTRA_TRANSLATION_KEY',
      'INVALID_JSON_SYNTAX',
    ]),
    missingKeysCollection: z.array(z.string()).readonly(),
  })
  .readonly();

export type ILinguisticParityViolation = z.infer<typeof LinguisticParityViolationSchema>;

/**
 * @name ForensicAuditEntrySchema
 * @description Entrada de auditoría inmutable para cada silo lingüístico procesado por el Weaver.
 */
export const ForensicAuditEntrySchema = z
  .object({
    moduleIdentifierLiteral: z.string().min(1),
    filesystemPathLiteral: z.string().min(1),
    processedLocalesCollection: z.array(z.string()).readonly(),
    siloFormatLiteral: LinguisticSiloFormatSchema.optional(),
    missingLocalesCollection: z.array(z.string()).readonly().optional(),
    parityViolationsCountQuantity: z.number().int().nonnegative().optional(),
  })
  .readonly();

export type IForensicAuditEntry = z.infer<typeof ForensicAuditEntrySchema>;

/**
 * @name LinguisticModulePayloadSchema
 * @description Diccionario consolidado indexado por identificador de dominio/módulo y clave.
 */
export const LinguisticModulePayloadSchema = z
  .record(z.string(), z.record(z.string(), z.unknown()))
  .readonly();

export type ILinguisticModulePayload = z.infer<typeof LinguisticModulePayloadSchema>;

/**
 * @name WeaverAuditReportSchema
 * @description Contrato maestro del informe de auditoría lingüística persistido en `reports/`.
 */
export const WeaverAuditReportSchema = z
  .object({
    generationTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    sourceLocaleIdentifier: z.string().min(2),
    activeLocalesCollection: z.array(z.string()).readonly(),
    totalModulesProcessedQuantity: z.number().int().nonnegative(),
    isParityVerifiedBoolean: z.boolean(),
    parityViolationsCollection: z.array(LinguisticParityViolationSchema).readonly(),
    auditTrailCollection: z.array(ForensicAuditEntrySchema).readonly(),
  })
  .readonly();

export type IWeaverAuditReport = z.infer<typeof WeaverAuditReportSchema>;
