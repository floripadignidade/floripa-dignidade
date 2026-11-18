/**
 * @file libs/tools/src/lib/supabase-auditor/ProvisionInitialSupabaseDatabase.ts
 * @section Supabase Auditor - Idempotent Initial & Incremental SQL Provisioner (Orchestrator)
 * @description Motor transaccional encargado de descubrir archivos `database/*.sql` en
 * orden numérico, calcular sus huellas SHA-256, adquirir bloqueo `pg_advisory_xact_lock`,
 * verificar `public.ecosystem_schema_migrations`, aplicar migraciones pendientes dentro de
 * `BEGIN ... COMMIT` (o simular en `DRY_RUN`), emitir telemetría SRE y persistir el
 * reporte certificado `reports/supabase/provisioning-report.json`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHash } from 'node:crypto';
import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join, resolve } from 'node:path';

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ResolveWorkspaceRootDirectory } from '../i18n-builder/constants/ResolveWorkspaceRootDirectory';
import {
  CreateSanitizedPostgresClient,
  type TSanitizedPostgresClient,
} from './atoms/CreateSanitizedPostgresClient';
import { PersistSupabaseReportToDisk } from './atoms/PersistSupabaseReportToDisk';
import { ResolveSafeCorrelationIdentifier } from './atoms/ResolveSupabaseAuditHelpers';
import {
  type IProvisionedMigrationEntry,
  type IProvisioningOptions,
  type ISupabaseProvisioningReport,
  ProvisioningOptionsSchema,
  SupabaseProvisioningReportSchema,
} from './schemas/SupabaseProvisioningReport.schema';
import { SupabaseAuditReportIdentifierSchema } from './schemas/SupabaseConnectionReport.schema';

const PROVISIONER_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SUPABASE_INITIAL_PROVISIONER');
const PROVISION_TRACE_CODE = OperationCodeSchema.parse('EXECUTE_SUPABASE_SQL_PROVISIONING');
const PROVISION_COMPLETED_CODE = OperationCodeSchema.parse('SUPABASE_SQL_PROVISIONING_COMPLETED');
const PROVISION_INPUT_INVALID_CODE = OperationCodeSchema.parse(
  'SUPABASE_PROVISIONING_INPUT_INVALID',
);
const PROVISIONING_ADVISORY_LOCK_KEY_NUMERIC = 842900171;
const PROVISION_TIMEOUT_IN_MILLISECONDS_QUANTITY = 60_000;
const REPORT_FILE_NAME_LITERAL = 'provisioning-report.json';
const MIGRATION_FILE_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9._-]*\.sql$/;

interface IDiscoveredSqlMigration {
  readonly filenameLiteral: string;
  readonly checksumSha256Literal: string;
  readonly sqlContentLiteral: string;
}

interface IAppliedMigrationRecord {
  readonly checksumSha256Literal: string;
  readonly appliedAtTimestampISO: string;
}

interface IMigrationExecutionBuckets {
  readonly appliedMigrationsCollection: IProvisionedMigrationEntry[];
  readonly skippedMigrationsCollection: IProvisionedMigrationEntry[];
  readonly pendingMigrationsCollection: IProvisionedMigrationEntry[];
}

const discoverOrderedSqlMigrations = async (
  migrationsDirectoryPathLiteral: string,
): Promise<readonly IDiscoveredSqlMigration[]> => {
  if (!existsSync(migrationsDirectoryPathLiteral)) {
    throw new InternalSystemException('MIGRATIONS_DIRECTORY_NOT_FOUND', {
      migrationsDirectoryPathLiteral,
    });
  }

  const directoryEntries = await filesystemPromises.readdir(migrationsDirectoryPathLiteral, {
    withFileTypes: true,
  });

  const orderedFilenamesCollection = directoryEntries
    .filter((entry) => entry.isFile() && MIGRATION_FILE_REGEX.test(entry.name))
    .map((entry) => entry.name)
    .sort((firstNameLiteral, secondNameLiteral) =>
      firstNameLiteral.localeCompare(secondNameLiteral, undefined, { numeric: true }),
    );

  const loadedMigrationsCollection = await Promise.all(
    orderedFilenamesCollection.map(async (filenameLiteral): Promise<IDiscoveredSqlMigration> => {
      const rawSqlLiteral = await filesystemPromises.readFile(
        join(migrationsDirectoryPathLiteral, filenameLiteral),
        'utf-8',
      );
      const sqlContentLiteral = rawSqlLiteral.replace(/\r\n/g, '\n');
      const checksumSha256Literal = createHash('sha256')
        .update(sqlContentLiteral, 'utf-8')
        .digest('hex');

      return Object.freeze({ filenameLiteral, checksumSha256Literal, sqlContentLiteral });
    }),
  );

  return Object.freeze(loadedMigrationsCollection);
};

const readAppliedMigrationsMap = async (
  clientInstance: TSanitizedPostgresClient,
): Promise<ReadonlyMap<string, IAppliedMigrationRecord>> => {
  const tableCheckResult = await clientInstance.query<{ readonly table_oid: string | null }>(
    "SELECT to_regclass('public.ecosystem_schema_migrations')::text AS table_oid;",
  );

  if (!tableCheckResult.rows[0]?.['table_oid']) {
    return new Map();
  }

  const rowsResult = await clientInstance.query<{
    readonly migration_filename_literal: string;
    readonly checksum_sha256_literal: string;
    readonly applied_at: Date | string;
  }>(
    'SELECT migration_filename_literal, checksum_sha256_literal, applied_at FROM public.ecosystem_schema_migrations;',
  );

  const appliedMap = new Map<string, IAppliedMigrationRecord>();
  for (const rowSnapshot of rowsResult.rows) {
    const appliedAtDate =
      rowSnapshot.applied_at instanceof Date
        ? rowSnapshot.applied_at
        : new Date(rowSnapshot.applied_at);
    appliedMap.set(rowSnapshot.migration_filename_literal, {
      checksumSha256Literal: rowSnapshot.checksum_sha256_literal.trim(),
      appliedAtTimestampISO: appliedAtDate.toISOString(),
    });
  }

  return appliedMap;
};

const buildSkippedEntryOrThrowOnDrift = (
  migrationSnapshot: IDiscoveredSqlMigration,
  appliedRecordSnapshot: IAppliedMigrationRecord,
  correlationIdentifier: CorrelationIdentifier,
): IProvisionedMigrationEntry => {
  if (appliedRecordSnapshot.checksumSha256Literal !== migrationSnapshot.checksumSha256Literal) {
    throw new InternalSystemException('MIGRATION_CHECKSUM_MISMATCH_DETECTED', {
      migrationFilenameLiteral: migrationSnapshot.filenameLiteral,
      expectedChecksumLiteral: appliedRecordSnapshot.checksumSha256Literal,
      actualChecksumLiteral: migrationSnapshot.checksumSha256Literal,
      correlationIdentifier,
    });
  }

  return Object.freeze({
    migrationFilenameLiteral: migrationSnapshot.filenameLiteral,
    checksumSha256Literal: migrationSnapshot.checksumSha256Literal,
    executionDurationInMillisecondsQuantity: 0,
    statusLiteral: 'SKIPPED_ALREADY_APPLIED',
    appliedAtTimestampISO: appliedRecordSnapshot.appliedAtTimestampISO,
  });
};

const applySingleSqlMigration = async (
  clientInstance: TSanitizedPostgresClient,
  migrationSnapshot: IDiscoveredSqlMigration,
): Promise<IProvisionedMigrationEntry> => {
  const startTimestampNumeric = globalThis.performance.now();
  await clientInstance.query(migrationSnapshot.sqlContentLiteral);
  const executionDurationMs = Math.max(
    0,
    Math.round(globalThis.performance.now() - startTimestampNumeric),
  );

  const insertResult = await clientInstance.query<{ readonly applied_at: Date | string }>(
    `INSERT INTO public.ecosystem_schema_migrations (
       migration_filename_literal,
       checksum_sha256_literal,
       execution_duration_ms
     ) VALUES ($1, $2, $3) RETURNING applied_at;`,
    [
      migrationSnapshot.filenameLiteral,
      migrationSnapshot.checksumSha256Literal,
      executionDurationMs,
    ],
  );

  const rawAppliedAt = insertResult.rows[0]?.['applied_at'];
  const appliedAtTimestampISO =
    rawAppliedAt instanceof Date
      ? rawAppliedAt.toISOString()
      : new Date(rawAppliedAt ?? Date.now()).toISOString();

  return Object.freeze({
    migrationFilenameLiteral: migrationSnapshot.filenameLiteral,
    checksumSha256Literal: migrationSnapshot.checksumSha256Literal,
    executionDurationInMillisecondsQuantity: executionDurationMs,
    statusLiteral: 'APPLIED',
    appliedAtTimestampISO,
  });
};

const processMigrationsInTransaction = async (
  clientInstance: TSanitizedPostgresClient,
  discoveredMigrationsCollection: readonly IDiscoveredSqlMigration[],
  isApplyModeBoolean: boolean,
  correlationIdentifier: CorrelationIdentifier,
): Promise<IMigrationExecutionBuckets> => {
  const appliedMigrationsCollection: IProvisionedMigrationEntry[] = [];
  const skippedMigrationsCollection: IProvisionedMigrationEntry[] = [];
  const pendingMigrationsCollection: IProvisionedMigrationEntry[] = [];

  await clientInstance.query(isApplyModeBoolean ? 'BEGIN;' : 'BEGIN READ ONLY;');
  try {
    await clientInstance.query('SELECT pg_advisory_xact_lock($1);', [
      PROVISIONING_ADVISORY_LOCK_KEY_NUMERIC,
    ]);
    const appliedMigrationsMap = await readAppliedMigrationsMap(clientInstance);

    for (const migrationSnapshot of discoveredMigrationsCollection) {
      const existingRecord = appliedMigrationsMap.get(migrationSnapshot.filenameLiteral);
      if (existingRecord !== undefined) {
        skippedMigrationsCollection.push(
          buildSkippedEntryOrThrowOnDrift(migrationSnapshot, existingRecord, correlationIdentifier),
        );
        continue;
      }

      if (!isApplyModeBoolean) {
        pendingMigrationsCollection.push(
          Object.freeze({
            migrationFilenameLiteral: migrationSnapshot.filenameLiteral,
            checksumSha256Literal: migrationSnapshot.checksumSha256Literal,
            executionDurationInMillisecondsQuantity: 0,
            statusLiteral: 'PENDING_DRY_RUN',
          }),
        );
        continue;
      }

      appliedMigrationsCollection.push(
        await applySingleSqlMigration(clientInstance, migrationSnapshot),
      );
    }

    await clientInstance.query('COMMIT;');
    return {
      appliedMigrationsCollection,
      skippedMigrationsCollection,
      pendingMigrationsCollection,
    };
  } catch (caughtTransactionError: unknown) {
    await clientInstance.query('ROLLBACK;').catch(() => undefined);
    throw caughtTransactionError;
  }
};

const buildSummaryLiteral = (
  isApplyModeBoolean: boolean,
  bucketsSnapshot: IMigrationExecutionBuckets,
): string => {
  const appliedCountQuantity = bucketsSnapshot.appliedMigrationsCollection.length;
  const skippedCountQuantity = bucketsSnapshot.skippedMigrationsCollection.length;
  const pendingCountQuantity = bucketsSnapshot.pendingMigrationsCollection.length;

  if (!isApplyModeBoolean) {
    return `Simulación DRY_RUN completada: ${pendingCountQuantity} pendientes, ${skippedCountQuantity} ya aplicadas.`;
  }
  return `Provisión APPLY completada: ${appliedCountQuantity} aplicadas, ${skippedCountQuantity} omitidas por idempotencia.`;
};

/**
 * Ejecuta de forma idempotente el provisionamiento SQL inicial o incremental en Supabase.
 * Por defecto opera en modo seguro `DRY_RUN` salvo que `isApplyModeBoolean: true`.
 *
 * @param rawOptionsSnapshot - Opciones de modo (`DRY_RUN`/`APPLY`), conexión y correlación.
 * @returns {Promise<ISupabaseProvisioningReport>} Reporte certificado, inmutable y persistido.
 * @throws {ValidationException} Si las opciones incumplen `ProvisioningOptionsSchema`.
 * @throws {InternalSystemException} Si falta configuración o falla la transacción SQL.
 */
