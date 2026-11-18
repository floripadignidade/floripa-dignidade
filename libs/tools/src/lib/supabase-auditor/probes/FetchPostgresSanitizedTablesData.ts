/**
 * @file libs/tools/src/lib/supabase-auditor/probes/FetchPostgresSanitizedTablesData.ts
 * @section Supabase Auditor - Sanitized Tables Data Extractor (Atom)
 * @description Sonda de solo lectura encargada de validar el cliente PostgreSQL y el listado
 * de tablas, consultar conteo exacto y muestreo acotado (`LIMIT 50`), delegar el blindaje
 * LGPD en `SanitizeAndSampleTableRows` y reportar trazabilidad SRE ante fallos parciales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010, ISO/IEC 27001 y LGPD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { TSanitizedPostgresClient } from '../atoms/CreateSanitizedPostgresClient';
import { SanitizeAndSampleTableRows } from '../atoms/SanitizeAndSampleTableRows';
import {
  type ISanitizedTableDataDump,
  SanitizedTableDataDumpSchema,
} from '../schemas/SupabaseDumpSnapshotReport.schema';

const PROBE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'POSTGRES_SANITIZED_TABLES_DATA_PROBE',
);
const SAMPLE_TABLES_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'FETCH_POSTGRES_SANITIZED_TABLES_DATA',
);
const TABLE_SAMPLE_FAILED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'POSTGRES_TABLE_SAMPLE_SKIPPED',
);
const TABLES_SAMPLED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'POSTGRES_SANITIZED_TABLES_DATA_FETCHED',
);

const TABLE_ROW_QUERY_LIMIT_QUANTITY = 50;
const MAXIMUM_SANITIZED_ROWS_PER_TABLE_QUANTITY = 20;

const TableDescriptorInputSchema = z
  .object({
    schemaNameLiteral: z.string().trim().min(1),
    tableNameLiteral: z.string().trim().min(1),
  })
  .readonly();

const DiscoveredTablesInputSchema = z.array(TableDescriptorInputSchema).readonly();
const SanitizedTablesDataCollectionSchema = z.array(SanitizedTableDataDumpSchema).readonly();

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const quotePostgresIdentifier = (identifierLiteral: string): string =>
  `"${identifierLiteral.replace(/"/g, '""')}"`;

const parseExactRowCountNumeric = (rawCountValue: unknown): number => {
  const parsedCountNumeric =
    typeof rawCountValue === 'number'
      ? rawCountValue
      : Number.parseInt(String(rawCountValue ?? '0'), 10);

  return Number.isNaN(parsedCountNumeric) || parsedCountNumeric < 0 ? 0 : parsedCountNumeric;
};

const sampleSingleTableSafelyAction = async (
  postgresClientInstance: TSanitizedPostgresClient,
  schemaNameLiteral: string,
  tableNameLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): Promise<ISanitizedTableDataDump | null> => {
  const quotedSchemaNameLiteral = quotePostgresIdentifier(schemaNameLiteral);
  const quotedTableNameLiteral = quotePostgresIdentifier(tableNameLiteral);

  try {
    const countQueryResult = await postgresClientInstance.query<{
      readonly exact_count: string | number;
    }>(
      `SELECT count(*)::text AS exact_count FROM ${quotedSchemaNameLiteral}.${quotedTableNameLiteral};`,
    );
    const exactRowCountNumeric = parseExactRowCountNumeric(
      countQueryResult.rows[0]?.['exact_count'],
    );

    const rowsQueryResult = await postgresClientInstance.query<Record<string, unknown>>(
      `SELECT * FROM ${quotedSchemaNameLiteral}.${quotedTableNameLiteral} LIMIT ${TABLE_ROW_QUERY_LIMIT_QUANTITY};`,
    );

    return await SanitizeAndSampleTableRows(
      schemaNameLiteral,
      tableNameLiteral,
      exactRowCountNumeric,
      rowsQueryResult.rows,
      MAXIMUM_SANITIZED_ROWS_PER_TABLE_QUANTITY,
    );
  } catch (caughtTableQueryError: unknown) {
    const errorDescriptionLiteral =
      caughtTableQueryError instanceof Error
        ? caughtTableQueryError.message
        : String(caughtTableQueryError);

    const tableException = new InternalSystemException('POSTGRES_TABLE_SAMPLE_QUERY_FAILED', {
      schemaNameLiteral,
      tableNameLiteral,
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    });
    ReportForensicException(tableException, correlationIdentifier);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: TABLE_SAMPLE_FAILED_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: `Muestreo omitido en [${schemaNameLiteral}.${tableNameLiteral}]: ${errorDescriptionLiteral}`,
      semanticIntentTag: 'SUPABASE_TABLE_SAMPLE_WARNING',
      contextMetadataSnapshot: Object.freeze({
        schemaNameLiteral,
        tableNameLiteral,
        errorDescriptionLiteral,
      }),
    });

    return null;
  }
};

/**
 * Recopila y sella los datos muestreados y saneados (LGPD) de las tablas descubiertas.
 *
 * @param postgresClientInstance - Cliente `pg.Client` conectado y autenticado.
 * @param discoveredTablesCollection - Descriptores de esquema y tabla obtenidos en la auditoría.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<readonly ISanitizedTableDataDump[]>} Colección inmutable validada por Zod.
 * @throws {ValidationException} Si el cliente PostgreSQL o el listado de tablas es inválido.
 */
