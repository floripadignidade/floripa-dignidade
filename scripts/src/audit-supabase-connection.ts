/**
 * @file scripts/src/audit-supabase-connection.ts
 * @section Scripts & Automation - Supabase Connection Diagnostic CLI Runner
 * @description Disparador CLI encargado de ejecutar la auditoría profunda de conexión
 * contra PostgreSQL (`DATABASE_URL`), PostgREST y Storage API, renderizando el
 * diagnóstico ANSI vía `console.warn` con códigos de salida deterministas `0` o `1`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import process from 'node:process';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';
import {
  AuditSupabaseConnection,
  type ISqlConnectionDiagnostic,
  type ISupabaseConnectionReport,
  type ISupabaseHttpLayerDiagnostic,
  type TSupabaseConnectionCheckStatus,
} from '@floripa-dignidade/tools';

const SCRIPT_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SUPABASE_CONNECTION_CLI_RUNNER',
);
const CLI_TRIGGER_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_CONNECTION_AUDIT_TRIGGERED',
);
const CLI_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_CONNECTION_AUDIT_COLLAPSE',
);
const REPORT_OUTPUT_PATH_LITERAL = 'reports/supabase/connection-diagnostic-report.json';

const ANSI_COLORS = Object.freeze({
  resetLiteral: '\x1b[0m',
  boldLiteral: '\x1b[1m',
  greenLiteral: '\x1b[32m',
  yellowLiteral: '\x1b[33m',
  redLiteral: '\x1b[31m',
  cyanLiteral: '\x1b[36m',
  grayLiteral: '\x1b[90m',
});

const STATUS_COLOR_MAPPING: Readonly<Record<TSupabaseConnectionCheckStatus, string>> =
  Object.freeze({
    OPERATIONAL: ANSI_COLORS.greenLiteral,
    DEGRADED_LATENCY: ANSI_COLORS.yellowLiteral,
    AUTHENTICATION_FAILED: ANSI_COLORS.redLiteral,
    UNREACHABLE: ANSI_COLORS.redLiteral,
    UNCONFIGURED: ANSI_COLORS.redLiteral,
  });

const formatPostgresVersionPreviewLiteral = (rawVersionLiteral: string | undefined): string => {
  if (!rawVersionLiteral) return 'UNKNOWN';
  return rawVersionLiteral.length > 32 ? `${rawVersionLiteral.slice(0, 32)}...` : rawVersionLiteral;
};

const renderSqlLayerOutput = (sqlDiagnosticSnapshot: ISqlConnectionDiagnostic): void => {
  const statusColorLiteral = STATUS_COLOR_MAPPING[sqlDiagnosticSnapshot.statusLiteral];
  const { boldLiteral, grayLiteral, resetLiteral } = ANSI_COLORS;
  const endpointTargetLiteral = `${sqlDiagnosticSnapshot.targetHostLiteral}:${sqlDiagnosticSnapshot.targetPortNumeric}`;
  const sslStatusLiteral = String(sqlDiagnosticSnapshot.isSslEncryptedBoolean);

  console.warn(`\n${boldLiteral}1. CAPA POSTGRESQL (SESIÓN SQL AUTENTICADA):${resetLiteral}`);
  console.warn(
    `   ${statusColorLiteral}● [${sqlDiagnosticSnapshot.statusLiteral}]${resetLiteral}` +
      ` ${sqlDiagnosticSnapshot.diagnosticMessageLiteral}`,
  );
  console.warn(
    `   ${grayLiteral}Destino:${resetLiteral} ${endpointTargetLiteral}` +
      ` | ${grayLiteral}Modo:${resetLiteral} ${sqlDiagnosticSnapshot.connectionModeLiteral}` +
      ` | ${grayLiteral}SSL:${resetLiteral} ${sslStatusLiteral}`,
  );

  if (sqlDiagnosticSnapshot.databaseNameLiteral) {
    const activeRoleLiteral = sqlDiagnosticSnapshot.authenticatedRoleLiteral ?? 'UNKNOWN';
    const versionLiteral = formatPostgresVersionPreviewLiteral(
      sqlDiagnosticSnapshot.postgresVersionLiteral,
    );
    console.warn(
      `   ${grayLiteral}Base:${resetLiteral} ${sqlDiagnosticSnapshot.databaseNameLiteral}` +
        ` | ${grayLiteral}Usuario:${resetLiteral} ${activeRoleLiteral}` +
        ` | ${grayLiteral}Versión:${resetLiteral} ${versionLiteral}`,
    );
  }
};

const renderHttpLayersOutput = (
  httpLayersCollection: readonly ISupabaseHttpLayerDiagnostic[],
): void => {
  const { boldLiteral, grayLiteral, resetLiteral } = ANSI_COLORS;
  console.warn(`\n${boldLiteral}2. CAPAS HTTP DE SUPABASE (POSTGREST & STORAGE):${resetLiteral}`);

  for (const httpLayerSnapshot of httpLayersCollection) {
    const statusColorLiteral = STATUS_COLOR_MAPPING[httpLayerSnapshot.statusLiteral];
    const httpStatusLabelLiteral = httpLayerSnapshot.httpStatusCodeNumeric
      ? `(HTTP ${httpLayerSnapshot.httpStatusCodeNumeric}) `
      : '';
    const latencyMsQuantity = httpLayerSnapshot.latencyInMillisecondsQuantity;

    console.warn(
      `   ${statusColorLiteral}● [${httpLayerSnapshot.layerIdentifierLiteral}]${resetLiteral}` +
        ` ${httpStatusLabelLiteral}- ${httpLayerSnapshot.statusLiteral} (${latencyMsQuantity}ms)`,
    );
    console.warn(
      `     ${grayLiteral}Endpoint:${resetLiteral} ${httpLayerSnapshot.sanitizedEndpointLiteral}`,
    );
  }
};

const renderSummaryAndRecommendations = (reportSnapshot: ISupabaseConnectionReport): void => {
  const { boldLiteral, cyanLiteral, resetLiteral } = ANSI_COLORS;
  const durationMsQuantity = reportSnapshot.executionDurationInMillisecondsQuantity;

  console.warn(`\n${boldLiteral}3. RECOMENDACIONES ACCIONABLES:${resetLiteral}`);
  for (const recommendationLiteral of reportSnapshot.actionableRecommendationsCollection) {
    console.warn(`   ${cyanLiteral}↳${resetLiteral} ${recommendationLiteral}`);
  }

  console.warn(
    `\n${boldLiteral}Duración Total de Auditoría:${resetLiteral} ${durationMsQuantity}ms`,
  );
  console.warn(
    `${boldLiteral}Reporte Forense JSON:${resetLiteral}        ` +
      `${cyanLiteral}${REPORT_OUTPUT_PATH_LITERAL}${resetLiteral}\n`,
  );
};

const ExecuteCommandLineRunner = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { boldLiteral, cyanLiteral, greenLiteral, redLiteral, resetLiteral } = ANSI_COLORS;
  const bannerLiteral = '--- [FLORIPA DIGNIDADE]: DIAGNÓSTICO PROFUNDO DE CONEXIÓN A SUPABASE ---';

  console.warn(`\n${boldLiteral}${cyanLiteral}${bannerLiteral}${resetLiteral}`);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: CLI_TRIGGER_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Iniciando runner CLI de diagnóstico profundo de conexión a Supabase.',
    semanticIntentTag: 'CLI_SUPABASE_CONNECTION_AUDIT_START',
  });

  try {
    const reportSnapshot = await AuditSupabaseConnection(correlationIdentifier);

    renderSqlLayerOutput(reportSnapshot.sqlConnectionDiagnostic);
    renderHttpLayersOutput(reportSnapshot.httpLayersCollection);
    renderSummaryAndRecommendations(reportSnapshot);

    if (reportSnapshot.isOverallConnectionHealthyBoolean) {
      console.warn(
        `${boldLiteral}${greenLiteral}✔ CONEXIÓN OPERACIONAL:` +
          ` PostgreSQL y servicios HTTP Supabase listos.${resetLiteral}\n`,
      );
      process.exit(0);
    }

    console.warn(
      `${boldLiteral}${redLiteral}✖ CONEXIÓN COMPROMETIDA:` +
        ` Se identificaron anomalías o credenciales rechazadas.${resetLiteral}\n`,
    );
    process.exit(1);
  } catch (caughtExecutionError: unknown) {
    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
      operationCodeLiteral: CLI_COLLAPSE_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: `Colapso en runner CLI de diagnóstico Supabase: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'CLI_SUPABASE_CONNECTION_AUDIT_FAULT',
      contextMetadataSnapshot: Object.freeze({ errorDescriptionLiteral }),
    });

    console.error(
      `\n${boldLiteral}${redLiteral}COLAPSO EN EJECUCIÓN DE AUDITORÍA:${resetLiteral}` +
        ` ${errorDescriptionLiteral}\n`,
    );
    process.exit(1);
  }
};

void ExecuteCommandLineRunner();
