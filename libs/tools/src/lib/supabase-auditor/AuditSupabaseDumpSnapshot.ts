/**
 * @file libs/tools/src/lib/supabase-auditor/AuditSupabaseDumpSnapshot.ts
 * @section Supabase Auditor - Safe Database Dump Snapshot Orchestrator
 * @description Orquestador de solo lectura para volcado de estructura, políticas RLS y datos
 * saneados (LGPD) de Supabase, persistiendo `database-dump-snapshot-report.json`.
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010, ISO/IEC 27001 y LGPD.
 */

import { GlobalBaseException, InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  CreateSanitizedPostgresClient,
  type TSanitizedPostgresClient,
} from './atoms/CreateSanitizedPostgresClient';
import { PersistSupabaseReportToDisk } from './atoms/PersistSupabaseReportToDisk';
import { ResolveSafeCorrelationIdentifier } from './atoms/ResolveSupabaseAuditHelpers';
import { FetchPostgresCatalogObjects } from './probes/FetchPostgresCatalogObjects';
import { FetchPostgresDefinitionsDump } from './probes/FetchPostgresDefinitionsDump';
import { FetchPostgresSanitizedTablesData } from './probes/FetchPostgresSanitizedTablesData';
import { FetchPostgresTablesGranularAudit } from './probes/FetchPostgresTablesGranularAudit';
import { FetchSupabaseStorageBuckets } from './probes/FetchSupabaseStorageBuckets';
import { SupabaseAuditReportIdentifierSchema } from './schemas/SupabaseConnectionReport.schema';
import {
  type ISupabaseDumpSnapshotReport,
  SupabaseDumpSnapshotReportSchema,
  TablePolicyDumpEntrySchema,
} from './schemas/SupabaseDumpSnapshotReport.schema';
import type { ITableGranularAuditSnapshot } from './schemas/SupabaseResourcesAuditReport.schema';

const ORCHESTRATOR_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'SUPABASE_DUMP_SNAPSHOT_ORCHESTRATOR',
);
const DUMP_OPERATION_CODE = OperationCodeSchema.parse('EXECUTE_SUPABASE_DUMP_SNAPSHOT');
const DUMP_COMPLETED_CODE = OperationCodeSchema.parse('SUPABASE_DUMP_SNAPSHOT_COMPLETED');
const REPORT_FILE_NAME_LITERAL = 'database-dump-snapshot-report.json';
const ROW_SAMPLE_LIMIT_PER_TABLE_QUANTITY = 20;

const compileTablePoliciesDump = (tablesCollection: readonly ITableGranularAuditSnapshot[]) =>
  TablePolicyDumpEntrySchema.array()
    .readonly()
    .parse(
      tablesCollection.map((tableSnapshot) => ({
        schemaNameLiteral: tableSnapshot.schemaNameLiteral,
        tableNameLiteral: tableSnapshot.tableNameLiteral,
        isRowLevelSecurityEnabledBoolean: tableSnapshot.isRowLevelSecurityEnabledBoolean,
        policiesCollection: tableSnapshot.policiesCollection,
      })),
    );

const collectSequentialPostgresDumpAction = async (
  clientInstance: TSanitizedPostgresClient,
  correlationIdentifier: CorrelationIdentifier,
) => {
  await clientInstance.connect();
  try {
    const catalogSnapshot = await FetchPostgresCatalogObjects(
      clientInstance,
      correlationIdentifier,
    );
    const definitionsSnapshot = await FetchPostgresDefinitionsDump(
      clientInstance,
      correlationIdentifier,
    );
    const tablesAuditCollection = await FetchPostgresTablesGranularAudit(
      clientInstance,
      correlationIdentifier,
    );
    const sanitizedTablesDataCollection = await FetchPostgresSanitizedTablesData(
      clientInstance,
      tablesAuditCollection,
      correlationIdentifier,
    );
    return Object.freeze({
      catalogSnapshot,
      definitionsSnapshot,
      tablesAuditCollection,
      sanitizedTablesDataCollection,
    });
  } finally {
    await clientInstance.end().catch(() => undefined);
  }
};

