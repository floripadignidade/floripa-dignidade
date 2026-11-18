/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/EvaluateSupabaseResourcesGap.ts
 * @section Supabase Auditor - Expected vs Actual Resources Gap Evaluator (Atom)
 * @description Contrasta recursos reales de PostgreSQL y Storage frente al catálogo SSOT.
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { SUPABASE_EXPECTED_RESOURCES_CATALOG } from '../constants/SupabaseExpectedResourcesCatalog';
import {
  DatabaseExtensionSnapshotSchema,
  DatabaseFunctionSnapshotSchema,
  DatabaseTriggerSnapshotSchema,
  ExpectedVsActualGapSummarySchema,
  type IExpectedVsActualGapSummary,
  type ITableGranularAuditSnapshot,
  StorageBucketSnapshotSchema,
  TableGranularAuditSnapshotSchema,
} from '../schemas/SupabaseResourcesAuditReport.schema';
import { ResolveSafeCorrelationIdentifier } from './ResolveSupabaseAuditHelpers';

const EVALUATOR_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SUPABASE_GAP_EVALUATOR_ATOM');
const INPUT_INVALID_CODE = OperationCodeSchema.parse('SUPABASE_GAP_INPUT_INVALID');
const WRITE_PRIVILEGES_SET = new Set(['INSERT', 'UPDATE', 'DELETE', 'TRUNCATE', 'ALL']);

/** Contrato Zod inmutable para las colecciones de recursos reales descubiertos en Supabase. */
export const EvaluateSupabaseResourcesGapInputSchema = z
  .object({
    installedExtensionsCollection: z.array(DatabaseExtensionSnapshotSchema).readonly(),
    tablesAuditCollection: z.array(TableGranularAuditSnapshotSchema).readonly(),
    databaseFunctionsCollection: z.array(DatabaseFunctionSnapshotSchema).readonly(),
    databaseTriggersCollection: z.array(DatabaseTriggerSnapshotSchema).readonly(),
    storageBucketsCollection: z.array(StorageBucketSnapshotSchema).readonly(),
  })
  .readonly();

export type IEvaluateSupabaseResourcesGapInput = z.infer<
  typeof EvaluateSupabaseResourcesGapInputSchema
>;

const collectMissing = (
  expectedCollection: readonly string[],
  actualNamesCollection: readonly string[],
): readonly string[] => {
  const actualSet = new Set(actualNamesCollection);
  return Object.freeze(expectedCollection.filter((identifier) => !actualSet.has(identifier)));
};

const hasAnonWriteExposureBoolean = (tableSnapshot: ITableGranularAuditSnapshot): boolean =>
  !tableSnapshot.isRowLevelSecurityEnabledBoolean &&
  tableSnapshot.roleGrantsCollection.some(
    (grantSnapshot) =>
      grantSnapshot.granteeRoleLiteral === 'anon' &&
      grantSnapshot.privilegesCollection.some((privilegeLiteral) =>
        WRITE_PRIVILEGES_SET.has(privilegeLiteral.toUpperCase()),
      ),
  );

const collectSecurityAlerts = (
  tablesAuditCollection: readonly ITableGranularAuditSnapshot[],
  functionsCollection: IEvaluateSupabaseResourcesGapInput['databaseFunctionsCollection'],
  tablesMissingRowLevelSecurityCollection: readonly string[],
): readonly string[] =>
  Object.freeze([
    ...tablesMissingRowLevelSecurityCollection.map(
      (tableLiteral) => `Tabla operativa sin Row Level Security (RLS) habilitado: ${tableLiteral}`,
    ),
    ...tablesAuditCollection
      .filter(hasAnonWriteExposureBoolean)
      .map(
        (tableSnapshot) =>
          'Privilegios de escritura expuestos al rol anon sin RLS en: ' +
          `${tableSnapshot.schemaNameLiteral}.${tableSnapshot.tableNameLiteral}`,
      ),
    ...functionsCollection
      .filter((functionSnapshot) => functionSnapshot.securityModeLiteral === 'SECURITY_DEFINER')
      .map(
        (functionSnapshot) =>
          'Función SECURITY_DEFINER auditada (verificar search_path explícito): ' +
          `${functionSnapshot.schemaNameLiteral}.${functionSnapshot.functionNameLiteral}`,
      ),
  ]);

