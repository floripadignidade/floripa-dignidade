/**
 * @file libs/tools/src/lib/supabase-auditor/probes/ExecuteSupabaseHttpLayersDiagnostic.ts
 * @section Supabase Auditor - HTTP Layers Diagnostic Probe (Atom)
 * @description Sonda concurrente de disponibilidad, autenticación y latencia para PostgREST
 * (`/rest/v1/`) y Supabase Storage API (`/storage/v1/bucket`).
 * Protocolo OEDP-V18.1 | ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 */

import {
  GatherEnvironmentMetadata,
  SupabaseUniformResourceLocatorSchema,
} from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ResolveSafeCorrelationIdentifier } from '../atoms/ResolveSupabaseAuditHelpers';
import {
  type ISupabaseHttpLayerDiagnostic,
  SupabaseHttpLayerDiagnosticSchema,
  type TSupabaseConnectionCheckStatus,
} from '../schemas/SupabaseConnectionReport.schema';

const PROBE_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'SUPABASE_HTTP_LAYERS_DIAGNOSTIC_PROBE',
);
const AUDIT_CODE = OperationCodeSchema.parse('EXECUTE_SUPABASE_HTTP_LAYERS_AUDIT');
const SKIPPED_CODE = OperationCodeSchema.parse('SUPABASE_HTTP_LAYERS_AUDIT_SKIPPED');
const MAXIMUM_HTTP_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;
const DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY = 1000;
const AUTH_REJECTED_CODES_SET: ReadonlySet<number> = new Set([401, 403]);
const LAYER_ENDPOINT_SPECS = Object.freeze([
  { layerIdentifierLiteral: 'POSTGREST_REST_API', pathSuffixLiteral: '/rest/v1/' },
  { layerIdentifierLiteral: 'SUPABASE_STORAGE_API', pathSuffixLiteral: '/storage/v1/bucket' },
] as const);
type TLayerIdentifier = (typeof LAYER_ENDPOINT_SPECS)[number]['layerIdentifierLiteral'];

const computeElapsedMillisecondsQuantity = (startTimestampNumeric: number): number =>
  Math.max(0, Math.round(globalThis.performance.now() - startTimestampNumeric));

const resolveStatusFromHttpStatus = (
  httpStatusCodeNumeric: number,
  latencyInMillisecondsQuantity: number,
): TSupabaseConnectionCheckStatus => {
  if (AUTH_REJECTED_CODES_SET.has(httpStatusCodeNumeric)) return 'AUTHENTICATION_FAILED';
  if (httpStatusCodeNumeric < 200 || httpStatusCodeNumeric >= 300) return 'UNREACHABLE';
  return latencyInMillisecondsQuantity > DEGRADED_LATENCY_THRESHOLD_IN_MILLISECONDS_QUANTITY
    ? 'DEGRADED_LATENCY'
    : 'OPERATIONAL';
};

const buildHttpOutcomeDiagnostic = (
  layerIdentifierLiteral: TLayerIdentifier,
  networkResponse: Response,
  latencyInMillisecondsQuantity: number,
  endpointUrlLiteral: string,
): ISupabaseHttpLayerDiagnostic => {
  const statusLiteral = resolveStatusFromHttpStatus(
    networkResponse.status,
    latencyInMillisecondsQuantity,
  );
  const statusMessageLiteral = networkResponse.ok
    ? `Capa ${layerIdentifierLiteral} HTTP ${networkResponse.status}`
    : `Capa ${layerIdentifierLiteral} falló con HTTP ${networkResponse.status}`;
  const diagnosticMessageLiteral = `${statusMessageLiteral} (${latencyInMillisecondsQuantity}ms).`;
  const authHintLiteral = 'Verificar SUPABASE_SERVICE_ROLE_KEY en Supabase API Settings.';
  return Object.freeze(
    SupabaseHttpLayerDiagnosticSchema.parse({
      layerIdentifierLiteral,
      statusLiteral,
      httpStatusCodeNumeric: networkResponse.status,
      latencyInMillisecondsQuantity,
      sanitizedEndpointLiteral: endpointUrlLiteral,
      diagnosticMessageLiteral,
      ...(statusLiteral === 'AUTHENTICATION_FAILED' && {
        remediationHintLiteral: authHintLiteral,
      }),
    }),
  );
};

