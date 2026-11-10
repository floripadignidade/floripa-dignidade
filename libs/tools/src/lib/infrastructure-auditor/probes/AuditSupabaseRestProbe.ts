/**
 * @section Tools & Infrastructure - Supabase PostgREST Gateway Probe (Atom)
 * @description Sonda de conectividad y autenticación de red encargada de verificar físicamente
 * la disponibilidad, validez del token 'Service Role' y latencia de respuesta del gateway
 * REST (PostgREST) de Supabase configurado en 'SUPABASE_URL' y 'SUPABASE_SERVICE_ROLE_KEY'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PROBE_MODULE_IDENTIFIER =
  'SUPABASE_REST_GATEWAY_PROBE_ATOM' as ModuleIdentifier;

/**
 * @constant MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Límite estricto de tiempo de respuesta (SRE) para la verificación del gateway de datos.
 */
const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * @constant MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY
 * Umbral a partir del cual la latencia del proveedor se clasifica como degradada.
 */
const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 800;

/**
 * Audita activamente la autenticación y disponibilidad física del gateway REST de Supabase.
 * Realiza una solicitud HTTP directa a la raíz del servicio PostgREST verificando el apretón
 * de manos y capturando la latencia exacta de ida y vuelta (Round-trip time).
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la API REST.
 */
export const AuditSupabaseRestProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawSupabaseUrlLiteral = environmentMetadataSnapshot['SUPABASE_URL'];
  const rawServiceRoleKeySecret =
    environmentMetadataSnapshot['SUPABASE_SERVICE_ROLE_KEY'];

  // 1. VERIFICACIÓN DE EXISTENCIA FÍSICA DE CREDENCIALES
  const isUrlConfiguredBoolean =
    !!rawSupabaseUrlLiteral && rawSupabaseUrlLiteral.trim() !== '';
  const isKeyConfiguredBoolean =
    !!rawServiceRoleKeySecret && rawServiceRoleKeySecret.trim() !== '';

  if (!isUrlConfiguredBoolean || !isKeyConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'SUPABASE_REST_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Supabase REST omitida: Variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY ausentes.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'Las credenciales SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas.',
      endpointTargetLiteral: rawSupabaseUrlLiteral ?? 'URL_NO_CONFIGURADA',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_SUPABASE_REST_SECRETS',
    });
  }

  // 2. NORMALIZACIÓN DEL ENDPOINT DE DESTINO
  const sanitizedBaseUrlLiteral = rawSupabaseUrlLiteral.endsWith('/')
    ? rawSupabaseUrlLiteral.slice(0, -1)
    : rawSupabaseUrlLiteral;

  const targetRestEndpointLiteral = `${sanitizedBaseUrlLiteral}/rest/v1/`;

  const executionStartTimestampNumeric = performance.now();

  try {
    // 3. DESPACHO DE LA CONSULTA DE SONDEO (Stateless I/O)
    const incomingNetworkResponse = await fetch(targetRestEndpointLiteral, {
      method: 'GET',
      headers: {
        apikey: rawServiceRoleKeySecret,
        Authorization: `Bearer ${rawServiceRoleKeySecret}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(
        MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY,
      ),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    // 4. EVALUACIÓN Y TRIAJE DEL CÓDIGO DE ESTADO HTTP
    if (incomingNetworkResponse.ok) {
      const isLatencyDegradedBoolean =
        executionLatencyInMillisecondsQuantity >
        MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

      const finalStatusLiteral = isLatencyDegradedBoolean
        ? 'DEGRADED_LATENCY'
        : 'NOMINAL_OPERATIONAL';

      const statusDescriptionLiteral = isLatencyDegradedBoolean
        ? `Gateway PostgREST operativo con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
        : 'Gateway PostgREST de Supabase plenamente operativo y autenticado.';

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
        moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
        operationCodeLiteral:
          'SUPABASE_REST_PROBE_SUCCESSFUL' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: statusDescriptionLiteral,
        executionLatencyInMillisecondsQuantity,
        semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
        contextMetadataSnapshot: {
          httpStatusCodeNumeric: incomingNetworkResponse.status,
          executionLatencyInMillisecondsQuantity,
        },
      });

      return Object.freeze({
        providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
        probeStatusLiteral: finalStatusLiteral,
        executionLatencyInMillisecondsQuantity,
        statusDescriptionLiteral,
        endpointTargetLiteral: targetRestEndpointLiteral,
        hasValidSecretFormatBoolean: true,
      });
    }

    // 5. TRIAJE DE ERRORES DE AUTORIZACIÓN (HTTP 401 / 403)
    const isAuthenticationFailureBoolean =
      incomingNetworkResponse.status === 401 ||
      incomingNetworkResponse.status === 403;

    const errorStatusDescriptionLiteral = isAuthenticationFailureBoolean
      ? `Autenticación rechazada por Supabase (HTTP ${incomingNetworkResponse.status}): SUPABASE_SERVICE_ROLE_KEY inválida.`
      : `El gateway PostgREST respondió con código de error inesperado (HTTP ${incomingNetworkResponse.status}).`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: isAuthenticationFailureBoolean
        ? ('SUPABASE_REST_AUTH_REJECTED' as OperationCode)
        : ('SUPABASE_REST_UNEXPECTED_STATUS' as OperationCode),
      correlationIdentifier,
      messageContentLiteral: errorStatusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
      contextMetadataSnapshot: {
        httpStatusCodeNumeric: incomingNetworkResponse.status,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
      probeStatusLiteral: isAuthenticationFailureBoolean
        ? 'AUTHENTICATION_REJECTED'
        : 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: errorStatusDescriptionLiteral,
      endpointTargetLiteral: targetRestEndpointLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}_${incomingNetworkResponse.statusText}`,
    });
  } catch (caughtExecutionError: unknown) {
    // 6. TRIAJE DE COLAPSOS DE RED (DNS / Timeout / Socket Error)
    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'SUPABASE_REST_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con Supabase REST: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetEndpointLiteral: targetRestEndpointLiteral,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de establecer conexión con Supabase REST: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: targetRestEndpointLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};