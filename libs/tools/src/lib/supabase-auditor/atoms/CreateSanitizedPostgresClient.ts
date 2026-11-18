/**
 * @file libs/tools/src/lib/supabase-auditor/atoms/CreateSanitizedPostgresClient.ts
 * @section Supabase Auditor - Sanitized PostgreSQL Client Builder (Atom)
 * @description Átomo encargado de leer `DATABASE_URL` (o `DIRECT_DATABASE_URL` para DDL)
 * mediante `GatherEnvironmentMetadata`, normalizar parámetros `sslmode` conflictivos para
 * Supabase Pooler, aplicar soporte TLS con CA opcional (`SUPABASE_DB_ROOT_CERT_PEM`),
 * fijar timeouts SRE y retornar `pg.Client` junto con metadatos libres de credenciales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Cloud-Primary).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import pg from 'pg';
import { z } from 'zod';

import {
  GatherEnvironmentMetadata,
  PostgresUniformResourceLocatorSchema,
} from '@floripa-dignidade/environment-validator';

import type { TPostgresConnectionMode } from '../schemas/SupabaseConnectionReport.schema';

const DEFAULT_POSTGRES_TIMEOUT_IN_MILLISECONDS_QUANTITY = 10_000;

const SSL_PARAMETERS_TO_STRIP_COLLECTION: readonly string[] = Object.freeze([
  'sslmode',
  'sslrootcert',
  'sslcert',
  'sslkey',
  'uselibpqcompat',
]);

const CreateSanitizedPostgresClientOptionsSchema = z
  .object({
    preferDirectMigrationConnectionBoolean: z.boolean().default(false),
    statementTimeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(1_000)
      .max(120_000)
      .default(DEFAULT_POSTGRES_TIMEOUT_IN_MILLISECONDS_QUANTITY),
  })
  .readonly();

export type TSanitizedPostgresClient = InstanceType<typeof pg.Client>;

/**
 * @interface ICreateSanitizedPostgresClientOptions
 * @description Opciones inmutables para seleccionar canal DDL directo y timeout de sesión.
 */
export interface ICreateSanitizedPostgresClientOptions {
  readonly preferDirectMigrationConnectionBoolean?: boolean | undefined;
  readonly statementTimeoutInMillisecondsQuantity?: number | undefined;
}

/**
 * @interface ISanitizedPostgresMetadata
 * @description Coordenadas no sensibles de red extraídas de la cadena de conexión.
 */
export interface ISanitizedPostgresMetadata {
  readonly targetHostLiteral: string;
  readonly targetPortNumeric: number;
  readonly isSslEncryptedBoolean: boolean;
  readonly connectionModeLiteral: TPostgresConnectionMode;
}

export interface IConfiguredPostgresClientResult {
  readonly isConfiguredBoolean: true;
  readonly clientInstance: TSanitizedPostgresClient;
  readonly sourceEnvironmentKeyLiteral: 'DATABASE_URL' | 'DIRECT_DATABASE_URL';
  readonly connectionMetadata: ISanitizedPostgresMetadata;
}

export interface IUnconfiguredPostgresClientResult {
  readonly isConfiguredBoolean: false;
  readonly errorCodeLiteral: 'MISSING_DATABASE_URL' | 'MALFORMED_DATABASE_URL';
  readonly diagnosticMessageLiteral: string;
  readonly connectionMetadata: ISanitizedPostgresMetadata;
}

export type TPostgresClientResolution =
  | IConfiguredPostgresClientResult
  | IUnconfiguredPostgresClientResult;

const resolveTlsConfiguration = (
  rawCertificatePemLiteral: string | undefined,
  isSslDisabledBoolean: boolean,
): false | { readonly rejectUnauthorized: boolean; readonly ca?: string } => {
  if (isSslDisabledBoolean) {
    return false;
  }

  const normalizedPemLiteral = rawCertificatePemLiteral?.replace(/\\n/g, '\n').trim();
  if (normalizedPemLiteral && normalizedPemLiteral.length > 0) {
    return Object.freeze({ rejectUnauthorized: true, ca: normalizedPemLiteral });
  }

  return Object.freeze({ rejectUnauthorized: false });
};

const detectPostgresConnectionMode = (
  targetHostLiteral: string,
  targetPortNumeric: number,
): TPostgresConnectionMode => {
  const isPoolerBoolean =
    targetHostLiteral.includes('pooler.supabase.com') || targetPortNumeric === 6543;

  return isPoolerBoolean ? 'POOLER_TRANSACTION_OR_SESSION' : 'DIRECT_HOST';
};

const buildUnconfiguredFallback = (
  errorCodeLiteral: 'MISSING_DATABASE_URL' | 'MALFORMED_DATABASE_URL',
  diagnosticMessageLiteral: string,
): IUnconfiguredPostgresClientResult =>
  Object.freeze({
    isConfiguredBoolean: false,
    errorCodeLiteral,
    diagnosticMessageLiteral,
    connectionMetadata: Object.freeze({
      targetHostLiteral: 'UNCONFIGURED_HOST',
      targetPortNumeric: 5432,
      isSslEncryptedBoolean: false,
      connectionModeLiteral: 'UNKNOWN',
    }),
  });

