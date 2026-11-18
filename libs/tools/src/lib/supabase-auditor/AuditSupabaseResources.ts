/**
 * @file libs/tools/src/lib/supabase-auditor/AuditSupabaseResources.ts
 * @section Supabase Auditor - Granular Resources Audit Orchestrator
 * @description Orquestador de solo lectura para auditar esquemas, extensiones, tablas,
 * políticas RLS, funciones, triggers y buckets Storage, evaluando brechas contra el SSOT.
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
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
import { EvaluateSupabaseResourcesGap } from './atoms/EvaluateSupabaseResourcesGap';
import { PersistSupabaseReportToDisk } from './atoms/PersistSupabaseReportToDisk';
import { ResolveSafeCorrelationIdentifier } from './atoms/ResolveSupabaseAuditHelpers';
import {
  FetchPostgresCatalogObjects,
  type IPostgresCatalogObjectsSnapshot,
} from './probes/FetchPostgresCatalogObjects';
import { FetchPostgresTablesGranularAudit } from './probes/FetchPostgresTablesGranularAudit';
import {
  FetchSupabaseStorageBuckets,
  type IStorageBucketSnapshot,
} from './probes/FetchSupabaseStorageBuckets';
import { SupabaseAuditReportIdentifierSchema } from './schemas/SupabaseConnectionReport.schema';
import {
  type ISupabaseResourcesAuditReport,
  type ITableGranularAuditSnapshot,
  SupabaseResourcesAuditReportSchema,
} from './schemas/SupabaseResourcesAuditReport.schema';

const ORCHESTRATOR_IDENTIFIER = ModuleIdentifierSchema.parse(
  'SUPABASE_RESOURCES_AUDITOR_ORCHESTRATOR',
);
const AUDIT_OPERATION_CODE = OperationCodeSchema.parse('EXECUTE_SUPABASE_RESOURCES_AUDIT');
const COMPLETED_OPERATION_CODE = OperationCodeSchema.parse('SUPABASE_RESOURCES_AUDIT_COMPLETED');
const REPORT_FILE_NAME_LITERAL = 'resources-audit-report.json';

const collectPostgresMetadataAction = async (
  clientInstance: TSanitizedPostgresClient,
  correlationIdentifier: CorrelationIdentifier,
) => ({
  catalogSnapshot: await FetchPostgresCatalogObjects(clientInstance, correlationIdentifier),
  tablesAuditCollection: await FetchPostgresTablesGranularAudit(
    clientInstance,
    correlationIdentifier,
  ),
});

const emitResourcesAuditSummarySignalAction = (
  reportSnapshot: ISupabaseResourcesAuditReport,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  const isProvisionedBoolean = reportSnapshot.gapAnalysisSummary.isFullyProvisionedBoolean;
  const securityAlertsCountQuantity =
    reportSnapshot.gapAnalysisSummary.securityAlertsCollection.length;
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isProvisionedBoolean ? 'INFO' : 'WARNING',
    moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
    operationCodeLiteral: COMPLETED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral:
      'Auditoría granular de recursos Supabase concluida ' +
      `(Provisionada: ${String(isProvisionedBoolean)}).`,
    executionLatencyInMillisecondsQuantity: reportSnapshot.executionDurationInMillisecondsQuantity,
    semanticIntentTag: 'SUPABASE_RESOURCES_AUDIT_CONSOLIDATED',
    contextMetadataSnapshot: Object.freeze({
      isFullyProvisionedBoolean: isProvisionedBoolean,
      discoveredTablesCountQuantity: reportSnapshot.tablesAuditCollection.length,
      storageBucketsCountQuantity: reportSnapshot.storageBucketsCollection.length,
      securityAlertsCountQuantity,
    }),
  });
};

const buildValidatedResourcesReport = (
  catalogSnapshot: IPostgresCatalogObjectsSnapshot,
  tablesAuditCollection: readonly ITableGranularAuditSnapshot[],
  storageBucketsCollection: readonly IStorageBucketSnapshot[],
  executionDurationInMillisecondsQuantity: number,
  correlationIdentifier: CorrelationIdentifier,
): ISupabaseResourcesAuditReport => {
  const gapAnalysisSummary = EvaluateSupabaseResourcesGap(
    {
      installedExtensionsCollection: catalogSnapshot.installedExtensionsCollection,
      tablesAuditCollection,
      databaseFunctionsCollection: catalogSnapshot.databaseFunctionsCollection,
      databaseTriggersCollection: catalogSnapshot.databaseTriggersCollection,
      storageBucketsCollection,
    },
    correlationIdentifier,
  );
  const validationResult = SupabaseResourcesAuditReportSchema.safeParse({
    reportIdentifier: SupabaseAuditReportIdentifierSchema.parse(GenerateCorrelationIdentifier()),
    auditTimestampISO: new Date().toISOString(),
    correlationIdentifier,
    executionDurationInMillisecondsQuantity,
    targetDatabaseNameLiteral: catalogSnapshot.targetDatabaseNameLiteral,
    discoveredSchemasCollection: catalogSnapshot.discoveredSchemasCollection,
    installedExtensionsCollection: catalogSnapshot.installedExtensionsCollection,
    tablesAuditCollection,
    databaseFunctionsCollection: catalogSnapshot.databaseFunctionsCollection,
    databaseTriggersCollection: catalogSnapshot.databaseTriggersCollection,
    storageBucketsCollection,
    gapAnalysisSummary,
  });
  if (!validationResult.success) {
    throw new InternalSystemException('SUPABASE_RESOURCES_REPORT_CONTRACT_VIOLATION', {
      validationIssuesCollection: validationResult.error.flatten(),
      correlationIdentifier,
    });
  }
  return Object.freeze(validationResult.data);
};

const normalizeAuditCollapseError = (
  caughtExecutionError: unknown,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) return caughtExecutionError;
  const originalErrorLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);
  return new InternalSystemException('SUPABASE_RESOURCES_AUDIT_COLLAPSE', {
    originalErrorLiteral,
    correlationIdentifier,
  });
};

/**
 * Ejecuta la auditoría granular de recursos PostgreSQL y Storage en solo lectura.
 *
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<ISupabaseResourcesAuditReport>} Reporte validado, inmutable y persistido.
 * @throws {InternalSystemException} Si falta `DATABASE_URL` o falla la introspección SQL.
 */
