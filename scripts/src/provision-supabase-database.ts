/**
 * @file scripts/src/provision-supabase-database.ts
 * @section Scripts & Automation - Supabase Idempotent SQL Provisioning CLI Runner
 * @description Disparador CLI para ejecutar el provisionamiento inicial e incremental de
 * esquemas SQL en Supabase (`database/*.sql`). Opera en modo seguro `--dry-run` por defecto
 * y exige confirmación explícita (`--apply`) para ejecutar DDL transaccional.
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
  ModuleIdentifierSchema,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';
import {
  type IProvisionedMigrationEntry,
  type ISupabaseProvisioningReport,
  ProvisionInitialSupabaseDatabase,
} from '@floripa-dignidade/tools';

const SCRIPT_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SUPABASE_PROVISIONING_CLI_RUNNER');
const CLI_TRIGGER_OPERATION_CODE = OperationCodeSchema.parse('CLI_SUPABASE_PROVISIONING_TRIGGERED');
const CLI_COLLAPSE_OPERATION_CODE = OperationCodeSchema.parse('CLI_SUPABASE_PROVISIONING_COLLAPSE');
const REPORT_OUTPUT_PATH_LITERAL = 'reports/supabase/provisioning-report.json';

const ANSI_COLORS = Object.freeze({
  resetLiteral: '\x1b[0m',
  boldLiteral: '\x1b[1m',
  greenLiteral: '\x1b[32m',
  yellowLiteral: '\x1b[33m',
  redLiteral: '\x1b[31m',
  cyanLiteral: '\x1b[36m',
  grayLiteral: '\x1b[90m',
});

const parseProvisioningCliFlags = (commandArgumentsCollection: readonly string[]) => {
  const hasApplyFlagBoolean = commandArgumentsCollection.includes('--apply');
  const hasDryRunFlagBoolean = commandArgumentsCollection.includes('--dry-run');
  const isDirectDisabledBoolean = commandArgumentsCollection.includes('--no-direct');

  return Object.freeze({
    isApplyModeBoolean: hasDryRunFlagBoolean ? false : hasApplyFlagBoolean,
    preferDirectMigrationConnectionBoolean: !isDirectDisabledBoolean,
  });
};

const renderMigrationGroup = (
  headingLiteral: string,
  colorLiteral: string,
  markerLiteral: string,
  entriesCollection: readonly IProvisionedMigrationEntry[],
): void => {
  if (entriesCollection.length === 0) return;

  const { boldLiteral, grayLiteral, resetLiteral } = ANSI_COLORS;
  console.warn(`\n${boldLiteral}${headingLiteral}:${resetLiteral}`);
  for (const entrySnapshot of entriesCollection) {
    const checksumPreviewLiteral = entrySnapshot.checksumSha256Literal.slice(0, 12);
    const durationMsQuantity = entrySnapshot.executionDurationInMillisecondsQuantity;
    console.warn(
      `   ${colorLiteral}${markerLiteral}${resetLiteral} ${entrySnapshot.migrationFilenameLiteral}` +
        ` ${grayLiteral}(sha256: ${checksumPreviewLiteral}... | ${durationMsQuantity}ms)${resetLiteral}`,
    );
  }
};

const renderProvisioningSummary = (reportSnapshot: ISupabaseProvisioningReport): void => {
  const { boldLiteral, cyanLiteral, grayLiteral, greenLiteral, resetLiteral, yellowLiteral } =
    ANSI_COLORS;
  const modeColorLiteral =
    reportSnapshot.executionModeLiteral === 'APPLY' ? greenLiteral : yellowLiteral;
  const discoveredQuantity = reportSnapshot.totalDiscoveredMigrationsQuantity;
  const durationMsQuantity = reportSnapshot.executionDurationInMillisecondsQuantity;

  console.warn(
    `\n${boldLiteral}Modo:${resetLiteral} ${modeColorLiteral}${reportSnapshot.executionModeLiteral}${resetLiteral}` +
      ` | ${boldLiteral}Canal:${resetLiteral} ${reportSnapshot.connectionSourceKeyLiteral}` +
      ` | ${boldLiteral}Descubiertas:${resetLiteral} ${discoveredQuantity}`,
  );

  renderMigrationGroup(
    'MIGRACIONES APLICADAS EN ESTA EJECUCIÓN',
    greenLiteral,
    '✔',
    reportSnapshot.appliedMigrationsCollection,
  );
  renderMigrationGroup(
    'MIGRACIONES OMITIDAS (YA APLICADAS CON CHECKSUM ÍNTEGRO)',
    grayLiteral,
    '●',
    reportSnapshot.skippedMigrationsCollection,
  );
  renderMigrationGroup(
    'MIGRACIONES PENDIENTES DETECTADAS (MODO DRY_RUN)',
    yellowLiteral,
    '▶',
    reportSnapshot.pendingMigrationsCollection,
  );

  console.warn(`\n${boldLiteral}Duración Total:${resetLiteral}       ${durationMsQuantity}ms`);
  console.warn(
    `${boldLiteral}Reporte Forense JSON:${resetLiteral} ` +
      `${cyanLiteral}${REPORT_OUTPUT_PATH_LITERAL}${resetLiteral}`,
  );
  console.warn(
    `${boldLiteral}Resumen:${resetLiteral}              ${reportSnapshot.actionableSummaryLiteral}\n`,
  );
};

const ExecuteCommandLineRunner = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { boldLiteral, cyanLiteral, greenLiteral, redLiteral, resetLiteral, yellowLiteral } =
    ANSI_COLORS;
  const { isApplyModeBoolean, preferDirectMigrationConnectionBoolean } = parseProvisioningCliFlags(
    process.argv.slice(2),
  );
  const bannerTitleLiteral =
    '--- [FLORIPA DIGNIDADE]: PROVISIONAMIENTO SQL IDEMPOTENTE DE SUPABASE ---';

  console.warn(`\n${boldLiteral}${cyanLiteral}${bannerTitleLiteral}${resetLiteral}`);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: CLI_TRIGGER_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Iniciando runner CLI de provisionamiento SQL de Supabase.',
    semanticIntentTag: 'CLI_SUPABASE_PROVISIONING_START',
    contextMetadataSnapshot: Object.freeze({
      isApplyModeBoolean,
      preferDirectMigrationConnectionBoolean,
    }),
  });

  try {
    const reportSnapshot = await ProvisionInitialSupabaseDatabase({
      isApplyModeBoolean,
      preferDirectMigrationConnectionBoolean,
      correlationIdentifier,
    });

    renderProvisioningSummary(reportSnapshot);

    if (!isApplyModeBoolean && reportSnapshot.pendingMigrationsCollection.length > 0) {
      console.warn(
        `${boldLiteral}${yellowLiteral}ℹ MODO DRY_RUN ACTIVO:${resetLiteral}` +
          ' Ejecuta con --apply para aplicar las migraciones pendientes en transacción.\n',
      );
    } else {
      console.warn(
        `${boldLiteral}${greenLiteral}✔ PROVISIONAMIENTO SQL CONSOLIDADO EXITOSAMENTE.${resetLiteral}\n`,
      );
    }

    process.exit(0);
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
      messageContentLiteral: `Colapso en provisionamiento SQL de Supabase: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'CLI_SUPABASE_PROVISIONING_FAULT',
      contextMetadataSnapshot: Object.freeze({ errorDescriptionLiteral }),
    });

    console.error(
      `\n${boldLiteral}${redLiteral}✖ FALLO EN PROVISIONAMIENTO SQL:${resetLiteral}` +
        ` ${errorDescriptionLiteral}\n`,
    );
    process.exit(1);
  }
};

void ExecuteCommandLineRunner();
