/**
 * @file libs/tools/src/lib/supabase-auditor/probes/FetchPostgresTablesGranularAudit.ts
 * @section Supabase Auditor - PostgreSQL Tables Granular Audit Probe (Atom)
 * @description Sonda de solo lectura que extrae auditoría granular por tabla en PostgreSQL 17:
 * conteo estimado, banderas RLS, columnas, restricciones, índices, políticas y privilegios.
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import { z } from 'zod';

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { TSanitizedPostgresClient } from '../atoms/CreateSanitizedPostgresClient';
import {
  EXCLUDED_MANAGED_SCHEMAS_SQL,
  ResolveSafeCorrelationIdentifier,
} from '../atoms/ResolveSupabaseAuditHelpers';
import {
  type ITableGranularAuditSnapshot,
  TableGranularAuditSnapshotSchema,
} from '../schemas/SupabaseResourcesAuditReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('POSTGRES_TABLES_GRANULAR_PROBE');
const AUDIT_OPERATION_CODE = OperationCodeSchema.parse('FETCH_POSTGRES_TABLES_GRANULAR_AUDIT');
const COMPLETED_CODE = OperationCodeSchema.parse('POSTGRES_TABLES_GRANULAR_AUDIT_FETCHED');
const TablesAuditCollectionSchema = z.array(TableGranularAuditSnapshotSchema).readonly();

const TABLES_SQL_QUERIES = Object.freeze({
  tables: `SELECT n.nspname::text AS "schemaNameLiteral", c.relname::text AS "tableNameLiteral",
    LEAST(GREATEST(0, COALESCE(c.reltuples, 0)), 2147483647)::int AS "estimatedRowCountNumeric",
    c.relrowsecurity AS "isRowLevelSecurityEnabledBoolean",
    c.relforcerowsecurity AS "isRowLevelSecurityForcedBoolean"
    FROM pg_catalog.pg_class c INNER JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
      AND c.relkind IN ('r', 'p') ORDER BY n.nspname ASC, c.relname ASC;`,
  columns: `SELECT table_schema::text AS "schemaNameLiteral", table_name::text AS "tableNameLiteral",
    column_name::text AS "columnNameLiteral", udt_name::text AS "dataTypeLiteral",
    (is_nullable = 'YES') AS "isNullableBoolean", column_default::text AS "defaultValueLiteral"
    FROM information_schema.columns WHERE table_schema NOT LIKE 'pg_%'
      AND table_schema NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
    ORDER BY table_schema ASC, table_name ASC, ordinal_position ASC;`,
  constraints: `SELECT table_schema::text AS "schemaNameLiteral", table_name::text AS "tableNameLiteral",
    constraint_name::text AS "constraintNameLiteral", constraint_type::text AS "constraintTypeLiteral"
    FROM information_schema.table_constraints WHERE table_schema NOT LIKE 'pg_%'
      AND table_schema NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
    ORDER BY table_schema ASC, table_name ASC, constraint_name ASC;`,
  indexes: `SELECT n.nspname::text AS "schemaNameLiteral", t.relname::text AS "tableNameLiteral",
    ic.relname::text AS "indexNameLiteral", i.indisunique AS "isUniqueBoolean",
    i.indisprimary AS "isPrimaryBoolean", pg_catalog.pg_get_indexdef(i.indexrelid) AS "indexDefinitionLiteral"
    FROM pg_catalog.pg_index i INNER JOIN pg_catalog.pg_class t ON t.oid = i.indrelid
    INNER JOIN pg_catalog.pg_class ic ON ic.oid = i.indexrelid
    INNER JOIN pg_catalog.pg_namespace n ON n.oid = t.relnamespace
    WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
      AND t.relkind IN ('r', 'p') ORDER BY n.nspname ASC, t.relname ASC, ic.relname ASC;`,
  policies: `SELECT schemaname::text AS "schemaNameLiteral", tablename::text AS "tableNameLiteral",
    policyname::text AS "policyNameLiteral", cmd::text AS "commandLiteral",
    permissive::text AS "permissiveModeLiteral", COALESCE(roles::text[], ARRAY[]::text[]) AS "rolesCollection",
    qual::text AS "usingExpressionLiteral", with_check::text AS "withCheckExpressionLiteral"
    FROM pg_catalog.pg_policies WHERE schemaname NOT LIKE 'pg_%'
      AND schemaname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
    ORDER BY schemaname ASC, tablename ASC, policyname ASC;`,
  roleGrants: `SELECT table_schema::text AS "schemaNameLiteral", table_name::text AS "tableNameLiteral",
    grantee::text AS "granteeRoleLiteral", ARRAY_AGG(DISTINCT privilege_type::text
      ORDER BY privilege_type::text) AS "privilegesCollection"
    FROM information_schema.role_table_grants WHERE table_schema NOT LIKE 'pg_%'
      AND table_schema NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
    GROUP BY table_schema, table_name, grantee
    ORDER BY table_schema ASC, table_name ASC, grantee ASC;`,
});

const buildTableKeyLiteral = (rowSnapshot: Readonly<Record<string, unknown>>): string =>
  `${String(rowSnapshot['schemaNameLiteral'])}.${String(rowSnapshot['tableNameLiteral'])}`;

const groupRowsByTableKey = (
  rowsCollection: readonly Record<string, unknown>[],
): ReadonlyMap<string, readonly Record<string, unknown>[]> => {
  const groupedMap = new Map<string, Record<string, unknown>[]>();
  for (const rowSnapshot of rowsCollection) {
    const keyLiteral = buildTableKeyLiteral(rowSnapshot);
    const bucketCollection = groupedMap.get(keyLiteral) ?? [];
    bucketCollection.push(rowSnapshot);
    groupedMap.set(keyLiteral, bucketCollection);
  }
  return groupedMap;
};

const assembleTablesAuditPayloadAction = async (
  clientInstance: TSanitizedPostgresClient,
): Promise<unknown[]> => {
  const rowsByQuery = new Map<string, readonly Record<string, unknown>[]>();
  for (const [keyLiteral, statementLiteral] of Object.entries(TABLES_SQL_QUERIES)) {
    const queryResult = await clientInstance.query<Record<string, unknown>>(statementLiteral);
    rowsByQuery.set(keyLiteral, queryResult.rows);
  }
  const columnsMap = groupRowsByTableKey(rowsByQuery.get('columns') ?? []);
  const constraintsMap = groupRowsByTableKey(rowsByQuery.get('constraints') ?? []);
  const indexesMap = groupRowsByTableKey(rowsByQuery.get('indexes') ?? []);
  const policiesMap = groupRowsByTableKey(rowsByQuery.get('policies') ?? []);
  const grantsMap = groupRowsByTableKey(rowsByQuery.get('roleGrants') ?? []);

  return (rowsByQuery.get('tables') ?? []).map((tableSnapshot) => {
    const tableKeyLiteral = buildTableKeyLiteral(tableSnapshot);
    return {
      ...tableSnapshot,
      columnsCollection: columnsMap.get(tableKeyLiteral) ?? [],
      constraintsCollection: constraintsMap.get(tableKeyLiteral) ?? [],
      indexesCollection: indexesMap.get(tableKeyLiteral) ?? [],
      policiesCollection: policiesMap.get(tableKeyLiteral) ?? [],
      roleGrantsCollection: grantsMap.get(tableKeyLiteral) ?? [],
    };
  });
};

/**
 * Extrae y valida la auditoría granular de todas las tablas de aplicación y CMS.
 *
 * @param postgresClientInstance - Cliente `pg.Client` conectado y autenticado.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<readonly ITableGranularAuditSnapshot[]>} Colección validada e inmutable.
 */
