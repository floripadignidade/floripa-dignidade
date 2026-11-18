/**
 * @file libs/tools/src/lib/supabase-auditor/probes/FetchPostgresCatalogObjects.ts
 * @section Supabase Auditor - PostgreSQL Catalog Objects Probe (Atom)
 * @description Sonda de solo lectura que extrae base activa, esquemas, extensiones,
 * funciones almacenadas y disparadores desde `pg_catalog` e `information_schema`.
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
  DatabaseExtensionSnapshotSchema,
  DatabaseFunctionSnapshotSchema,
  DatabaseTriggerSnapshotSchema,
} from '../schemas/SupabaseResourcesAuditReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('POSTGRES_CATALOG_OBJECTS_PROBE');
const AUDIT_OPERATION_CODE = OperationCodeSchema.parse('FETCH_POSTGRES_CATALOG_OBJECTS');
const COMPLETED_OPERATION_CODE = OperationCodeSchema.parse('POSTGRES_CATALOG_OBJECTS_FETCHED');

const PostgresCatalogOutputSchema = z
  .object({
    targetDatabaseNameLiteral: z.string().min(1),
    discoveredSchemasCollection: z.array(z.string().min(1)).readonly(),
    installedExtensionsCollection: z.array(DatabaseExtensionSnapshotSchema).readonly(),
    databaseFunctionsCollection: z.array(DatabaseFunctionSnapshotSchema).readonly(),
    databaseTriggersCollection: z.array(DatabaseTriggerSnapshotSchema).readonly(),
  })
  .readonly();

export type IPostgresCatalogObjectsSnapshot = z.infer<typeof PostgresCatalogOutputSchema>;

const CATALOG_SQL_QUERIES = Object.freeze({
  databaseName: 'SELECT current_database() AS "databaseNameLiteral";',
  schemas: `SELECT nspname AS "schemaNameLiteral" FROM pg_catalog.pg_namespace
    WHERE nspname NOT LIKE 'pg_%' AND nspname <> 'information_schema' ORDER BY nspname ASC;`,
  extensions: `SELECT e.extname AS "extensionNameLiteral",
    e.extversion AS "installedVersionLiteral", n.nspname AS "schemaNameLiteral"
    FROM pg_catalog.pg_extension e INNER JOIN pg_catalog.pg_namespace n
    ON n.oid = e.extnamespace ORDER BY e.extname ASC;`,
  functions: `SELECT n.nspname AS "schemaNameLiteral", p.proname AS "functionNameLiteral",
    CASE WHEN p.prosecdef THEN 'SECURITY_DEFINER' ELSE 'SECURITY_INVOKER' END
      AS "securityModeLiteral",
    COALESCE(NULLIF(pg_catalog.pg_get_function_result(p.oid), ''), 'VOID') AS "returnTypeLiteral"
    FROM pg_catalog.pg_proc p INNER JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
      AND p.prokind IN ('f', 'p') AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.objid = p.oid AND d.deptype = 'e') ORDER BY n.nspname ASC, p.proname ASC;`,
  triggers: `SELECT trigger_schema AS "schemaNameLiteral",
    event_object_table AS "tableNameLiteral", trigger_name AS "triggerNameLiteral",
    action_timing AS "timingLiteral", ARRAY_AGG(DISTINCT event_manipulation::text
      ORDER BY event_manipulation::text) AS "eventsCollection"
    FROM information_schema.triggers WHERE trigger_schema NOT LIKE 'pg_%'
      AND trigger_schema NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
    GROUP BY trigger_schema, event_object_table, trigger_name, action_timing
    ORDER BY trigger_schema ASC, event_object_table ASC, trigger_name ASC;`,
});

const queryAndValidateCatalogAction = async (
  clientInstance: TSanitizedPostgresClient,
  correlationIdentifier: string,
): Promise<IPostgresCatalogObjectsSnapshot> => {
  const queryKeys = ['databaseName', 'schemas', 'extensions', 'functions', 'triggers'] as const;
  const rowsMap: Record<(typeof queryKeys)[number], readonly Record<string, unknown>[]> = {
    databaseName: [],
    schemas: [],
    extensions: [],
    functions: [],
    triggers: [],
  };
  for (const keyLiteral of queryKeys) {
    const statementLiteral = CATALOG_SQL_QUERIES[keyLiteral];
    rowsMap[keyLiteral] = (
      await clientInstance.query<Record<string, unknown>>(statementLiteral)
    ).rows;
  }
  const validationResult = PostgresCatalogOutputSchema.safeParse({
    targetDatabaseNameLiteral: rowsMap.databaseName[0]?.['databaseNameLiteral'],
    discoveredSchemasCollection: rowsMap.schemas.map(
      (rowSnapshot) => rowSnapshot['schemaNameLiteral'],
    ),
    installedExtensionsCollection: rowsMap.extensions,
    databaseFunctionsCollection: rowsMap.functions,
    databaseTriggersCollection: rowsMap.triggers,
  });
  if (!validationResult.success) {
    throw new InternalSystemException('POSTGRES_CATALOG_CONTRACT_VIOLATION', {
      validationIssuesCollection: validationResult.error.flatten(),
      correlationIdentifier,
    });
  }
  return Object.freeze(validationResult.data);
};

/**
 * Extrae y valida en solo lectura los objetos del catálogo de PostgreSQL.
 *
 * @param postgresClientInstance - Cliente `pg.Client` conectado y autenticado.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<IPostgresCatalogObjectsSnapshot>} Catálogo validado e inmutable.
 * @throws {ValidationException} Si la instancia de cliente PostgreSQL no es válida.
 * @throws {InternalSystemException} Si falla la consulta SQL o el contrato de salida.
 */
export const FetchPostgresCatalogObjects = async (
  postgresClientInstance: TSanitizedPostgresClient,
  correlationIdentifierFallback?: string,
): Promise<IPostgresCatalogObjectsSnapshot> => {
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
    async (): Promise<IPostgresCatalogObjectsSnapshot> => {
      try {
        const catalogSnapshot = await queryAndValidateCatalogAction(
          postgresClientInstance,
          correlationIdentifier,
        );
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: COMPLETED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Catálogo PostgreSQL extraído y validado en solo lectura.',
          semanticIntentTag: 'SUPABASE_CATALOG_INTROSPECTION_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            schemasCountQuantity: catalogSnapshot.discoveredSchemasCollection.length,
            extensionsCountQuantity: catalogSnapshot.installedExtensionsCollection.length,
            functionsCountQuantity: catalogSnapshot.databaseFunctionsCollection.length,
            triggersCountQuantity: catalogSnapshot.databaseTriggersCollection.length,
          }),
        });
        return catalogSnapshot;
      } catch (caughtError: unknown) {
        const originalErrorLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : new InternalSystemException('POSTGRES_CATALOG_QUERY_FAILED', {
                originalErrorLiteral,
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
