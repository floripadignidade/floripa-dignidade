/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/ResolveSupabaseAuditHelpers.ts
 * @section Supabase Auditor - Shared Audit Helpers (Atom SSOT)
 * @description Átomo de Única Fuente de Verdad (SSOT) encargado de centralizar la
 * resolución segura de identificadores de correlación distribuida (`CorrelationIdentifier`)
 * y el catálogo inmutable de esquemas gestionados excluidos en introspección PostgreSQL.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

const HELPERS_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SUPABASE_AUDIT_HELPERS_ATOM',
);

const INVALID_CORRELATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SUPABASE_AUDIT_INVALID_CORRELATION_FALLBACK',
);

const ExcludedManagedSchemasCollectionSchema = z
  .array(
    z
      .string()
      .trim()
      .regex(/^[a-z0-9_]+$/, { message: 'INVALID_POSTGRES_SCHEMA_IDENTIFIER' }),
  )
  .min(1)
  .readonly();

/**
 * @name EXCLUDED_MANAGED_SCHEMAS_COLLECTION
 * @description Lista inmutable de esquemas internos/gestionados de Supabase excluidos de auditoría.
 */
export const EXCLUDED_MANAGED_SCHEMAS_COLLECTION: readonly string[] = Object.freeze(
  ExcludedManagedSchemasCollectionSchema.parse([
    'information_schema',
    'auth',
    'storage',
    'realtime',
    '_realtime',
    '_analytics',
    'supabase_functions',
    'extensions',
    'vault',
    'graphql',
    'graphql_public',
    'pgsodium',
    'pgsodium_masks',
    'net',
    'cron',
  ]),
);

/**
 * @name EXCLUDED_MANAGED_SCHEMAS_SQL
 * @description Lista SQL formateada para cláusulas `NOT IN (...)` en sondas de solo lectura.
 */
export const EXCLUDED_MANAGED_SCHEMAS_SQL: string = EXCLUDED_MANAGED_SCHEMAS_COLLECTION.map(
  (schemaNameLiteral) => `'${schemaNameLiteral}'`,
).join(',');

/**
 * Valida un identificador de correlación candidato contra `CorrelationIdentifierSchema` o
 * genera un nuevo UUID v4 nominal cuando está ausente o malformado, emitiendo aviso SRE
 * si se recibió un valor no vacío inválido.
 *
 * @param candidateIdentifier - Identificador UUID candidato opcional propagado desde el llamador.
 * @returns {CorrelationIdentifier} Identificador de correlación válido y sellado nominalmente.
 */
export const ResolveSafeCorrelationIdentifier = (
  candidateIdentifier?: string | undefined,
): CorrelationIdentifier => {
  if (candidateIdentifier === undefined || candidateIdentifier.trim() === '') {
    return GenerateCorrelationIdentifier();
  }

  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier.trim());
  if (validationResult.success) {
    return validationResult.data;
  }

  const fallbackCorrelationIdentifier = GenerateCorrelationIdentifier();

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: HELPERS_MODULE_IDENTIFIER,
    operationCodeLiteral: INVALID_CORRELATION_OPERATION_CODE,
    correlationIdentifier: fallbackCorrelationIdentifier,
    messageContentLiteral:
      'Identificador de correlación inválido recibido en auditoría Supabase; generando nuevo UUID.',
    semanticIntentTag: 'SUPABASE_AUDIT_CORRELATION_FALLBACK',
    contextMetadataSnapshot: Object.freeze({
      attemptedLengthQuantity: candidateIdentifier.length,
    }),
  });

  return fallbackCorrelationIdentifier;
};