const probeIndividualHttpEndpoint = async (
  layerIdentifierLiteral: TLayerIdentifier,
  endpointUrlLiteral: string,
  serviceRoleKeySecret: string,
): Promise<ISupabaseHttpLayerDiagnostic> => {
  const startTimestampNumeric = globalThis.performance.now();
  try {
    const networkResponse = await fetch(endpointUrlLiteral, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKeySecret,
        Authorization: `Bearer ${serviceRoleKeySecret}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(MAXIMUM_HTTP_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });
    return buildHttpOutcomeDiagnostic(
      layerIdentifierLiteral,
      networkResponse,
      computeElapsedMillisecondsQuantity(startTimestampNumeric),
      endpointUrlLiteral,
    );
  } catch (caughtError: unknown) {
    const messageLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);
    return Object.freeze(
      SupabaseHttpLayerDiagnosticSchema.parse({
        layerIdentifierLiteral,
        statusLiteral: 'UNREACHABLE',
        latencyInMillisecondsQuantity: computeElapsedMillisecondsQuantity(startTimestampNumeric),
        sanitizedEndpointLiteral: endpointUrlLiteral,
        diagnosticMessageLiteral: `Fallo de red en ${layerIdentifierLiteral}: ${messageLiteral}`,
        remediationHintLiteral: 'Verificar URL base de Supabase y conectividad de red saliente.',
      }),
    );
  }
};

/**
 * Ejecuta el diagnóstico concurrente de las capas HTTP de PostgREST y Storage de Supabase.
 *
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional de trazabilidad SRE.
 * @returns {Promise<readonly ISupabaseHttpLayerDiagnostic[]>} Lista inmutable de diagnósticos HTTP.
 */
export const ExecuteSupabaseHttpLayersDiagnostic = async (
  correlationIdentifierFallback?: string,
): Promise<readonly ISupabaseHttpLayerDiagnostic[]> => {
  const correlationIdentifier = ResolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const environmentSnapshot = GatherEnvironmentMetadata();
  const urlResult = SupabaseUniformResourceLocatorSchema.safeParse(
    environmentSnapshot['SUPABASE_URL'],
  );
  const rawServiceKeyLiteral = environmentSnapshot['SUPABASE_SERVICE_ROLE_KEY']?.trim() ?? '';
  if (!urlResult.success || rawServiceKeyLiteral.length === 0) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: SKIPPED_CODE,
      correlationIdentifier,
      messageContentLiteral: 'Auditoría HTTP omitida por credenciales ausentes o URL inválida.',
      semanticIntentTag: 'SUPABASE_HTTP_PROBE_SKIPPED',
    });
    return Object.freeze(
      LAYER_ENDPOINT_SPECS.map((specSnapshot) =>
        SupabaseHttpLayerDiagnosticSchema.parse({
          layerIdentifierLiteral: specSnapshot.layerIdentifierLiteral,
          statusLiteral: 'UNCONFIGURED',
          latencyInMillisecondsQuantity: 0,
          sanitizedEndpointLiteral: 'UNCONFIGURED_URL',
          diagnosticMessageLiteral: 'SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no configurados.',
          remediationHintLiteral: 'Configurar SUPABASE_URL y SUPABASE_SERVICE_ROLE_KEY válidos.',
        }),
      ),
    );
  }

  const baseUrlLiteral = urlResult.data.replace(/\/+$/, '');
  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    AUDIT_CODE,
    correlationIdentifier,
    async (): Promise<readonly ISupabaseHttpLayerDiagnostic[]> => {
      const diagnosticsCollection = await Promise.all(
        LAYER_ENDPOINT_SPECS.map((specSnapshot) =>
          probeIndividualHttpEndpoint(
            specSnapshot.layerIdentifierLiteral,
            `${baseUrlLiteral}${specSnapshot.pathSuffixLiteral}`,
            rawServiceKeyLiteral,
          ),
        ),
      );
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
        operationCodeLiteral: AUDIT_CODE,
        correlationIdentifier,
        messageContentLiteral: 'Auditoría de capas HTTP de Supabase completada.',
        semanticIntentTag: 'SUPABASE_HTTP_LAYERS_AUDIT_SUCCESS',
        contextMetadataSnapshot: Object.freeze({
          postgrestStatusLiteral: diagnosticsCollection[0]?.statusLiteral ?? 'UNREACHABLE',
          storageStatusLiteral: diagnosticsCollection[1]?.statusLiteral ?? 'UNREACHABLE',
        }),
      });
      return Object.freeze(diagnosticsCollection);
    },
  );
};
