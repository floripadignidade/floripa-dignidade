/**
 * @section Infrastructure Auditor - Gemini Response Triage Engine (Atom)
 * @description Átomo de lógica pura encargado de evaluar la respuesta HTTP de
 * Google Generative Language API, clasificar los códigos de estado RFC 9110
 * (`200 OK`, `400/401/403` Auth/Restricción, `404` Modelo retirado, `429` Cuota, `5xx`),
 * diagnosticar la degradación de latencia y emitir telemetría forense estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import type {
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../../schemas/CloudInfrastructureAuditReport.schema';

const TRIAGE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'GEMINI_RESPONSE_TRIAGE_ATOM',
);

const PROBE_SUCCESSFUL_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('GEMINI_PROBE_SUCCESSFUL');

const AUTH_REJECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_PROBE_AUTH_REJECTED',
);

const HTTP_ERROR_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('GEMINI_PROBE_HTTP_ERROR');

const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 1000;

interface IGeminiErrorStatusClassification {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
}

const classifyGeminiErrorStatusAction = (
  httpStatusCodeNumeric: number,
): IGeminiErrorStatusClassification => {
  if (
    httpStatusCodeNumeric === 400 ||
    httpStatusCodeNumeric === 401 ||
    httpStatusCodeNumeric === 403
  ) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Autenticación o permisos rechazados por Google AI Studio (HTTP ${httpStatusCodeNumeric}): GOOGLE_GEMINI_API_KEY inválida o sin alcance sobre Generative Language API.`,
    };
  }

  if (httpStatusCodeNumeric === 404) {
    return {
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      statusDescriptionLiteral:
        'El modelo solicitado en Google AI Studio no existe o fue retirado (HTTP 404). Se recomienda usar gemini-3.8-flash.',
    };
  }

  if (httpStatusCodeNumeric === 429) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral:
        'Límite de tasa excedido en Google AI Studio (HTTP 429). Cuota temporal saturada.',
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `Google Gemini API respondió con código de error inesperado (HTTP ${httpStatusCodeNumeric}).`,
  };
};

/**
 * Procesa la respuesta HTTP recibida y construye el diagnóstico inmutable del proveedor.
 *
 * @param incomingNetworkResponse - Respuesta HTTP devuelta por Google Generative Language API.
 * @param executionLatencyInMillisecondsQuantity - Latencia de red física medida en milisegundos.
 * @param endpointTargetLiteral - URL canónica consultada durante el sondeo.
 * @param correlationIdentifier - Identificador único de correlación para trazabilidad forense.
 * @returns {IIndividualProviderAuditSnapshot} Snapshot sellado con el dictamen de salud del servicio.
 */
export const TriageGeminiProbeResponse = (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  endpointTargetLiteral: string,
  correlationIdentifier: string,
): IIndividualProviderAuditSnapshot => {
  if (incomingNetworkResponse.ok) {
    const isLatencyDegradedBoolean =
      executionLatencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

    const finalStatusLiteral: TProbeExecutionStatus = isLatencyDegradedBoolean
      ? 'DEGRADED_LATENCY'
      : 'NOMINAL_OPERATIONAL';

    const statusDescriptionLiteral = isLatencyDegradedBoolean
      ? `Google Gemini API operativa con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
      : `Google Gemini API plenamente operativa y autenticada (${executionLatencyInMillisecondsQuantity}ms).`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: PROBE_SUCCESSFUL_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
      contextMetadataSnapshot: Object.freeze({
        executionLatencyInMillisecondsQuantity,
        httpStatusCodeNumeric: incomingNetworkResponse.status,
      }),
    });

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: finalStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral,
      hasValidSecretFormatBoolean: true,
    });
  }

  const { probeStatusLiteral, statusDescriptionLiteral } = classifyGeminiErrorStatusAction(
    incomingNetworkResponse.status,
  );

  const isAuthRejectedBoolean = probeStatusLiteral === 'AUTHENTICATION_REJECTED';

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: isAuthRejectedBoolean
      ? AUTH_REJECTED_OPERATION_CODE
      : HTTP_ERROR_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric: incomingNetworkResponse.status,
      endpointTargetLiteral,
    }),
  });

  return Object.freeze({
    providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
    probeStatusLiteral,
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral,
    endpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}_${incomingNetworkResponse.statusText}`,
  });
};