const executeConnectedDumpAction = async (
  clientInstance: TSanitizedPostgresClient,
  correlationIdentifier: CorrelationIdentifier,
  executionStartTimestampNumeric: number,
): Promise<ISupabaseDumpSnapshotReport> => {
  const [postgresDumpSnapshot, storageBucketsCollection] = await Promise.all([
    collectSequentialPostgresDumpAction(clientInstance, correlationIdentifier),
    FetchSupabaseStorageBuckets(correlationIdentifier),
  ]);
  const executionDurationInMillisecondsQuantity = Math.max(
    0,
    Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
  );
  const reportSnapshot = SupabaseDumpSnapshotReportSchema.parse({
    reportIdentifier: SupabaseAuditReportIdentifierSchema.parse(GenerateCorrelationIdentifier()),
    auditTimestampISO: new Date().toISOString(),
    correlationIdentifier,
    executionDurationInMillisecondsQuantity,
    targetDatabaseNameLiteral: postgresDumpSnapshot.catalogSnapshot.targetDatabaseNameLiteral,
    isLgpdPiiMaskingAppliedBoolean: true,
    rowSampleLimitPerTableQuantity: ROW_SAMPLE_LIMIT_PER_TABLE_QUANTITY,
    installedExtensionsCollection:
      postgresDumpSnapshot.catalogSnapshot.installedExtensionsCollection,
    storageBucketsCollection,
    functionsDefinitionsCollection:
      postgresDumpSnapshot.definitionsSnapshot.functionsDefinitionsCollection,
    triggersDefinitionsCollection:
      postgresDumpSnapshot.definitionsSnapshot.triggersDefinitionsCollection,
    tablePoliciesCollection: compileTablePoliciesDump(postgresDumpSnapshot.tablesAuditCollection),
    sanitizedTablesDataCollection: postgresDumpSnapshot.sanitizedTablesDataCollection,
  });
  await PersistSupabaseReportToDisk(
    REPORT_FILE_NAME_LITERAL,
    reportSnapshot,
    correlationIdentifier,
  );
  return Object.freeze(reportSnapshot);
};

/** Ejecuta el volcado seguro en solo lectura de esquemas, políticas RLS y datos saneados (LGPD). */
export const AuditSupabaseDumpSnapshot = async (
  correlationIdentifierFallback?: string,
): Promise<ISupabaseDumpSnapshotReport> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    DUMP_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ISupabaseDumpSnapshotReport> => {
      const executionStartTimestampNumeric = globalThis.performance.now();
      const clientResolution = CreateSanitizedPostgresClient();
      try {
        if (!clientResolution.isConfiguredBoolean) {
          throw new InternalSystemException('SUPABASE_DATABASE_URL_UNCONFIGURED', {
            diagnosticMessageLiteral: clientResolution.diagnosticMessageLiteral,
            errorCodeLiteral: clientResolution.errorCodeLiteral,
            correlationIdentifier,
          });
        }
        const reportSnapshot = await executeConnectedDumpAction(
          clientResolution.clientInstance,
          correlationIdentifier,
          executionStartTimestampNumeric,
        );
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: DUMP_COMPLETED_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Volcado seguro de estructura y datos saneados (LGPD) completado con éxito.',
          executionLatencyInMillisecondsQuantity:
            reportSnapshot.executionDurationInMillisecondsQuantity,
          semanticIntentTag: 'SUPABASE_DUMP_SNAPSHOT_CONSOLIDATED',
          contextMetadataSnapshot: Object.freeze({
            tablesDumpedCountQuantity: reportSnapshot.sanitizedTablesDataCollection.length,
            functionsCountQuantity: reportSnapshot.functionsDefinitionsCollection.length,
            storageBucketsCountQuantity: reportSnapshot.storageBucketsCollection.length,
          }),
        });
        return reportSnapshot;
      } catch (caughtExecutionError: unknown) {
        const errorMessageLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : new InternalSystemException('SUPABASE_DUMP_SNAPSHOT_AUDIT_COLLAPSE', {
                originalErrorLiteral: errorMessageLiteral,
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
