/**
 * @file libs/tools/src/lib/supabase-auditor/AuditSupabaseConnection.ts
 * @section Supabase Auditor - Deep Connection Diagnostic Orchestrator
 * @description Coordina la verificación concurrente de PostgreSQL (`DATABASE_URL`),
 * PostgREST y Storage API, certifica el reporte con Zod y lo persiste en disco.
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

import { PersistSupabaseReportToDisk } from './atoms/PersistSupabaseReportToDisk';
import { ResolveSafeCorrelationIdentifier } from './atoms/ResolveSupabaseAuditHelpers';
import { ExecuteSqlConnectionDiagnostic } from './probes/ExecuteSqlConnectionDiagnostic';
import { ExecuteSupabaseHttpLayersDiagnostic } from './probes/ExecuteSupabaseHttpLayersDiagnostic';
import {
  type ISqlConnectionDiagnostic,
  type ISupabaseConnectionReport,
  type ISupabaseHttpLayerDiagnostic,
  SupabaseAuditReportIdentifierSchema,
  SupabaseConnectionReportSchema,
  type TSupabaseConnectionCheckStatus,
} from './schemas/SupabaseConnectionReport.schema';

const ORCHESTRATOR_IDENTIFIER = ModuleIdentifierSchema.parse(
  'SUPABASE_CONNECTION_AUDITOR_ORCHESTRATOR',
);
const AUDIT_OPERATION_CODE = OperationCodeSchema.parse('EXECUTE_FULL_SUPABASE_CONNECTION_AUDIT');
const COMPLETED_OPERATION_CODE = OperationCodeSchema.parse('SUPABASE_CONNECTION_AUDIT_COMPLETED');
const REPORT_FILE_NAME_LITERAL = 'connection-diagnostic-report.json';
const HEALTHY_HTTP_STATUSES_SET: ReadonlySet<TSupabaseConnectionCheckStatus> = new Set([
  'OPERATIONAL',
  'DEGRADED_LATENCY',
]);

const compileActionableRecommendations = (
  sqlDiagnostic: ISqlConnectionDiagnostic,
  httpLayersCollection: readonly ISupabaseHttpLayerDiagnostic[],
): readonly string[] => {
  const httpHints = httpLayersCollection
    .filter((layer) => Boolean(layer.remediationHintLiteral))
    .map((layer) => `[${layer.layerIdentifierLiteral}]: ${layer.remediationHintLiteral}`);
  const collectedHints = [
    ...(sqlDiagnostic.remediationHintLiteral
      ? [`[PostgreSQL]: ${sqlDiagnostic.remediationHintLiteral}`]
      : []),
    ...httpHints,
  ];
  return Object.freeze(
    collectedHints.length > 0
      ? collectedHints
      : ['Infraestructura de conexión Supabase en estado nominal operacional (SQL y HTTP).'],
  );
};

const emitConnectionAuditTelemetryAction = (
  reportSnapshot: ISupabaseConnectionReport,
  correlationIdentifier: CorrelationIdentifier,
): void => {
  const isHealthyBoolean = reportSnapshot.isOverallConnectionHealthyBoolean;
  const verdictLabelLiteral = isHealthyBoolean ? 'NOMINAL' : 'COMPROMETIDA';
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isHealthyBoolean ? 'INFO' : 'CRITICAL',
    moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
    operationCodeLiteral: COMPLETED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `Auditoría de conexión Supabase concluida: [${verdictLabelLiteral}].`,
    executionLatencyInMillisecondsQuantity: reportSnapshot.executionDurationInMillisecondsQuantity,
    semanticIntentTag: 'SUPABASE_CONNECTION_AUDIT_CONSOLIDATED',
    contextMetadataSnapshot: Object.freeze({
      isDatabaseReachableAndAuthenticatedBoolean:
        reportSnapshot.isDatabaseReachableAndAuthenticatedBoolean,
      isOverallConnectionHealthyBoolean: isHealthyBoolean,
      executionDurationInMillisecondsQuantity:
        reportSnapshot.executionDurationInMillisecondsQuantity,
    }),
  });
};

const buildValidatedConnectionReport = (
  sqlDiagnostic: ISqlConnectionDiagnostic,
  httpLayersCollection: readonly ISupabaseHttpLayerDiagnostic[],
  executionDurationInMillisecondsQuantity: number,
  correlationIdentifier: CorrelationIdentifier,
): ISupabaseConnectionReport => {
  const isDatabaseReachableAndAuthenticatedBoolean = sqlDiagnostic.isAuthenticatedBoolean;
  const isAllHttpHealthyBoolean = httpLayersCollection.every((layer) =>
    HEALTHY_HTTP_STATUSES_SET.has(layer.statusLiteral),
  );
  const validationResult = SupabaseConnectionReportSchema.safeParse({
    reportIdentifier: SupabaseAuditReportIdentifierSchema.parse(GenerateCorrelationIdentifier()),
    auditTimestampISO: new Date().toISOString(),
    correlationIdentifier,
    executionDurationInMillisecondsQuantity,
    isDatabaseReachableAndAuthenticatedBoolean,
    isOverallConnectionHealthyBoolean:
      isDatabaseReachableAndAuthenticatedBoolean && isAllHttpHealthyBoolean,
    sqlConnectionDiagnostic: sqlDiagnostic,
    httpLayersCollection,
    actionableRecommendationsCollection: compileActionableRecommendations(
      sqlDiagnostic,
      httpLayersCollection,
    ),
  });
  if (!validationResult.success) {
    throw new InternalSystemException('SUPABASE_CONNECTION_REPORT_CONTRACT_VIOLATION', {
      validationIssuesCollection: validationResult.error.flatten(),
      correlationIdentifier,
    });
  }
  return Object.freeze(validationResult.data);
};

/**
 * Ejecuta la auditoría integral de conectividad hacia PostgreSQL y capas HTTP Supabase.
 *
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad forense.
 * @returns {Promise<ISupabaseConnectionReport>} Reporte maestro validado, inmutable y persistido.
 * @throws {InternalSystemException} Si ocurre un colapso en el orquestador de auditoría.
 */
export const AuditSupabaseConnection = async (
  correlationIdentifierFallback?: string,
): Promise<ISupabaseConnectionReport> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    AUDIT_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ISupabaseConnectionReport> => {
      const executionStartTimestampNumeric = globalThis.performance.now();
      try {
        const [sqlDiagnostic, httpLayersCollection] = await Promise.all([
          ExecuteSqlConnectionDiagnostic(correlationIdentifier),
          ExecuteSupabaseHttpLayersDiagnostic(correlationIdentifier),
        ]);
        const executionDurationInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );
        const reportSnapshot = buildValidatedConnectionReport(
          sqlDiagnostic,
          httpLayersCollection,
          executionDurationInMillisecondsQuantity,
          correlationIdentifier,
        );
        await PersistSupabaseReportToDisk(
          REPORT_FILE_NAME_LITERAL,
          reportSnapshot,
          correlationIdentifier,
        );
        emitConnectionAuditTelemetryAction(reportSnapshot, correlationIdentifier);
        return reportSnapshot;
      } catch (caughtError: unknown) {
        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : new InternalSystemException('SUPABASE_CONNECTION_AUDIT_COLLAPSE', {
                originalErrorLiteral:
                  caughtError instanceof Error ? caughtError.message : String(caughtError),
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