export const AuditSupabaseResources = async (
  correlationIdentifierFallback?: string,
): Promise<ISupabaseResourcesAuditReport> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    AUDIT_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ISupabaseResourcesAuditReport> => {
      const startTimestampNumeric = globalThis.performance.now();
      const clientResolution = CreateSanitizedPostgresClient();
      if (!clientResolution.isConfiguredBoolean) {
        const configurationException = new InternalSystemException(
          'SUPABASE_DATABASE_URL_UNCONFIGURED',
          {
            diagnosticMessageLiteral: clientResolution.diagnosticMessageLiteral,
            errorCodeLiteral: clientResolution.errorCodeLiteral,
            correlationIdentifier,
          },
        );
        ReportForensicException(configurationException, correlationIdentifier);
        throw configurationException;
      }

      const { clientInstance } = clientResolution;
      try {
        await clientInstance.connect();
        const [{ catalogSnapshot, tablesAuditCollection }, storageBucketsCollection] =
          await Promise.all([
            collectPostgresMetadataAction(clientInstance, correlationIdentifier),
            FetchSupabaseStorageBuckets(correlationIdentifier),
          ]);
        const executionDurationInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - startTimestampNumeric),
        );
        const reportSnapshot = buildValidatedResourcesReport(
          catalogSnapshot,
          tablesAuditCollection,
          storageBucketsCollection,
          executionDurationInMillisecondsQuantity,
          correlationIdentifier,
        );
        await PersistSupabaseReportToDisk(
          REPORT_FILE_NAME_LITERAL,
          reportSnapshot,
          correlationIdentifier,
        );
        emitResourcesAuditSummarySignalAction(reportSnapshot, correlationIdentifier);
        return reportSnapshot;
      } catch (caughtExecutionError: unknown) {
        const normalizedException = normalizeAuditCollapseError(
          caughtExecutionError,
          correlationIdentifier,
        );
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      } finally {
        await clientInstance.end().catch(() => undefined);
      }
    },
  );
};
