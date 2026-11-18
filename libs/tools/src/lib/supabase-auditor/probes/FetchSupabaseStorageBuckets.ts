/**
 * @file libs/tools/src/lib/supabase-auditor/probes/FetchSupabaseStorageBuckets.ts
 * @section Supabase Auditor - Storage Buckets Probe (Atom)
 * @description Sonda HTTP de solo lectura para listar buckets activos en Supabase Storage
 * (`/storage/v1/bucket`) y validar su configuración contra `StorageBucketSnapshotSchema`.
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import { z } from 'zod';

import {
  GatherEnvironmentMetadata,
  SupabaseUniformResourceLocatorSchema,
} from '@floripa-dignidade/environment-validator';
import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ResolveSafeCorrelationIdentifier } from '../atoms/ResolveSupabaseAuditHelpers';
import { StorageBucketSnapshotSchema } from '../schemas/SupabaseResourcesAuditReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse('SUPABASE_STORAGE_BUCKETS_PROBE');
const AUDIT_CODE = OperationCodeSchema.parse('FETCH_SUPABASE_STORAGE_BUCKETS');
const FETCHED_CODE = OperationCodeSchema.parse('SUPABASE_STORAGE_BUCKETS_FETCHED');
const WARNING_CODE = OperationCodeSchema.parse('SUPABASE_STORAGE_BUCKETS_UNAVAILABLE');
const MAXIMUM_HTTP_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;

const RawBucketsArraySchema = z
  .array(
    z
      .object({
        id: z.string().min(1),
        name: z.string().min(1),
        public: z.boolean().default(false),
        file_size_limit: z.number().nonnegative().nullable().optional(),
      })
      .readonly(),
  )
  .readonly();

const StorageBucketsCollectionSchema = z.array(StorageBucketSnapshotSchema).readonly();
export type IStorageBucketSnapshot = z.infer<typeof StorageBucketSnapshotSchema>;

const resolveStorageCredentials = () => {
  const environmentSnapshot = GatherEnvironmentMetadata();
  const urlResult = SupabaseUniformResourceLocatorSchema.safeParse(
    environmentSnapshot['SUPABASE_URL'],
  );
  const serviceRoleKeySecret = environmentSnapshot['SUPABASE_SERVICE_ROLE_KEY']?.trim() ?? '';
  if (!urlResult.success || serviceRoleKeySecret.length === 0) return null;
  return Object.freeze({
    endpointUrlLiteral: `${urlResult.data.replace(/\/+$/, '')}/storage/v1/bucket`,
    serviceRoleKeySecret,
  });
};

const parseAndMapStorageBuckets = (rawPayload: unknown): readonly IStorageBucketSnapshot[] => {
  const rawValidation = RawBucketsArraySchema.safeParse(rawPayload);
  if (!rawValidation.success) {
    throw MapHttpErrorToException(502, 'SUPABASE_STORAGE_BUCKETS_PAYLOAD_INVALID', {
      validationIssuesCollection: rawValidation.error.flatten(),
    });
  }
  const mappedBuckets = rawValidation.data.map((bucketSnapshot) => ({
    bucketIdentifierLiteral: bucketSnapshot.id,
    bucketNameLiteral: bucketSnapshot.name,
    isPublicBoolean: bucketSnapshot.public,
    fileSizeLimitBytesNumeric: bucketSnapshot.file_size_limit ?? null,
  }));
  return Object.freeze(StorageBucketsCollectionSchema.parse(mappedBuckets));
};

const emitStorageWarningAction = (
  correlationIdentifier: CorrelationIdentifier,
  messageContentLiteral: string,
  semanticIntentTag: string,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
    operationCodeLiteral: WARNING_CODE,
    correlationIdentifier,
    messageContentLiteral,
    semanticIntentTag,
  });
};

/**
 * Obtiene y certifica en solo lectura los buckets provisionados en Supabase Storage.
 *
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<readonly IStorageBucketSnapshot[]>} Colección inmutable de buckets.
 */
export const FetchSupabaseStorageBuckets = async (
  correlationIdentifierFallback?: string,
): Promise<readonly IStorageBucketSnapshot[]> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const credentialsSnapshot = resolveStorageCredentials();
  if (!credentialsSnapshot) {
    emitStorageWarningAction(
      correlationIdentifier,
      'Sonda de buckets omitida por credenciales Supabase ausentes.',
      'SUPABASE_STORAGE_PROBE_SKIPPED',
    );
    return Object.freeze([]);
  }

  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    AUDIT_CODE,
    correlationIdentifier,
    async (): Promise<readonly IStorageBucketSnapshot[]> => {
      try {
        const networkResponse = await fetch(credentialsSnapshot.endpointUrlLiteral, {
          method: 'GET',
          headers: {
            apikey: credentialsSnapshot.serviceRoleKeySecret,
            Authorization: `Bearer ${credentialsSnapshot.serviceRoleKeySecret}`,
            Accept: 'application/json',
          },
          signal: AbortSignal.timeout(MAXIMUM_HTTP_TIMEOUT_IN_MILLISECONDS_QUANTITY),
        });
        if (!networkResponse.ok) {
          throw MapHttpErrorToException(
            networkResponse.status,
            'SUPABASE_STORAGE_BUCKETS_HTTP_ERROR',
            { endpointUrlLiteral: credentialsSnapshot.endpointUrlLiteral },
          );
        }
        const bucketsCollection = parseAndMapStorageBuckets(
          (await networkResponse.json()) as unknown,
        );
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: FETCHED_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Inventario de buckets de Supabase Storage extraído con éxito.',
          semanticIntentTag: 'SUPABASE_STORAGE_BUCKETS_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            bucketsCountQuantity: bucketsCollection.length,
          }),
        });
        return bucketsCollection;
      } catch (caughtError: unknown) {
        const messageLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);
        const normalizedException =
          caughtError instanceof GlobalBaseException
            ? caughtError
            : MapHttpErrorToException(502, 'SUPABASE_STORAGE_BUCKETS_FETCH_FAILED', {
                originalErrorLiteral: messageLiteral,
                correlationIdentifier,
              });
        ReportForensicException(normalizedException, correlationIdentifier);
        emitStorageWarningAction(
          correlationIdentifier,
          `Fallo al consultar buckets de Storage: ${messageLiteral}`,
          'SUPABASE_STORAGE_BUCKETS_WARNING',
        );
        return Object.freeze([]);
      }
    },
  );
};