export const FetchPostgresSanitizedTablesData = async (
  postgresClientInstance: TSanitizedPostgresClient,
  discoveredTablesCollection: readonly z.input<typeof TableDescriptorInputSchema>[],
  correlationIdentifierFallback?: string,
): Promise<readonly ISanitizedTableDataDump[]> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  if (typeof postgresClientInstance?.query !== 'function') {
    const validationException = new ValidationException('INVALID_POSTGRES_CLIENT_INSTANCE', {
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const tablesValidationResult = DiscoveredTablesInputSchema.safeParse(discoveredTablesCollection);
  if (!tablesValidationResult.success) {
    const validationException = new ValidationException('INVALID_DISCOVERED_TABLES_COLLECTION', {
      validationIssuesCollection: tablesValidationResult.error.flatten(),
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedTablesCollection = tablesValidationResult.data;

  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    SAMPLE_TABLES_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<readonly ISanitizedTableDataDump[]> => {
      if (validatedTablesCollection.length === 0) {
        return Object.freeze([]);
      }

      const sanitizedTablesCollection: ISanitizedTableDataDump[] = [];
      let skippedTablesCountQuantity = 0;

      for (const tableDescriptorSnapshot of validatedTablesCollection) {
        const sampledTableSnapshot = await sampleSingleTableSafelyAction(
          postgresClientInstance,
          tableDescriptorSnapshot.schemaNameLiteral,
          tableDescriptorSnapshot.tableNameLiteral,
          correlationIdentifier,
        );

        if (sampledTableSnapshot === null) {
          skippedTablesCountQuantity += 1;
        } else {
          sanitizedTablesCollection.push(sampledTableSnapshot);
        }
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: skippedTablesCountQuantity > 0 ? 'WARNING' : 'INFO',
        moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
        operationCodeLiteral: TABLES_SAMPLED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: 'Muestreo y sanitización LGPD de tablas PostgreSQL completado.',
        semanticIntentTag: 'SUPABASE_TABLES_SAMPLE_SUCCESS',
        contextMetadataSnapshot: Object.freeze({
          sampledTablesCountQuantity: sanitizedTablesCollection.length,
          skippedTablesCountQuantity,
        }),
      });

      return Object.freeze(SanitizedTablesDataCollectionSchema.parse(sanitizedTablesCollection));
    },
  );
};
