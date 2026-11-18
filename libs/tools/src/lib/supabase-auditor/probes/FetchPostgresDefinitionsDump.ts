/**
 * @file libs/tools/src/lib/supabase-auditor/probes/FetchPostgresDefinitionsDump.ts
 * @section Supabase Auditor - PostgreSQL SQL Definitions Dump Probe (Atom)
 * @description Sonda de solo lectura que extrae definiciones SQL de funciones y triggers.
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
  FunctionDefinitionDumpSchema,
  TriggerDefinitionDumpSchema,
} from '../schemas/SupabaseDumpSnapshotReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('POSTGRES_DEFINITIONS_DUMP_PROBE');
const AUDIT_OPERATION_CODE = OperationCodeSchema.parse('FETCH_POSTGRES_SQL_DEFINITIONS_DUMP');
const DUMP_COMPLETED_CODE = OperationCodeSchema.parse('POSTGRES_SQL_DEFINITIONS_DUMP_FETCHED');

const PostgresDefinitionsDumpOutputSchema = z
  .object({
    functionsDefinitionsCollection: z.array(FunctionDefinitionDumpSchema).readonly(),
    triggersDefinitionsCollection: z.array(TriggerDefinitionDumpSchema).readonly(),
  })
  .readonly();

export type IPostgresDefinitionsDumpSnapshot = z.infer<typeof PostgresDefinitionsDumpOutputSchema>;

const DEFINITIONS_SQL_QUERIES = Object.freeze({
  functions: `SELECT n.nspname AS "schemaNameLiteral", p.proname AS "functionNameLiteral",
    pg_catalog.pg_get_functiondef(p.oid) AS "definitionSqlLiteral"
    FROM pg_catalog.pg_proc p INNER JOIN pg_catalog.pg_namespace n ON n.oid = p.pronamespace
    WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
      AND p.prokind IN ('f', 'p') AND NOT EXISTS (SELECT 1 FROM pg_catalog.pg_depend d
        WHERE d.objid = p.oid AND d.deptype = 'e') ORDER BY n.nspname ASC, p.proname ASC;`,
  triggers: `SELECT n.nspname AS "schemaNameLiteral", c.relname AS "tableNameLiteral",
    t.tgname AS "triggerNameLiteral",
    pg_catalog.pg_get_triggerdef(t.oid) AS "definitionSqlLiteral"
    FROM pg_catalog.pg_trigger t INNER JOIN pg_catalog.pg_class c ON c.oid = t.tgrelid
    INNER JOIN pg_catalog.pg_namespace n ON n.oid = c.relnamespace
    WHERE n.nspname NOT LIKE 'pg_%' AND n.nspname NOT IN (${EXCLUDED_MANAGED_SCHEMAS_SQL})
      AND NOT t.tgisinternal ORDER BY n.nspname ASC, c.relname ASC, t.tgname ASC;`,
});

const querySqlDefinitionsAction = async (
  clientInstance: TSanitizedPostgresClient,
  correlationIdentifier: string,
): Promise<IPostgresDefinitionsDumpSnapshot> => {
  const functionsResult = await clientInstance.query<Record<string, unknown>>(
    DEFINITIONS_SQL_QUERIES.functions,
  );
  const triggersResult = await clientInstance.query<Record<string, unknown>>(
    DEFINITIONS_SQL_QUERIES.triggers,
  );
  const validationResult = PostgresDefinitionsDumpOutputSchema.safeParse({
    functionsDefinitionsCollection: functionsResult.rows,
    triggersDefinitionsCollection: triggersResult.rows,
  });
  if (!validationResult.success) {
    throw new InternalSystemException('POSTGRES_DEFINITIONS_CONTRACT_VIOLATION', {
      validationIssuesCollection: validationResult.error.flatten(),
      correlationIdentifier,
    });
  }
  return Object.freeze(validationResult.data);
};

/**
 * Extrae y valida las definiciones SQL de funciones y disparadores de esquemas de usuario.
 *
 * @param postgresClientInstance - Cliente `pg.Client` conectado y autenticado.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<IPostgresDefinitionsDumpSnapshot>} Definiciones SQL certificadas.
 */
export const FetchPostgresDefinitionsDump = async (
  postgresClientInstance: TSanitizedPostgresClient,
  correlationIdentifierFallback?: string,
): Promise<IPostgresDefinitionsDumpSnapshot> => {
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
    async (): Promise<IPostgresDefinitionsDumpSnapshot> => {
      try {
        const definitionsSnapshot = await querySqlDefinitionsAction(
          postgresClientInstance,
          correlationIdentifier,
        );
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: DUMP_COMPLETED_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Definiciones SQL de funciones y triggers extraídas con éxito.',
          semanticIntentTag: 'SUPABASE_DEFINITIONS_DUMP_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            functionsCountQuantity: definitionsSnapshot.functionsDefinitionsCollection.length,
            triggersCountQuantity: definitionsSnapshot.triggersDefinitionsCollection.length,
          }),
        });
        return definitionsSnapshot;
      } catch (caughtError: unknown) {
        const originalErrorLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : new InternalSystemException('POSTGRES_DEFINITIONS_DUMP_QUERY_FAILED', {
                originalErrorLiteral,
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
