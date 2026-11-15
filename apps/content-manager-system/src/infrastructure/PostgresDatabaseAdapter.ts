/**
 * @file apps/content-manager-system/src/infrastructure/PostgresDatabaseAdapter.ts
 * @section CMS Infrastructure - Postgres Database Adapter
 * @description Configura el adaptador de persistencia PostgreSQL para Payload CMS 3.84+
 * optimizado para Vercel Serverless y Supabase Pooler (ADR 0015 / ADR 0031). Normaliza
 * parámetros `sslmode` conflictivos de `pg-connection-string`, aplica TLS con verificación
 * estricta cuando se provee certificado CA raíz (`SUPABASE_DB_ROOT_CERT_PEM`) o TLS cifrado
 * compatible con Supabase Pooler, y desactiva `push` automático en producción.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Cloud-Primary).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { postgresAdapter } from '@payloadcms/db-postgres';

import {
  GatherEnvironmentMetadata,
  PostgresUniformResourceLocatorSchema,
} from '@floripa-dignidade/environment-validator';
import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

const ADAPTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'CMS_POSTGRES_DATABASE_ADAPTER',
);

const ADAPTER_INITIALIZED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CMS_POSTGRES_ADAPTER_CONFIGURED',
);

const SSL_QUERY_PARAMETERS_TO_STRIP_COLLECTION: readonly string[] = Object.freeze([
  'sslmode',
  'sslrootcert',
  'sslcert',
  'sslkey',
  'uselibpqcompat',
]);

interface ITlsSocketConfiguration {
  readonly rejectUnauthorized: boolean;
  readonly ca?: string;
}

interface INormalizedConnectionDescriptor {
  readonly sanitizedConnectionStringLiteral: string;
  readonly targetHostLiteral: string;
  readonly targetPortLiteral: string;
  readonly isSslDisabledBoolean: boolean;
}

const normalizePostgresConnectionString = (
  databaseUrlLiteral: string,
): INormalizedConnectionDescriptor => {
  const parsedDatabaseUrl = new URL(databaseUrlLiteral);
  const requestedSslModeLiteral = parsedDatabaseUrl.searchParams.get('sslmode')?.toLowerCase();
  const isSslDisabledBoolean = requestedSslModeLiteral === 'disable';

  for (const parameterKeyLiteral of SSL_QUERY_PARAMETERS_TO_STRIP_COLLECTION) {
    parsedDatabaseUrl.searchParams.delete(parameterKeyLiteral);
  }

  return Object.freeze({
    sanitizedConnectionStringLiteral: parsedDatabaseUrl.toString(),
    targetHostLiteral: parsedDatabaseUrl.hostname || 'UNKNOWN_HOST',
    targetPortLiteral: parsedDatabaseUrl.port || '5432',
    isSslDisabledBoolean,
  });
};

const resolveTlsSocketConfiguration = (
  rawRootCertificatePemLiteral: string | undefined,
): ITlsSocketConfiguration => {
  const normalizedCertificatePemLiteral = rawRootCertificatePemLiteral
    ?.replace(/\\n/g, '\n')
    .trim();

  if (normalizedCertificatePemLiteral && normalizedCertificatePemLiteral.length > 0) {
    return Object.freeze({
      rejectUnauthorized: true,
      ca: normalizedCertificatePemLiteral,
    });
  }

  return Object.freeze({
    rejectUnauthorized: false,
  });
};

/**
 * Genera la instancia del adaptador PostgreSQL validada para Payload CMS en Vercel y Supabase.
 *
 * @param databaseUrlLiteral - Cadena de conexión validada por `ValidateEnvironmentContract`.
 * @returns Adaptador configurado para el motor relacional de Payload CMS.
 * @throws {ValidationException} Si la cadena de conexión incumple el contrato PostgreSQL.
 */
export const CreatePostgresDatabaseAdapter = (databaseUrlLiteral: string) => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const urlValidationResult = PostgresUniformResourceLocatorSchema.safeParse(databaseUrlLiteral);

  if (!urlValidationResult.success) {
    const validationException = new ValidationException('INVALID_CMS_POSTGRES_CONNECTION_URL', {
      validationIssuesCollection: urlValidationResult.error.flatten(),
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const isProductionEnvironmentBoolean = environmentMetadataSnapshot['NODE_ENV'] === 'production';
  const isSchemaPushEnabledBoolean = !isProductionEnvironmentBoolean;

  const normalizedConnection = normalizePostgresConnectionString(urlValidationResult.data);
  const tlsSocketConfiguration = resolveTlsSocketConfiguration(
    environmentMetadataSnapshot['SUPABASE_DB_ROOT_CERT_PEM'],
  );

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: ADAPTER_MODULE_IDENTIFIER,
    operationCodeLiteral: ADAPTER_INITIALIZED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Adaptador PostgreSQL del CMS configurado con aislamiento TLS.',
    semanticIntentTag: 'CMS_DATABASE_ADAPTER_INIT',
    contextMetadataSnapshot: Object.freeze({
      targetHostLiteral: normalizedConnection.targetHostLiteral,
      targetPortLiteral: normalizedConnection.targetPortLiteral,
      sslVerificationModeLiteral: normalizedConnection.isSslDisabledBoolean
        ? 'DISABLED'
        : tlsSocketConfiguration.rejectUnauthorized
          ? 'STRICT_CA_VERIFIED'
          : 'ENCRYPTED_POOLER_COMPATIBLE',
      isSchemaPushEnabledBoolean,
    }),
  });

  return postgresAdapter({
    push: isSchemaPushEnabledBoolean,
    pool: {
      connectionString: normalizedConnection.sanitizedConnectionStringLiteral,
      ssl: normalizedConnection.isSslDisabledBoolean ? false : tlsSocketConfiguration,
      max: 10,
      idleTimeoutMillis: 30000,
      connectionTimeoutMillis: 10000,
    },
  });
};
