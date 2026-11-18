/**
 * @file libs/tools/src/lib/supabase-auditor/schemas/SupabaseDumpSnapshotReport.schema.ts
 * @section Supabase Auditor - Safe Database Dump Contract (Atom)
 * @description Contrato Zod inmutable para el reporte de volcado de solo lectura
 * (`SELECT` acotado, políticas de seguridad por fila, triggers, funciones, extensiones
 * y buckets). Certifica en tiempo de ejecución la aplicación obligatoria de
 * anonimización de datos personales bajo la LGPD y exclusión de columnas secretas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010, ISO/IEC 27001 y LGPD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { SupabaseAuditReportIdentifierSchema } from './SupabaseConnectionReport.schema';
import {
  DatabaseExtensionSnapshotSchema,
  RowLevelSecurityPolicySnapshotSchema,
  StorageBucketSnapshotSchema,
} from './SupabaseResourcesAuditReport.schema';

/**
 * @name FunctionDefinitionDumpSchema
 * @description Contrato inmutable para definiciones SQL de funciones almacenadas extraídas en solo lectura.
 */
export const FunctionDefinitionDumpSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    functionNameLiteral: z.string().min(1),
    definitionSqlLiteral: z.string().min(1),
  })
  .readonly()
  .describe('Definición SQL de función almacenada capturada desde el catálogo de PostgreSQL.');

export type IFunctionDefinitionDump = z.infer<typeof FunctionDefinitionDumpSchema>;

/**
 * @name TriggerDefinitionDumpSchema
 * @description Contrato inmutable para definiciones SQL de disparadores vinculados a tablas.
 */
export const TriggerDefinitionDumpSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    tableNameLiteral: z.string().min(1),
    triggerNameLiteral: z.string().min(1),
    definitionSqlLiteral: z.string().min(1),
  })
  .readonly()
  .describe('Definición SQL de disparador (trigger) extraída desde pg_trigger.');

export type ITriggerDefinitionDump = z.infer<typeof TriggerDefinitionDumpSchema>;

/**
 * @name TablePolicyDumpEntrySchema
 * @description Contrato inmutable de políticas Row Level Security asociadas a cada tabla.
 */
export const TablePolicyDumpEntrySchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    tableNameLiteral: z.string().min(1),
    isRowLevelSecurityEnabledBoolean: z.boolean(),
    policiesCollection: z.array(RowLevelSecurityPolicySnapshotSchema).readonly(),
  })
  .readonly()
  .describe('Estado de activación y colección de políticas RLS de una tabla específica.');

export type ITablePolicyDumpEntry = z.infer<typeof TablePolicyDumpEntrySchema>;

/**
 * @name SanitizedTableDataDumpSchema
 * @description Contrato inmutable para el muestreo acotado y anonimizado de filas por tabla.
 */
export const SanitizedTableDataDumpSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    tableNameLiteral: z.string().min(1),
    exactRowCountNumeric: z.number().int().nonnegative(),
    sampledRowsCountQuantity: z.number().int().nonnegative(),
    isTruncatedByLimitBoolean: z.boolean(),
    maskedColumnsCollection: z.array(z.string().min(1)).readonly(),
    omittedSecretColumnsCollection: z.array(z.string().min(1)).readonly(),
    rowsCollection: z.array(z.record(z.string(), z.unknown()).readonly()).readonly(),
  })
  .readonly()
  .describe('Muestreo de filas de solo lectura con columnas PII enmascaradas y secretos omitidos.');

export type ISanitizedTableDataDump = z.infer<typeof SanitizedTableDataDumpSchema>;

/**
 * @name SupabaseDumpSnapshotReportSchema
 * @description Contrato maestro del reporte `reports/supabase/database-dump-snapshot-report.json`.
 */
export const SupabaseDumpSnapshotReportSchema = z
  .object({
    reportIdentifier: SupabaseAuditReportIdentifierSchema,
    auditTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    executionDurationInMillisecondsQuantity: z.number().nonnegative(),
    targetDatabaseNameLiteral: z.string().min(1),
    isLgpdPiiMaskingAppliedBoolean: z
      .literal(true)
      .describe('Garantiza que ninguna fila cruda con PII o secretos salga sin anonimización.'),
    rowSampleLimitPerTableQuantity: z.number().int().positive(),
    installedExtensionsCollection: z.array(DatabaseExtensionSnapshotSchema).readonly(),
    storageBucketsCollection: z.array(StorageBucketSnapshotSchema).readonly(),
    functionsDefinitionsCollection: z.array(FunctionDefinitionDumpSchema).readonly(),
    triggersDefinitionsCollection: z.array(TriggerDefinitionDumpSchema).readonly(),
    tablePoliciesCollection: z.array(TablePolicyDumpEntrySchema).readonly(),
    sanitizedTablesDataCollection: z.array(SanitizedTableDataDumpSchema).readonly(),
  })
  .readonly()
  .describe('Informe maestro de volcado seguro de estructura y datos saneados de Supabase.');

export type ISupabaseDumpSnapshotReport = z.infer<typeof SupabaseDumpSnapshotReportSchema>;
