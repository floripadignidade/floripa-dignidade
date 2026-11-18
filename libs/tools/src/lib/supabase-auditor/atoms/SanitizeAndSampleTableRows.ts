/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/SanitizeAndSampleTableRows.ts
 * @section Supabase Auditor - Table Rows Sanitizer & Sampler (Atom)
 * @description Átomo encargado de validar entradas, muestrear hasta N filas de una tabla,
 * purgar columnas secretas (`[OMITTED_SECRET]`) y aplicar enmascaramiento PII conforme a
 * la LGPD mediante `MaskCitizenIdentity` de `@floripa-dignidade/shared-utility`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  MaskCitizenIdentity,
  type TIdentityMaskingStrategy,
} from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import {
  type ISanitizedTableDataDump,
  SanitizedTableDataDumpSchema,
} from '../schemas/SupabaseDumpSnapshotReport.schema';

const SANITIZER_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SUPABASE_ROW_SANITIZER_ATOM');
const SANITIZE_COMPLETED_OPERATION_CODE = OperationCodeSchema.parse('TABLE_ROWS_SANITIZED');
const SANITIZE_REJECTED_OPERATION_CODE = OperationCodeSchema.parse('TABLE_ROWS_CONTRACT_INVALID');

const SECRET_COLUMN_PATTERNS: readonly string[] = Object.freeze([
  'password',
  'token',
  'secret',
  'salt',
  'hash',
  'key',
  'credential',
]);

const PII_COLUMN_PATTERNS: readonly string[] = Object.freeze([
  'email',
  'phone',
  'telefone',
  'celular',
  'whatsapp',
  'cpf',
  'cnpj',
  'tax_id',
  'document',
]);

const NAME_COLUMN_PATTERNS: readonly string[] = Object.freeze([
  'name',
  'fullname',
  'legal_name',
  'nome',
]);

const SanitizeTableRowsInputSchema = z
  .object({
    schemaNameLiteral: z.string().trim().min(1),
    tableNameLiteral: z.string().trim().min(1),
    exactRowCountNumeric: z.number().int().nonnegative(),
    rawRowsCollection: z.array(z.record(z.string(), z.unknown())).readonly(),
    sampleLimitQuantity: z.number().int().positive().max(100),
  })
  .readonly();

const matchesColumnPatternBoolean = (
  columnNameLiteral: string,
  patternsCollection: readonly string[],
): boolean => {
  const normalizedColumnLiteral = columnNameLiteral.toLowerCase();
  return patternsCollection.some((patternLiteral) =>
    normalizedColumnLiteral.includes(patternLiteral),
  );
};

const resolveMaskingStrategy = (columnNameLiteral: string): TIdentityMaskingStrategy | null => {
  if (matchesColumnPatternBoolean(columnNameLiteral, PII_COLUMN_PATTERNS)) {
    return columnNameLiteral.toLowerCase().includes('email')
      ? 'ELECTRONIC_MAIL'
      : 'BRAZILIAN_DOCUMENT';
  }
  if (matchesColumnPatternBoolean(columnNameLiteral, NAME_COLUMN_PATTERNS)) {
    return 'CITIZEN_NAME';
  }
  return null;
};

const sanitizeSingleRowRecordAction = async (
  rowSnapshot: Readonly<Record<string, unknown>>,
  secretColumnsSet: ReadonlySet<string>,
): Promise<Readonly<Record<string, unknown>>> => {
  const sanitizedRowObject: Record<string, unknown> = {};

  for (const [columnNameLiteral, rawCellValue] of Object.entries(rowSnapshot)) {
    if (secretColumnsSet.has(columnNameLiteral)) {
      sanitizedRowObject[columnNameLiteral] = '[OMITTED_SECRET]';
      continue;
    }

    const maskingStrategyLiteral = resolveMaskingStrategy(columnNameLiteral);
    const hasMaskableStringBoolean =
      maskingStrategyLiteral !== null &&
      rawCellValue !== null &&
      rawCellValue !== undefined &&
      String(rawCellValue).trim().length > 0;

    sanitizedRowObject[columnNameLiteral] = hasMaskableStringBoolean
      ? await MaskCitizenIdentity({
          rawIdentityLiteral: String(rawCellValue),
          maskingStrategyLiteral,
        })
      : (rawCellValue ?? null);
  }

  return Object.freeze(sanitizedRowObject);
};

