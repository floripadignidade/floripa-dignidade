/**
 * @file libs/tools/src/lib/supabase-auditor/schemas/SupabaseResourcesAuditReport.schema.ts
 * @section Supabase Auditor - Schema & Resources Audit Contract (Atom)
 * @description Contrato Zod inmutable para el reporte granular de objetos de base de
 * datos, políticas RLS, funciones, triggers, buckets y evaluación de brechas contra
 * `SUPABASE_EXPECTED_RESOURCES_CATALOG`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { SupabaseAuditReportIdentifierSchema } from './SupabaseConnectionReport.schema';

export const DatabaseExtensionSnapshotSchema = z
  .object({
    extensionNameLiteral: z.string().min(1),
    installedVersionLiteral: z.string().min(1),
    schemaNameLiteral: z.string().min(1),
  })
  .readonly();

export const TableColumnSnapshotSchema = z
  .object({
    columnNameLiteral: z.string().min(1),
    dataTypeLiteral: z.string().min(1),
    isNullableBoolean: z.boolean(),
    defaultValueLiteral: z.string().nullable(),
  })
  .readonly();

export const TableConstraintSnapshotSchema = z
  .object({
    constraintNameLiteral: z.string().min(1),
    constraintTypeLiteral: z.string().min(1),
  })
  .readonly();

export const TableIndexSnapshotSchema = z
  .object({
    indexNameLiteral: z.string().min(1),
    isUniqueBoolean: z.boolean(),
    isPrimaryBoolean: z.boolean(),
    indexDefinitionLiteral: z.string().min(1),
  })
  .readonly();

export const RowLevelSecurityPolicySnapshotSchema = z
  .object({
    policyNameLiteral: z.string().min(1),
    commandLiteral: z.string().min(1),
    permissiveModeLiteral: z.string().min(1),
    rolesCollection: z.array(z.string()).readonly(),
    usingExpressionLiteral: z.string().nullable(),
    withCheckExpressionLiteral: z.string().nullable(),
  })
  .readonly();

export const RoleTableGrantSnapshotSchema = z
  .object({
    granteeRoleLiteral: z.string().min(1),
    privilegesCollection: z.array(z.string()).readonly(),
  })
  .readonly();

export const TableGranularAuditSnapshotSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    tableNameLiteral: z.string().min(1),
    estimatedRowCountNumeric: z.number().int().nonnegative(),
    isRowLevelSecurityEnabledBoolean: z.boolean(),
    isRowLevelSecurityForcedBoolean: z.boolean(),
    columnsCollection: z.array(TableColumnSnapshotSchema).readonly(),
    constraintsCollection: z.array(TableConstraintSnapshotSchema).readonly(),
    indexesCollection: z.array(TableIndexSnapshotSchema).readonly(),
    policiesCollection: z.array(RowLevelSecurityPolicySnapshotSchema).readonly(),
    roleGrantsCollection: z.array(RoleTableGrantSnapshotSchema).readonly(),
  })
  .readonly();

export type ITableGranularAuditSnapshot = z.infer<typeof TableGranularAuditSnapshotSchema>;

export const DatabaseFunctionSnapshotSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    functionNameLiteral: z.string().min(1),
    securityModeLiteral: z.enum(['SECURITY_DEFINER', 'SECURITY_INVOKER']),
    returnTypeLiteral: z.string().min(1),
  })
  .readonly();

export const DatabaseTriggerSnapshotSchema = z
  .object({
    schemaNameLiteral: z.string().min(1),
    tableNameLiteral: z.string().min(1),
    triggerNameLiteral: z.string().min(1),
    timingLiteral: z.string().min(1),
    eventsCollection: z.array(z.string()).readonly(),
  })
  .readonly();

export const StorageBucketSnapshotSchema = z
  .object({
    bucketIdentifierLiteral: z.string().min(1),
    bucketNameLiteral: z.string().min(1),
    isPublicBoolean: z.boolean(),
    fileSizeLimitBytesNumeric: z.number().nonnegative().nullable(),
  })
  .readonly();

export const ExpectedVsActualGapSummarySchema = z
  .object({
    isFullyProvisionedBoolean: z.boolean(),
    missingExtensionsCollection: z.array(z.string()).readonly(),
    missingOperationalTablesCollection: z.array(z.string()).readonly(),
    missingCmsTablesCollection: z.array(z.string()).readonly(),
    missingFunctionsCollection: z.array(z.string()).readonly(),
    missingTriggersCollection: z.array(z.string()).readonly(),
    missingStorageBucketsCollection: z.array(z.string()).readonly(),
    tablesMissingRequiredRlsCollection: z.array(z.string()).readonly(),
    securityAlertsCollection: z.array(z.string()).readonly(),
  })
  .readonly();

export type IExpectedVsActualGapSummary = z.infer<typeof ExpectedVsActualGapSummarySchema>;

export const SupabaseResourcesAuditReportSchema = z
  .object({
    reportIdentifier: SupabaseAuditReportIdentifierSchema,
    auditTimestampISO: z.string().datetime(),
    correlationIdentifier: z.string().uuid(),
    executionDurationInMillisecondsQuantity: z.number().nonnegative(),
    targetDatabaseNameLiteral: z.string().min(1),
    discoveredSchemasCollection: z.array(z.string()).readonly(),
    installedExtensionsCollection: z.array(DatabaseExtensionSnapshotSchema).readonly(),
    tablesAuditCollection: z.array(TableGranularAuditSnapshotSchema).readonly(),
    databaseFunctionsCollection: z.array(DatabaseFunctionSnapshotSchema).readonly(),
    databaseTriggersCollection: z.array(DatabaseTriggerSnapshotSchema).readonly(),
    storageBucketsCollection: z.array(StorageBucketSnapshotSchema).readonly(),
    gapAnalysisSummary: ExpectedVsActualGapSummarySchema,
  })
  .readonly();

export type ISupabaseResourcesAuditReport = z.infer<typeof SupabaseResourcesAuditReportSchema>;
