/**
 * @file libs/tools/src/lib/supabase-auditor/probes/ExecuteSqlConnectionDiagnostic.ts
 * @section Supabase Auditor - SQL Connection Diagnostic Probe (Atom)
 * @description Sonda de solo lectura sobre `DATABASE_URL` con validación Zod, reporte forense,
 * cierre garantizado de socket en `finally` y telemetría SRE (`TelemetrySignalSchema`).
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import { z } from 'zod';

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
  type SeverityLevel,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { AnalyzePostgresExecutionError } from '../atoms/AnalyzePostgresExecutionError';
import {
  CreateSanitizedPostgresClient,
  type ISanitizedPostgresMetadata,
  type TSanitizedPostgresClient,
} from '../atoms/CreateSanitizedPostgresClient';
import { ResolveSafeCorrelationIdentifier } from '../atoms/ResolveSupabaseAuditHelpers';
import {
  type ISqlConnectionDiagnostic,
  SqlConnectionDiagnosticSchema,
} from '../schemas/SupabaseConnectionReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SQL_CONNECTION_DIAGNOSTIC_PROBE');
const SQL_PROBE_OPERATION_CODE = OperationCodeSchema.parse('EXECUTE_SQL_CONNECTION_AUDIT');
const DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY = 1000;
const SQL_INTROSPECTION_QUERY_LITERAL = `SELECT current_database() AS current_database_name,
  current_user AS active_authenticated_user, version() AS postgres_engine_version,
  pg_is_in_recovery() AS is_standby_replica;`;

const SqlIntrospectionRowSchema = z
  .object({
    current_database_name: z.string().default(''),
    active_authenticated_user: z.string().default(''),
    postgres_engine_version: z.string().default(''),
    is_standby_replica: z.boolean().default(false),
  })
  .readonly();

const emitAndSealSqlDiagnostic = (
  severityLevelLiteral: SeverityLevel,
  correlationIdentifier: CorrelationIdentifier,
  semanticIntentTag: string,
  connectionMetadata: ISanitizedPostgresMetadata,
  latencyInMillisecondsQuantity: number,
  diagnosticMessageLiteral: string,
  diagnosticFields: Readonly<Record<string, unknown>>,
): ISqlConnectionDiagnostic => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral,
    moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
    operationCodeLiteral: SQL_PROBE_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: diagnosticMessageLiteral,
    executionLatencyInMillisecondsQuantity: latencyInMillisecondsQuantity,
    semanticIntentTag,
    contextMetadataSnapshot: Object.freeze({
      ...connectionMetadata,
      ...(diagnosticFields['errorCodeLiteral'] !== undefined && {
        errorCodeLiteral: diagnosticFields['errorCodeLiteral'],
      }),
    }),
  });
  return Object.freeze(
    SqlConnectionDiagnosticSchema.parse({
      ...connectionMetadata,
      latencyInMillisecondsQuantity,
      diagnosticMessageLiteral,
      ...diagnosticFields,
    }),
  );
};

const runConnectedIntrospectionAction = async (
  clientInstance: TSanitizedPostgresClient,
  connectionMetadata: ISanitizedPostgresMetadata,
  correlationIdentifier: CorrelationIdentifier,
): Promise<ISqlConnectionDiagnostic> => {
  const startTimestampNumeric = globalThis.performance.now();
  const resolveElapsedMilliseconds = (): number =>
    Math.max(0, Math.round(globalThis.performance.now() - startTimestampNumeric));
  try {
    await clientInstance.connect();
    const queryResult = await clientInstance.query(SQL_INTROSPECTION_QUERY_LITERAL);
    const elapsedMillisecondsQuantity = resolveElapsedMilliseconds();
    const parsedRowResult = SqlIntrospectionRowSchema.safeParse(queryResult.rows[0]);
    const rowSnapshot = parsedRowResult.success
      ? parsedRowResult.data
      : SqlIntrospectionRowSchema.parse({});
    const isDegradedLatencyBoolean =
      elapsedMillisecondsQuantity > DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY;
    const modeLiteral = connectionMetadata.connectionModeLiteral;
    const diagnosticMessageLiteral = `Sesión SQL [${modeLiteral}] (${elapsedMillisecondsQuantity}ms).`;

    return emitAndSealSqlDiagnostic(
      isDegradedLatencyBoolean ? 'WARNING' : 'INFO',
      correlationIdentifier,
      'SUPABASE_SQL_CONNECTION_AUDIT_SUCCESS',
      connectionMetadata,
      elapsedMillisecondsQuantity,
      diagnosticMessageLiteral,
      {
        statusLiteral: isDegradedLatencyBoolean ? 'DEGRADED_LATENCY' : 'OPERATIONAL',
        isAuthenticatedBoolean: true,
        databaseNameLiteral: rowSnapshot.current_database_name,
        authenticatedRoleLiteral: rowSnapshot.active_authenticated_user,
        postgresVersionLiteral: rowSnapshot.postgres_engine_version,
        isStandbyReplicaBoolean: rowSnapshot.is_standby_replica,
      },
    );
  } catch (caughtExecutionError: unknown) {
    const elapsedMillisecondsQuantity = resolveElapsedMilliseconds();
    const { httpStatusCodeNumeric, diagnosticMessageLiteral, ...errorFields } =
      AnalyzePostgresExecutionError(caughtExecutionError);
    ReportForensicException(
      MapHttpErrorToException(httpStatusCodeNumeric, 'SUPABASE_SQL_CONNECTION_PROBE_FAILED', {
        ...connectionMetadata,
        errorCodeLiteral: errorFields.errorCodeLiteral,
      }),
      correlationIdentifier,
    );
    return emitAndSealSqlDiagnostic(
      'CRITICAL',
      correlationIdentifier,
      'SUPABASE_SQL_CONNECTION_AUDIT_FAILED',
      connectionMetadata,
      elapsedMillisecondsQuantity,
      diagnosticMessageLiteral,
      { isAuthenticatedBoolean: false, ...errorFields },
    );
  } finally {
    await clientInstance.end().catch(() => undefined);
  }
};

/** Ejecuta la verificación autenticada de conexión SQL contra PostgreSQL (`DATABASE_URL`). */
export const ExecuteSqlConnectionDiagnostic = async (
  correlationIdentifierFallback?: string,
): Promise<ISqlConnectionDiagnostic> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const clientResolution = CreateSanitizedPostgresClient();
  if (!clientResolution.isConfiguredBoolean) {
    return emitAndSealSqlDiagnostic(
      'WARNING',
      correlationIdentifier,
      'SUPABASE_SQL_PROBE_SKIPPED',
      clientResolution.connectionMetadata,
      0,
      clientResolution.diagnosticMessageLiteral,
      {
        statusLiteral: 'UNCONFIGURED',
        isAuthenticatedBoolean: false,
        remediationHintLiteral: 'Configurar DATABASE_URL en .env o en el panel de Vercel.',
        errorCodeLiteral: clientResolution.errorCodeLiteral,
      },
    );
  }
  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    SQL_PROBE_OPERATION_CODE,
    correlationIdentifier,
    () =>
      runConnectedIntrospectionAction(
        clientResolution.clientInstance,
        clientResolution.connectionMetadata,
        correlationIdentifier,
      ),
  );
};
