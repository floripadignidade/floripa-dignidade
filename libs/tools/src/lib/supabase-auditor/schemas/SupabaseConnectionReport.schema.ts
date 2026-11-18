/**
 * @file libs/tools/src/lib/supabase-auditor/schemas/SupabaseConnectionReport.schema.ts
 * @section Supabase Auditor - Connection Diagnostic Contract (Atom)
 * @description Contrato Zod inmutable para el reporte de verificación profunda de
 * conexión hacia PostgreSQL (`DATABASE_URL`), PostgREST (`SUPABASE_URL`) y Storage API.
 * Implementa tipado nominal (Branded Types), `.readonly()` y `.describe()`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name SupabaseAuditReportIdentifierSchema
 * @description Identificador único nominal (UUID v4) para reportes forenses de Supabase.
 */
export const SupabaseAuditReportIdentifierSchema = z
  .string()
  .uuid({ message: 'SUPABASE_REPORT_IDENTIFIER_MUST_BE_UUID' })
  .brand<'SupabaseAuditReportIdentifier'>()
  .describe('Identificador único inmutable del reporte generado para Supabase.');

export type TSupabaseAuditReportIdentifier = z.infer<typeof SupabaseAuditReportIdentifierSchema>;

/**
 * @name SupabaseConnectionCheckStatusSchema
 * @description Estados categóricos de conectividad y autenticación por capa de red.
 */
export const SupabaseConnectionCheckStatusSchema = z
  .enum(['OPERATIONAL', 'DEGRADED_LATENCY', 'AUTHENTICATION_FAILED', 'UNREACHABLE', 'UNCONFIGURED'])
  .describe('Estado técnico resuelto para la capa de conectividad evaluada.');

export type TSupabaseConnectionCheckStatus = z.infer<typeof SupabaseConnectionCheckStatusSchema>;

/**
 * @name PostgresConnectionModeSchema
 * @description Clasificación topológica del destino PostgreSQL (Pooler Supabase vs Directo).
 */
export const PostgresConnectionModeSchema = z
  .enum(['POOLER_TRANSACTION_OR_SESSION', 'DIRECT_HOST', 'UNKNOWN'])
  .describe('Modalidad de conexión detectada en el host y puerto de PostgreSQL.');

export type TPostgresConnectionMode = z.infer<typeof PostgresConnectionModeSchema>;

/**
 * @name SqlConnectionDiagnosticSchema
 * @description Resultado detallado de autenticación SQL real (`SELECT current_database(), ...`).
 */
export const SqlConnectionDiagnosticSchema = z
  .object({
    statusLiteral: SupabaseConnectionCheckStatusSchema,
    isAuthenticatedBoolean: z.boolean(),
    isSslEncryptedBoolean: z.boolean(),
    connectionModeLiteral: PostgresConnectionModeSchema,
    targetHostLiteral: z.string().min(1),
    targetPortNumeric: z.number().int().positive(),
    latencyInMillisecondsQuantity: z.number().nonnegative(),
    databaseNameLiteral: z.string().optional(),
    authenticatedRoleLiteral: z.string().optional(),
    postgresVersionLiteral: z.string().optional(),
    isStandbyReplicaBoolean: z.boolean().optional(),
    diagnosticMessageLiteral: z.string().min(1),
    remediationHintLiteral: z.string().optional(),
    errorCodeLiteral: z.string().optional(),
  })
  .readonly()
  .describe('Diagnóstico autenticado de la sesión PostgreSQL sobre DATABASE_URL.');

export type ISqlConnectionDiagnostic = z.infer<typeof SqlConnectionDiagnosticSchema>;

/**
 * @name SupabaseHttpLayerDiagnosticSchema
 * @description Resultado de verificación HTTP para PostgREST y Supabase Storage API.
 */
export const SupabaseHttpLayerDiagnosticSchema = z
  .object({
    layerIdentifierLiteral: z.enum(['POSTGREST_REST_API', 'SUPABASE_STORAGE_API']),
    statusLiteral: SupabaseConnectionCheckStatusSchema,
    httpStatusCodeNumeric: z.number().int().nonnegative().optional(),
    latencyInMillisecondsQuantity: z.number().nonnegative(),
    sanitizedEndpointLiteral: z.string().min(1),
    diagnosticMessageLiteral: z.string().min(1),
    remediationHintLiteral: z.string().optional(),
  })
  .readonly()
  .describe('Diagnóstico de disponibilidad y autenticación de capas HTTP Supabase.');

export type ISupabaseHttpLayerDiagnostic = z.infer<typeof SupabaseHttpLayerDiagnosticSchema>;

/**
 * @name SupabaseConnectionReportSchema
 * @description Contrato maestro del reporte `reports/supabase/connection-diagnostic-report.json`.
 */
export const SupabaseConnectionReportSchema = z
  .object({
    reportIdentifier: SupabaseAuditReportIdentifierSchema,
    auditTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    executionDurationInMillisecondsQuantity: z.number().nonnegative(),
    isDatabaseReachableAndAuthenticatedBoolean: z.boolean(),
    isOverallConnectionHealthyBoolean: z.boolean(),
    sqlConnectionDiagnostic: SqlConnectionDiagnosticSchema,
    httpLayersCollection: z.array(SupabaseHttpLayerDiagnosticSchema).min(1).readonly(),
    actionableRecommendationsCollection: z.array(z.string()).readonly(),
  })
  .readonly()
  .describe('Informe maestro de diagnóstico de conexión PostgreSQL y Supabase.');

export type ISupabaseConnectionReport = z.infer<typeof SupabaseConnectionReportSchema>;