const selectConnectionStringSource = (
  environmentSnapshot: Readonly<Record<string, string | undefined>>,
  preferDirectMigrationConnectionBoolean: boolean,
): {
  readonly rawUrlLiteral: string | undefined;
  readonly sourceEnvironmentKeyLiteral: 'DATABASE_URL' | 'DIRECT_DATABASE_URL';
} => {
  const directUrlLiteral = environmentSnapshot['DIRECT_DATABASE_URL']?.trim();
  if (preferDirectMigrationConnectionBoolean && directUrlLiteral) {
    return {
      rawUrlLiteral: directUrlLiteral,
      sourceEnvironmentKeyLiteral: 'DIRECT_DATABASE_URL',
    };
  }

  return {
    rawUrlLiteral: environmentSnapshot['DATABASE_URL']?.trim(),
    sourceEnvironmentKeyLiteral: 'DATABASE_URL',
  };
};

const buildParsedTargetCoordinates = (validatedUrlLiteral: string) => {
  const parsedUrl = new URL(validatedUrlLiteral);
  const isSslDisabledBoolean = parsedUrl.searchParams.get('sslmode')?.toLowerCase() === 'disable';

  for (const parameterKeyLiteral of SSL_PARAMETERS_TO_STRIP_COLLECTION) {
    parsedUrl.searchParams.delete(parameterKeyLiteral);
  }

  const targetHostLiteral = parsedUrl.hostname || 'UNKNOWN_HOST';
  const parsedPortNumeric = parsedUrl.port ? Number.parseInt(parsedUrl.port, 10) : 5432;

  return {
    sanitizedConnectionStringLiteral: parsedUrl.toString(),
    targetHostLiteral,
    targetPortNumeric: Number.isNaN(parsedPortNumeric) ? 5432 : parsedPortNumeric,
    isSslDisabledBoolean,
  };
};

/**
 * Construye y retorna un cliente PostgreSQL configurado para auditoría o provisión DDL.
 *
 * @param optionsSnapshot - Opciones opcionales de canal DDL y timeout de sesión.
 * @returns {TPostgresClientResolution} Cliente listo con metadatos sanitizados o diagnóstico previo.
 */
export const CreateSanitizedPostgresClient = (
  optionsSnapshot: ICreateSanitizedPostgresClientOptions = {},
): TPostgresClientResolution => {
  const parsedOptionsResult = CreateSanitizedPostgresClientOptionsSchema.safeParse(optionsSnapshot);
  const validatedOptions = parsedOptionsResult.success
    ? parsedOptionsResult.data
    : CreateSanitizedPostgresClientOptionsSchema.parse({});

  const environmentSnapshot = GatherEnvironmentMetadata();
  const { rawUrlLiteral, sourceEnvironmentKeyLiteral } = selectConnectionStringSource(
    environmentSnapshot,
    validatedOptions.preferDirectMigrationConnectionBoolean,
  );

  if (!rawUrlLiteral) {
    return buildUnconfiguredFallback(
      'MISSING_DATABASE_URL',
      `La variable de entorno ${sourceEnvironmentKeyLiteral} no está configurada.`,
    );
  }

  const urlValidationResult = PostgresUniformResourceLocatorSchema.safeParse(rawUrlLiteral);
  if (!urlValidationResult.success) {
    return buildUnconfiguredFallback(
      'MALFORMED_DATABASE_URL',
      `La cadena ${sourceEnvironmentKeyLiteral} no cumple el formato postgresql:// válido.`,
    );
  }

  const coordinates = buildParsedTargetCoordinates(urlValidationResult.data);
  const sslConfiguration = resolveTlsConfiguration(
    environmentSnapshot['SUPABASE_DB_ROOT_CERT_PEM'],
    coordinates.isSslDisabledBoolean,
  );

  const clientInstance = new pg.Client({
    connectionString: coordinates.sanitizedConnectionStringLiteral,
    ssl: sslConfiguration,
    connectionTimeoutMillis: validatedOptions.statementTimeoutInMillisecondsQuantity,
    query_timeout: validatedOptions.statementTimeoutInMillisecondsQuantity,
    statement_timeout: validatedOptions.statementTimeoutInMillisecondsQuantity,
  });

  return Object.freeze({
    isConfiguredBoolean: true,
    clientInstance,
    sourceEnvironmentKeyLiteral,
    connectionMetadata: Object.freeze({
      targetHostLiteral: coordinates.targetHostLiteral,
      targetPortNumeric: coordinates.targetPortNumeric,
      isSslEncryptedBoolean: !coordinates.isSslDisabledBoolean,
      connectionModeLiteral: detectPostgresConnectionMode(
        coordinates.targetHostLiteral,
        coordinates.targetPortNumeric,
      ),
    }),
  });
};