export const ProvisionInitialSupabaseDatabase = async (
  rawOptionsSnapshot: IProvisioningOptions = {},
): Promise<ISupabaseProvisioningReport> => {
  const optionsValidationResult = ProvisioningOptionsSchema.safeParse(rawOptionsSnapshot);
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(
    optionsValidationResult.success
      ? optionsValidationResult.data.correlationIdentifier
      : undefined,
  );

  if (!optionsValidationResult.success) {
    const validationIssuesCollection = optionsValidationResult.error.flatten();
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROVISIONER_MODULE_IDENTIFIER,
      operationCodeLiteral: PROVISION_INPUT_INVALID_CODE,
      correlationIdentifier,
      messageContentLiteral: 'Opciones de provisionamiento SQL rechazadas en frontera.',
      semanticIntentTag: 'SUPABASE_PROVISIONING_INPUT_INVALID',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });
    const validationException = new ValidationException('INVALID_SUPABASE_PROVISIONING_OPTIONS', {
      validationIssuesCollection,
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedOptions = optionsValidationResult.data;

  return await TraceExecutionTime(
    PROVISIONER_MODULE_IDENTIFIER,
    PROVISION_TRACE_CODE,
    correlationIdentifier,
    async (): Promise<ISupabaseProvisioningReport> => {
      const startTimestampNumeric = globalThis.performance.now();
      const migrationsDirectoryPathLiteral = validatedOptions.customMigrationsDirectoryPathLiteral
        ? resolve(validatedOptions.customMigrationsDirectoryPathLiteral)
        : join(ResolveWorkspaceRootDirectory(), 'database');

      const clientResolution = CreateSanitizedPostgresClient({
        preferDirectMigrationConnectionBoolean:
          validatedOptions.preferDirectMigrationConnectionBoolean,
        statementTimeoutInMillisecondsQuantity: PROVISION_TIMEOUT_IN_MILLISECONDS_QUANTITY,
      });

      if (!clientResolution.isConfiguredBoolean) {
        const configException = new InternalSystemException('SUPABASE_DATABASE_URL_UNCONFIGURED', {
          diagnosticMessageLiteral: clientResolution.diagnosticMessageLiteral,
          errorCodeLiteral: clientResolution.errorCodeLiteral,
          correlationIdentifier,
        });
        ReportForensicException(configException, correlationIdentifier);
        throw configException;
      }

      const { clientInstance, sourceEnvironmentKeyLiteral } = clientResolution;
      try {
        const discoveredMigrationsCollection = await discoverOrderedSqlMigrations(
          migrationsDirectoryPathLiteral,
        );
        await clientInstance.connect();
        const bucketsSnapshot = await processMigrationsInTransaction(
          clientInstance,
          discoveredMigrationsCollection,
          validatedOptions.isApplyModeBoolean,
          correlationIdentifier,
        );
        const executionDurationInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - startTimestampNumeric),
        );

        const reportSnapshot = Object.freeze(
          SupabaseProvisioningReportSchema.parse({
            reportIdentifier: SupabaseAuditReportIdentifierSchema.parse(
              GenerateCorrelationIdentifier(),
            ),
            auditTimestampISO: new Date().toISOString(),
            correlationIdentifier,
            executionModeLiteral: validatedOptions.isApplyModeBoolean ? 'APPLY' : 'DRY_RUN',
            connectionSourceKeyLiteral: sourceEnvironmentKeyLiteral,
            executionDurationInMillisecondsQuantity,
            totalDiscoveredMigrationsQuantity: discoveredMigrationsCollection.length,
            ...bucketsSnapshot,
            isProvisioningSuccessfulBoolean: true,
            actionableSummaryLiteral: buildSummaryLiteral(
              validatedOptions.isApplyModeBoolean,
              bucketsSnapshot,
            ),
          }),
        );

        await PersistSupabaseReportToDisk(
          REPORT_FILE_NAME_LITERAL,
          reportSnapshot,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PROVISIONER_MODULE_IDENTIFIER,
          operationCodeLiteral: PROVISION_COMPLETED_CODE,
          correlationIdentifier,
          messageContentLiteral: reportSnapshot.actionableSummaryLiteral,
          executionLatencyInMillisecondsQuantity: executionDurationInMillisecondsQuantity,
          semanticIntentTag: 'SUPABASE_SQL_PROVISIONING_CONSOLIDATED',
          contextMetadataSnapshot: Object.freeze({
            executionModeLiteral: reportSnapshot.executionModeLiteral,
            connectionSourceKeyLiteral: sourceEnvironmentKeyLiteral,
            appliedCountQuantity: reportSnapshot.appliedMigrationsCollection.length,
            skippedCountQuantity: reportSnapshot.skippedMigrationsCollection.length,
            pendingCountQuantity: reportSnapshot.pendingMigrationsCollection.length,
          }),
        });

        return reportSnapshot;
      } catch (caughtExecutionError: unknown) {
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : new InternalSystemException('SUPABASE_SQL_PROVISIONING_COLLAPSE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      } finally {
        await clientInstance.end().catch(() => undefined);
      }
    },
  );
};
