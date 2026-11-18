/**
 * @file libs/tools/src/lib/supabase-auditor/schemas/SupabaseProvisioningReport.schema.ts
 * @section Supabase Auditor - Database Provisioning Report Contract (Atom)
 * @description Contrato Zod inmutable para configurar y certificar los resultados del
 * provisionador SQL inicial e incremental (`ProvisionInitialSupabaseDatabase`), incluyendo
 * control de ejecución (`DRY_RUN` / `APPLY`), resumen SHA-256 por archivo, migraciones
 * aplicadas, omitidas y duración medida en milisegundos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { SupabaseAuditReportIdentifierSchema } from './SupabaseConnectionReport.schema';

const MIGRATION_FILENAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.sql$/;
const SHA256_HEX_REGEX = /^[a-f0-9]{64}$/;

/**
 * @name ProvisioningExecutionModeSchema
 * @description Modalidad de ejecución: simulación segura (`DRY_RUN`) o escritura DDL (`APPLY`).
 */
export const ProvisioningExecutionModeSchema = z
  .enum(['DRY_RUN', 'APPLY'])
  .describe('Modo de ejecución del provisionador SQL sobre la base de datos.');

export type TProvisioningExecutionMode = z.infer<typeof ProvisioningExecutionModeSchema>;

/**
 * @name ProvisionedMigrationStatusSchema
 * @description Estado final resuelto para cada script SQL descubierto en `database/`.
 */
export const ProvisionedMigrationStatusSchema = z
  .enum(['APPLIED', 'SKIPPED_ALREADY_APPLIED', 'PENDING_DRY_RUN'])
  .describe('Estado de aplicación registrado tras verificar checksum SHA-256.');

export type TProvisionedMigrationStatus = z.infer<typeof ProvisionedMigrationStatusSchema>;

/**
 * @name ProvisionedMigrationEntrySchema
 * @description Contrato inmutable de trazabilidad para una migración SQL individual.
 */
export const ProvisionedMigrationEntrySchema = z
  .object({
    migrationFilenameLiteral: z
      .string()
      .trim()
      .regex(MIGRATION_FILENAME_REGEX, { message: 'INVALID_SQL_MIGRATION_FILENAME' })
      .describe('Nombre base del archivo SQL ordenado numéricamente en database/.'),
    checksumSha256Literal: z
      .string()
      .trim()
      .regex(SHA256_HEX_REGEX, { message: 'INVALID_MIGRATION_SHA256_CHECKSUM' })
      .describe('Huella criptográfica SHA-256 hexadecimal del contenido SQL.'),
    executionDurationInMillisecondsQuantity: z
      .number()
      .nonnegative()
      .describe('Latencia física en milisegundos consumida por el script.'),
    statusLiteral: ProvisionedMigrationStatusSchema,
    appliedAtTimestampISO: z
      .string()
      .datetime()
      .optional()
      .describe('Marca temporal ISO 8601 en la que la migración quedó asentada.'),
  })
  .readonly()
  .describe('Registro forense individual de una migración SQL evaluada.');

export type IProvisionedMigrationEntry = z.infer<typeof ProvisionedMigrationEntrySchema>;

/**
 * @name ProvisioningOptionsSchema
 * @description Aduana Zod para los parámetros de invocación del provisionador SQL.
 */
export const ProvisioningOptionsSchema = z
  .object({
    isApplyModeBoolean: z
      .boolean()
      .default(false)
      .describe('Habilita la ejecución real de DDL en transacción (falso ejecuta DRY_RUN).'),
    preferDirectMigrationConnectionBoolean: z
      .boolean()
      .default(true)
      .describe('Prioriza DIRECT_DATABASE_URL frente a DATABASE_URL cuando está disponible.'),
    correlationIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'PROVISIONING_CORRELATION_IDENTIFIER_MUST_BE_UUID' })
      .optional()
      .describe('Identificador UUID v4 propagado desde el runner CLI.'),
    customMigrationsDirectoryPathLiteral: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('Ruta opcional al directorio de migraciones SQL.'),
  })
  .readonly();

export type IProvisioningOptions = z.input<typeof ProvisioningOptionsSchema>;

/**
 * @name SupabaseProvisioningReportSchema
 * @description Contrato maestro inmutable del reporte `reports/supabase/provisioning-report.json`.
 */
export const SupabaseProvisioningReportSchema = z
  .object({
    reportIdentifier: SupabaseAuditReportIdentifierSchema,
    auditTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    executionModeLiteral: ProvisioningExecutionModeSchema,
    connectionSourceKeyLiteral: z.enum(['DATABASE_URL', 'DIRECT_DATABASE_URL']),
    executionDurationInMillisecondsQuantity: z.number().nonnegative(),
    totalDiscoveredMigrationsQuantity: z.number().int().nonnegative(),
    appliedMigrationsCollection: z.array(ProvisionedMigrationEntrySchema).readonly(),
    skippedMigrationsCollection: z.array(ProvisionedMigrationEntrySchema).readonly(),
    pendingMigrationsCollection: z.array(ProvisionedMigrationEntrySchema).readonly(),
    isProvisioningSuccessfulBoolean: z.boolean(),
    actionableSummaryLiteral: z.string().trim().min(1),
  })
  .readonly()
  .describe('Informe maestro inmutable de provisión SQL inicial e incremental en Supabase.');

export type ISupabaseProvisioningReport = z.infer<typeof SupabaseProvisioningReportSchema>;