/**
 * Sanitiza y muestrea las filas de una tabla, enmascarando PII y omitiendo columnas secretas.
 *
 * @param schemaNameLiteral - Esquema propietario de la tabla en PostgreSQL.
 * @param tableNameLiteral - Nombre físico de la tabla auditada.
 * @param exactRowCountNumeric - Conteo exacto de registros existentes en la tabla.
 * @param rawRowsCollection - Colección cruda de filas muestreadas en modo solo lectura.
 * @param sampleLimitQuantity - Límite máximo de filas saneadas a conservar (por defecto 20).
 * @returns {Promise<ISanitizedTableDataDump>} Snapshot inmutable certificado contra Zod.
 * @throws {ValidationException} Si los parámetros de entrada incumplen el contrato estructural.
 */
export const SanitizeAndSampleTableRows = async (
  schemaNameLiteral: string,
  tableNameLiteral: string,
  exactRowCountNumeric: number,
  rawRowsCollection: readonly Record<string, unknown>[],
  sampleLimitQuantity = 20,
): Promise<ISanitizedTableDataDump> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const inputValidation = SanitizeTableRowsInputSchema.safeParse({
    schemaNameLiteral,
    tableNameLiteral,
    exactRowCountNumeric,
    rawRowsCollection,
    sampleLimitQuantity,
  });

  if (!inputValidation.success) {
    const validationIssuesCollection = inputValidation.error.flatten();
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: SANITIZER_MODULE_IDENTIFIER,
      operationCodeLiteral: SANITIZE_REJECTED_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: 'Parámetros inválidos en sanitizador de filas Supabase.',
      semanticIntentTag: 'LGPD_SANITIZATION_INPUT_INVALID',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });
    const validationException = new ValidationException('INVALID_TABLE_ROW_SANITIZATION_INPUT', {
      validationIssuesCollection,
      correlationIdentifier,
    });
    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedInput = inputValidation.data;
  const sampledRowsSlice = validatedInput.rawRowsCollection.slice(
    0,
    validatedInput.sampleLimitQuantity,
  );
  const distinctColumnsCollection = Array.from(
    new Set(sampledRowsSlice.flatMap((rowSnapshot) => Object.keys(rowSnapshot))),
  );
  const omittedSecretColumnsCollection = distinctColumnsCollection.filter((columnNameLiteral) =>
    matchesColumnPatternBoolean(columnNameLiteral, SECRET_COLUMN_PATTERNS),
  );
  const secretColumnsSet = new Set(omittedSecretColumnsCollection);
  const maskedColumnsCollection = distinctColumnsCollection.filter(
    (columnNameLiteral) =>
      !secretColumnsSet.has(columnNameLiteral) &&
      resolveMaskingStrategy(columnNameLiteral) !== null,
  );

  const sanitizedRowsCollection = await Promise.all(
    sampledRowsSlice.map((rowSnapshot) =>
      sanitizeSingleRowRecordAction(rowSnapshot, secretColumnsSet),
    ),
  );

  const isTruncatedByLimitBoolean =
    validatedInput.rawRowsCollection.length > validatedInput.sampleLimitQuantity ||
    validatedInput.exactRowCountNumeric > sanitizedRowsCollection.length;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: SANITIZER_MODULE_IDENTIFIER,
    operationCodeLiteral: SANITIZE_COMPLETED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `Muestreo LGPD completado para [${validatedInput.schemaNameLiteral}.${validatedInput.tableNameLiteral}].`,
    semanticIntentTag: 'LGPD_TABLE_SAMPLE_SANITIZED',
    contextMetadataSnapshot: Object.freeze({
      sampledRowsCountQuantity: sanitizedRowsCollection.length,
      maskedColumnsCountQuantity: maskedColumnsCollection.length,
      omittedSecretColumnsCountQuantity: omittedSecretColumnsCollection.length,
    }),
  });

  return Object.freeze(
    SanitizedTableDataDumpSchema.parse({
      schemaNameLiteral: validatedInput.schemaNameLiteral,
      tableNameLiteral: validatedInput.tableNameLiteral,
      exactRowCountNumeric: validatedInput.exactRowCountNumeric,
      sampledRowsCountQuantity: sanitizedRowsCollection.length,
      isTruncatedByLimitBoolean,
      maskedColumnsCollection,
      omittedSecretColumnsCollection,
      rowsCollection: sanitizedRowsCollection,
    }),
  );
};