const evaluateTableGaps = (tablesAuditCollection: readonly ITableGranularAuditSnapshot[]) => {
  const tablesMap = new Map(
    tablesAuditCollection.map((entry) => [
      `${entry.schemaNameLiteral}.${entry.tableNameLiteral}`,
      entry,
    ]),
  );
  const expectedTables = SUPABASE_EXPECTED_RESOURCES_CATALOG.expectedTablesCollection;
  const findMissingByCategory = (targetCategoryLiteral: 'OPERATIONAL_LEDGER' | 'CMS') =>
    Object.freeze(
      expectedTables
        .filter((entry) =>
          targetCategoryLiteral === 'OPERATIONAL_LEDGER'
            ? entry.categoryLiteral === 'OPERATIONAL_LEDGER'
            : entry.categoryLiteral !== 'OPERATIONAL_LEDGER',
        )
        .map((entry) => `${entry.schemaNameLiteral}.${entry.tableNameLiteral}`)
        .filter((qualifiedName) => !tablesMap.has(qualifiedName)),
    );
  const tablesMissingRequiredRlsCollection = Object.freeze(
    expectedTables
      .filter((entry) => entry.isRlsRequiredBoolean)
      .map((entry) => `${entry.schemaNameLiteral}.${entry.tableNameLiteral}`)
      .filter((name) => tablesMap.get(name)?.isRowLevelSecurityEnabledBoolean === false),
  );

  return {
    missingOperationalTablesCollection: findMissingByCategory('OPERATIONAL_LEDGER'),
    missingCmsTablesCollection: findMissingByCategory('CMS'),
    tablesMissingRequiredRlsCollection,
  };
};

const rejectInvalidGapInputAction = (
  validationError: z.ZodError,
  correlationIdentifier: string,
): never => {
  const validationIssuesCollection = validationError.flatten();
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: EVALUATOR_MODULE_IDENTIFIER,
    operationCodeLiteral: INPUT_INVALID_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Entradas inválidas en evaluador de brechas de recursos Supabase.',
    semanticIntentTag: 'SUPABASE_GAP_EVALUATION_INPUT_INVALID',
    contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
  });
  const validationException = new ValidationException('SUPABASE_GAP_EVALUATOR_INPUT_INVALID', {
    validationIssuesCollection,
    correlationIdentifier,
  });
  ReportForensicException(validationException, correlationIdentifier);
  throw validationException;
};

/**
 * Evalúa las brechas de aprovisionamiento y riesgos RLS frente al catálogo SSOT.
 *
 * @param inputSnapshot - Colecciones reales descubiertas en PostgreSQL y Supabase Storage.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {IExpectedVsActualGapSummary} Resumen certificado e inmutable de brechas.
 * @throws {ValidationException} Si `inputSnapshot` incumple `EvaluateSupabaseResourcesGapInputSchema`.
 */
export const EvaluateSupabaseResourcesGap = (
  inputSnapshot: IEvaluateSupabaseResourcesGapInput,
  correlationIdentifierFallback?: string,
): IExpectedVsActualGapSummary => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const inputValidation = EvaluateSupabaseResourcesGapInputSchema.safeParse(inputSnapshot);
  if (!inputValidation.success) {
    return rejectInvalidGapInputAction(inputValidation.error, correlationIdentifier);
  }

  const dataSnapshot = inputValidation.data;
  const catalog = SUPABASE_EXPECTED_RESOURCES_CATALOG;
  const missingExtensionsCollection = collectMissing(
    catalog.requiredExtensionsCollection,
    dataSnapshot.installedExtensionsCollection.map((entry) => entry.extensionNameLiteral),
  );
  const missingFunctionsCollection = collectMissing(
    catalog.expectedFunctionsCollection,
    dataSnapshot.databaseFunctionsCollection.map((entry) => entry.functionNameLiteral),
  );
  const missingTriggersCollection = collectMissing(
    catalog.expectedTriggersCollection,
    dataSnapshot.databaseTriggersCollection.map((entry) => entry.triggerNameLiteral),
  );
  const missingStorageBucketsCollection = collectMissing(
    catalog.expectedStorageBucketsCollection,
    dataSnapshot.storageBucketsCollection.map((entry) => entry.bucketNameLiteral),
  );
  const tableGapsSnapshot = evaluateTableGaps(dataSnapshot.tablesAuditCollection);
  const securityAlertsCollection = collectSecurityAlerts(
    dataSnapshot.tablesAuditCollection,
    dataSnapshot.databaseFunctionsCollection,
    tableGapsSnapshot.tablesMissingRequiredRlsCollection,
  );
  const isFullyProvisionedBoolean = [
    missingExtensionsCollection,
    tableGapsSnapshot.missingOperationalTablesCollection,
    tableGapsSnapshot.missingCmsTablesCollection,
    missingFunctionsCollection,
    missingTriggersCollection,
    missingStorageBucketsCollection,
    tableGapsSnapshot.tablesMissingRequiredRlsCollection,
  ].every((collectionSnapshot) => collectionSnapshot.length === 0);

  return Object.freeze(
    ExpectedVsActualGapSummarySchema.parse({
      isFullyProvisionedBoolean,
      missingExtensionsCollection,
      ...tableGapsSnapshot,
      missingFunctionsCollection,
      missingTriggersCollection,
      missingStorageBucketsCollection,
      securityAlertsCollection,
    }),
  );
};
