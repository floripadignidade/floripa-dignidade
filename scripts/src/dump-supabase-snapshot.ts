/**
 * @file scripts/src/dump-supabase-snapshot.ts
 * @section Scripts & Automation - Supabase Database Dump Snapshot CLI Runner
 * @description Disparador de terminal (CLI) encargado de ejecutar el volcado seguro
 * de solo lectura de esquemas, políticas RLS, funciones y datos saneados (LGPD)
 * de Supabase. Renderiza el resumen de volcado con códigos de escape ANSI vía `console.warn`
 * y emite el código de salida determinista `0` o `1` para pipelines locales y de CI/CD.
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
  AuditSupabaseDumpSnapshot,
  type ISupabaseDumpSnapshotReport,
} from '@floripa-dignidade/tools';

const SCRIPT_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SUPABASE_DUMP_CLI_RUNNER',
);
const CLI_TRIGGER_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_DUMP_SNAPSHOT_TRIGGERED',
);
const CLI_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_DUMP_SNAPSHOT_COLLAPSE',
);

const ANSI_COLORS = Object.freeze({
  resetLiteral: '\x1b[0m',
  boldLiteral: '\x1b[1m',
  greenLiteral: '\x1b[32m',
  redLiteral: '\x1b[31m',
  cyanLiteral: '\x1b[36m',
  grayLiteral: '\x1b[90m',
});

const REPORT_OUTPUT_PATH_LITERAL = 'reports/supabase/database-dump-snapshot-report.json';

const renderDumpSnapshotSummaryOutput = (reportSnapshot: ISupabaseDumpSnapshotReport): void => {
  const { boldLiteral, cyanLiteral, grayLiteral, greenLiteral, resetLiteral } = ANSI_COLORS;
  const databaseNameLiteral = `${cyanLiteral}${reportSnapshot.targetDatabaseNameLiteral}${resetLiteral}`;
  const maskingFlagLiteral = `${greenLiteral}${String(reportSnapshot.isLgpdPiiMaskingAppliedBoolean)}${resetLiteral}`;
  const tablesQuantity = reportSnapshot.sanitizedTablesDataCollection.length;
  const rowLimitQuantity = reportSnapshot.rowSampleLimitPerTableQuantity;
  const extensionsQuantity = reportSnapshot.installedExtensionsCollection.length;
  const bucketsQuantity = reportSnapshot.storageBucketsCollection.length;
  const functionsQuantity = reportSnapshot.functionsDefinitionsCollection.length;
  const triggersQuantity = reportSnapshot.triggersDefinitionsCollection.length;

  console.warn(
    `\n${boldLiteral}1. RESUMEN DEL VOLCADO SEGURO DE DATOS (LGPD COMPLIANT):${resetLiteral}`,
  );
  console.warn(
    `   ${grayLiteral}Base de Datos:${resetLiteral} ${databaseNameLiteral}` +
      ` | ${grayLiteral}Máscara PII LGPD:${resetLiteral} ${maskingFlagLiteral}`,
  );
  console.warn(
    `   ${grayLiteral}● Tablas Muestreadas:${resetLiteral} ${tablesQuantity}` +
      ` (Límite por tabla: ${rowLimitQuantity} filas)`,
  );
  console.warn(
    `   ${grayLiteral}● Extensiones:${resetLiteral} ${extensionsQuantity}` +
      ` | ${grayLiteral}Buckets S3:${resetLiteral} ${bucketsQuantity}`,
  );
  console.warn(
    `   ${grayLiteral}● Funciones SQL:${resetLiteral} ${functionsQuantity}` +
      ` | ${grayLiteral}Triggers:${resetLiteral} ${triggersQuantity}`,
  );
};

const ExecuteCommandLineRunner = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { boldLiteral, cyanLiteral, greenLiteral, redLiteral, resetLiteral } = ANSI_COLORS;
  const bannerTitleLiteral = '--- [FLORIPA DIGNIDADE]: VOLCADO SEGURO DE SNAPSHOT DE SUPABASE ---';

  console.warn(`\n${boldLiteral}${cyanLiteral}${bannerTitleLiteral}${resetLiteral}`);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: CLI_TRIGGER_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Iniciando runner CLI de volcado seguro de snapshot de Supabase.',
    semanticIntentTag: 'CLI_SUPABASE_DUMP_SNAPSHOT_START',
  });

  try {
    const reportSnapshot = await AuditSupabaseDumpSnapshot(correlationIdentifier);

    renderDumpSnapshotSummaryOutput(reportSnapshot);

    const durationMsQuantity = reportSnapshot.executionDurationInMillisecondsQuantity;
    console.warn(
      `\n${boldLiteral}Duración Total de Volcado:${resetLiteral} ${durationMsQuantity}ms`,
    );
    console.warn(
      `${boldLiteral}Reporte Forense JSON:${resetLiteral}      ` +
        `${cyanLiteral}${REPORT_OUTPUT_PATH_LITERAL}${resetLiteral}\n`,
    );
    console.warn(
      `${boldLiteral}${greenLiteral}✔ VOLCADO SEGURO COMPLETADO:` +
        ` Estructura y datos saneados (LGPD) guardados con éxito.${resetLiteral}\n`,
    );
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
      messageContentLiteral: `Colapso en runner CLI de volcado de Supabase: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'CLI_SUPABASE_DUMP_SNAPSHOT_FAULT',
      contextMetadataSnapshot: Object.freeze({ errorDescriptionLiteral }),
    });

    console.error(
      `\n${boldLiteral}${redLiteral}COLAPSO EN EJECUCIÓN DE VOLCADO:${resetLiteral}` +
        ` ${errorDescriptionLiteral}\n`,
    );
    process.exit(1);
  }
};

void ExecuteCommandLineRunner();