export const FetchPostgresTablesGranularAudit = async (
  postgresClientInstance: TSanitizedPostgresClient,
  correlationIdentifierFallback?: string,
): Promise<readonly ITableGranularAuditSnapshot[]> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  if (typeof postgresClientInstance?.query !== 'function') {
    const validationException = new ValidationException('INVALID_POSTGRES_CLIENT_INSTANCE', {
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    AUDIT_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<readonly ITableGranularAuditSnapshot[]> => {
      try {
        const rawTablesPayload = await assembleTablesAuditPayloadAction(postgresClientInstance);
        const validationResult = TablesAuditCollectionSchema.safeParse(rawTablesPayload);
        if (!validationResult.success) {
          throw new InternalSystemException('POSTGRES_TABLES_AUDIT_CONTRACT_VIOLATION', {
            validationIssuesCollection: validationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const auditedTablesCollection = Object.freeze(validationResult.data);
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: COMPLETED_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Auditoría granular de tablas PostgreSQL completada.',
          semanticIntentTag: 'SUPABASE_TABLES_INTROSPECTION_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            auditedTablesCountQuantity: auditedTablesCollection.length,
          }),
        });
        return auditedTablesCollection;
      } catch (caughtError: unknown) {
        const originalErrorLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : new InternalSystemException('POSTGRES_TABLES_AUDIT_QUERY_FAILED', {
                originalErrorLiteral,
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
