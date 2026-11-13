/**
 * @section Infrastructure Auditor - Supabase REST Response Triage Engine (Atom)
 * @description Átomo de lógica pura encargado de evaluar la respuesta HTTP devuelta
 * por el gateway PostgREST de Supabase, clasificar los códigos de estado RFC 9110,
 * diagnosticar la degradación de latencia y emitir telemetría forense estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría (Clean Paths - Extensionless) */
import type {
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../../schemas/CloudInfrastructureAuditReport.schema';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const TRIAGE_MODULE_IDENTIFIER = 'SUPABASE_REST_RESPONSE_TRIAGE_ATOM' as ModuleIdentifier;

/**
 * @constant MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY
 * Umbral de tiempo a partir del cual la latencia del proveedor se clasifica como degradada.
 */
const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 800;

/**
 * Resuelve el estatus operacional y descripción semántica ante una respuesta HTTP exitosa.
 */
const resolveNominalStatusSnapshot = (
  executionLatencyInMillisecondsQuantity: number,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly severityLevelLiteral: 'INFO' | 'WARNING';
} => {
  const isLatencyDegradedBoolean =
    executionLatencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

  if (isLatencyDegradedBoolean) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral: `Gateway PostgREST operativo con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`,
      severityLevelLiteral: 'WARNING',
    };
  }

  return {
    probeStatusLiteral: 'NOMINAL_OPERATIONAL',
    statusDescriptionLiteral: 'Gateway PostgREST de Supabase plenamente operativo y autenticado.',
    severityLevelLiteral: 'INFO',
  };
};

/**
 * Resuelve el estatus categórico y diagnóstico semántico ante respuestas HTTP de error.
 */
const resolveErrorStatusSnapshot = (
  httpStatusCodeNumeric: number,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly operationCodeLiteral: OperationCode;
} => {
  const isAuthenticationFailureBoolean =
    httpStatusCodeNumeric === 401 || httpStatusCodeNumeric === 403;

  if (isAuthenticationFailureBoolean) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Autenticación rechazada por Supabase (HTTP ${httpStatusCodeNumeric}): SUPABASE_SERVICE_ROLE_KEY inválida.`,
      operationCodeLiteral: 'SUPABASE_REST_AUTH_REJECTED' as OperationCode,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `El gateway PostgREST respondió con código de error inesperado (HTTP ${httpStatusCodeNumeric}).`,
    operationCodeLiteral: 'SUPABASE_REST_UNEXPECTED_STATUS' as OperationCode,
  };
};

/**
 * Evalúa la respuesta HTTP del gateway REST de Supabase y emite el diagnóstico estructurado.
 *
 * @param incomingNetworkResponse - Respuesta HTTP devuelta por el servidor PostgREST.
 * @param executionLatencyInMillisecondsQuantity - Latencia de red física medida en milisegundos.
 * @param endpointTargetLiteral - URL canónica consultada durante el sondeo.
 * @param correlationIdentifier - Identificador único de correlación para trazabilidad forense.
 * @returns {IIndividualProviderAuditSnapshot} Snapshot sellado con el dictamen de salud del servicio.
 */
export const TriageSupabaseRestResponse = (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  endpointTargetLiteral: string,
  correlationIdentifier: string,
): IIndividualProviderAuditSnapshot => {
  // 1. TRIAJE DE RESPUESTA EXITOSA (HTTP 200 / 204 OK)
  if (incomingNetworkResponse.ok) {
    const { probeStatusLiteral, statusDescriptionLiteral, severityLevelLiteral } =
      resolveNominalStatusSnapshot(executionLatencyInMillisecondsQuantity);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral,
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'SUPABASE_REST_PROBE_SUCCESSFUL' as OperationCode,
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
      probeStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral,
      hasValidSecretFormatBoolean: true,
    });
  }

  // 2. TRIAJE DE RESPUESTAS DE ERROR (4xx / 5xx)
  const { probeStatusLiteral, statusDescriptionLiteral, operationCodeLiteral } =
    resolveErrorStatusSnapshot(incomingNetworkResponse.status);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: incomingNetworkResponse.status,
    },
  });

  return Object.freeze({
    providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
    probeStatusLiteral,
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral,
    endpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}_${incomingNetworkResponse.statusText}`,
  });
};
