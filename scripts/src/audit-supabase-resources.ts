/**
 * @file scripts/src/audit-supabase-resources.ts
 * @section Scripts & Automation - Supabase Resources Audit CLI Runner
 * @description Disparador CLI encargado de ejecutar la auditoría granular de recursos en
 * PostgreSQL y Supabase Storage (tablas, RLS, extensiones, funciones, triggers y buckets),
 * renderizando el balance en consola ANSI con código de salida `0` o `1`.
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
  AuditSupabaseResources,
  type IExpectedVsActualGapSummary,
  type ISupabaseResourcesAuditReport,
} from '@floripa-dignidade/tools';

const SCRIPT_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SUPABASE_RESOURCES_CLI_RUNNER',
);
const CLI_TRIGGER_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_RESOURCES_AUDIT_TRIGGERED',
);
const CLI_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLI_SUPABASE_RESOURCES_AUDIT_COLLAPSE',
);
const REPORT_OUTPUT_PATH_LITERAL = 'reports/supabase/resources-audit-report.json';

const ANSI_COLORS = Object.freeze({
  resetLiteral: '\x1b[0m',
  boldLiteral: '\x1b[1m',
  greenLiteral: '\x1b[32m',
  redLiteral: '\x1b[31m',
  cyanLiteral: '\x1b[36m',
  grayLiteral: '\x1b[90m',
});

const renderDiscoveredInventoryOutput = (reportSnapshot: ISupabaseResourcesAuditReport): void => {
  const { boldLiteral, cyanLiteral, grayLiteral, greenLiteral, resetLiteral } = ANSI_COLORS;
  const tablesCountQuantity = reportSnapshot.tablesAuditCollection.length;
  const rlsEnabledCountQuantity = reportSnapshot.tablesAuditCollection.filter(
    (tableSnapshot) => tableSnapshot.isRowLevelSecurityEnabledBoolean,
  ).length;
  const schemasListLiteral = reportSnapshot.discoveredSchemasCollection.join(', ');
  const extensionsQuantity = reportSnapshot.installedExtensionsCollection.length;
  const functionsQuantity = reportSnapshot.databaseFunctionsCollection.length;
  const triggersQuantity = reportSnapshot.databaseTriggersCollection.length;
  const bucketsQuantity = reportSnapshot.storageBucketsCollection.length;

  console.warn(`\n${boldLiteral}1. INVENTARIO DE RECURSOS DESCUBIERTOS EN BASE:${resetLiteral}`);
  console.warn(
    `   ${grayLiteral}Base de Datos:${resetLiteral}` +
      ` ${cyanLiteral}${reportSnapshot.targetDatabaseNameLiteral}${resetLiteral}` +
      ` | ${grayLiteral}Esquemas:${resetLiteral} [${schemasListLiteral}]`,
  );
  console.warn(
    `   ${greenLiteral}● Tablas:${resetLiteral} ${tablesCountQuantity}` +
      ` (RLS Activo: ${rlsEnabledCountQuantity}/${tablesCountQuantity})` +
      ` | ${grayLiteral}Extensiones:${resetLiteral} ${extensionsQuantity}`,
  );
  console.warn(
    `   ${grayLiteral}● Funciones:${resetLiteral} ${functionsQuantity}` +
      ` | ${grayLiteral}Triggers:${resetLiteral} ${triggersQuantity}` +
      ` | ${grayLiteral}Buckets S3:${resetLiteral} ${bucketsQuantity}`,
  );
};

const renderGapAnalysisOutput = (gapSummary: IExpectedVsActualGapSummary): void => {
  const { boldLiteral, cyanLiteral, grayLiteral, greenLiteral, redLiteral, resetLiteral } =
    ANSI_COLORS;
  const gapCategoriesCollection: readonly (readonly [string, readonly string[]])[] = [
    ['Tablas Operativas Faltantes', gapSummary.missingOperationalTablesCollection],
    ['Tablas CMS Faltantes', gapSummary.missingCmsTablesCollection],
    ['Extensiones Faltantes', gapSummary.missingExtensionsCollection],
    ['Buckets S3 Faltantes', gapSummary.missingStorageBucketsCollection],
    ['Tablas sin RLS Requerido', gapSummary.tablesMissingRequiredRlsCollection],
    ['Funciones Faltantes', gapSummary.missingFunctionsCollection],
    ['Triggers Faltantes', gapSummary.missingTriggersCollection],
  ];

  console.warn(`\n${boldLiteral}2. EVALUACIÓN DE BRECHAS FRENTE AL CATÁLOGO SSOT:${resetLiteral}`);
  if (gapSummary.isFullyProvisionedBoolean) {
    console.warn(
      `   ${greenLiteral}✔ 100% PROVISIONADO:${resetLiteral}` +
        ' Todos los ledgers, tablas CMS, extensiones, triggers y buckets existen con RLS requerido.',
    );
  } else {
    for (const [labelLiteral, itemsCollection] of gapCategoriesCollection) {
      if (itemsCollection.length === 0) continue;
      console.warn(`   ${redLiteral}✖ ${labelLiteral}:${resetLiteral}`);
      for (const itemLiteral of itemsCollection) {
        console.warn(`     ${grayLiteral}↳${resetLiteral} ${itemLiteral}`);
      }
    }
  }

  if (gapSummary.securityAlertsCollection.length > 0) {
    console.warn(
      `\n${boldLiteral}${cyanLiteral}3. ALERTAS DE SEGURIDAD DETECTADAS:${resetLiteral}`,
    );
    for (const alertLiteral of gapSummary.securityAlertsCollection) {
      console.warn(`   ${cyanLiteral}⚠${resetLiteral} ${alertLiteral}`);
    }
  }
};

const ExecuteCommandLineRunner = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const { boldLiteral, cyanLiteral, greenLiteral, redLiteral, resetLiteral } = ANSI_COLORS;
  const bannerLiteral = '--- [FLORIPA DIGNIDADE]: AUDITORÍA GRANULAR DE RECURSOS SUPABASE ---';

  console.warn(`\n${boldLiteral}${cyanLiteral}${bannerLiteral}${resetLiteral}`);
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SCRIPT_MODULE_IDENTIFIER,
    operationCodeLiteral: CLI_TRIGGER_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Iniciando runner CLI de auditoría granular de recursos Supabase.',
    semanticIntentTag: 'CLI_SUPABASE_RESOURCES_AUDIT_START',
  });

  try {
    const reportSnapshot = await AuditSupabaseResources(correlationIdentifier);
    renderDiscoveredInventoryOutput(reportSnapshot);
    renderGapAnalysisOutput(reportSnapshot.gapAnalysisSummary);

    const durationMsQuantity = reportSnapshot.executionDurationInMillisecondsQuantity;
    console.warn(
      `\n${boldLiteral}Duración Total de Auditoría:${resetLiteral} ${durationMsQuantity}ms`,
    );
    console.warn(
      `${boldLiteral}Reporte Forense JSON:${resetLiteral}        ` +
        `${cyanLiteral}${REPORT_OUTPUT_PATH_LITERAL}${resetLiteral}\n`,
    );

    if (reportSnapshot.gapAnalysisSummary.isFullyProvisionedBoolean) {
      console.warn(
        `${boldLiteral}${greenLiteral}✔ APROVISIONAMIENTO COMPLETO:` +
          ` Sin brechas frente al catálogo oficial.${resetLiteral}\n`,
      );
      process.exit(0);
    }

    console.warn(
      `${boldLiteral}${redLiteral}✖ BRECHAS DETECTADAS:` +
        ` Ejecutar migraciones pendientes para sincronizar recursos.${resetLiteral}\n`,
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
      messageContentLiteral: `Colapso en runner CLI de recursos Supabase: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'CLI_SUPABASE_RESOURCES_AUDIT_FAULT',
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
