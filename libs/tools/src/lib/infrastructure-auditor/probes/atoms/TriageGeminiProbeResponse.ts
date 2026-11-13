/**
 * @section Infrastructure Auditor - Gemini Response Triage Engine (Atom)
 * @description Átomo de lógica pura encargado de evaluar la respuesta HTTP de
 * Google Generative Language API, clasificar los códigos de estado RFC 9110,
 * diagnosticar la degradación de latencia y emitir telemetría forense estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO Zenith:
 * 1. Erradicación de TS18004 alineando el parámetro 'endpointTargetLiteral' con el contrato Zod.
 * 2. Purga de extensión sintética '.js' en la importación de esquemas (Turbopack Clean Paths).
 * 3. Inmutabilidad forzada mediante Object.freeze y tipado estricto sin 'any'.
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
import type { IIndividualProviderAuditSnapshot } from '../../schemas/CloudInfrastructureAuditReport.schema';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const TRIAGE_MODULE_IDENTIFIER = 'GEMINI_RESPONSE_TRIAGE_ATOM' as ModuleIdentifier;

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
  // 1. TRIAJE DE RESPUESTA EXITOSA (HTTP 200 OK)
  if (incomingNetworkResponse.ok) {
    const isLatencyDegradedBoolean = executionLatencyInMillisecondsQuantity > 1000;

    const finalStatusLiteral = isLatencyDegradedBoolean
      ? 'DEGRADED_LATENCY'
      : 'NOMINAL_OPERATIONAL';

    const statusDescriptionLiteral = isLatencyDegradedBoolean
      ? `Google Gemini 1.5 Flash operativo con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
      : `Google Gemini 1.5 Flash plenamente operativo y autenticado (${executionLatencyInMillisecondsQuantity}ms).`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'GEMINI_PROBE_SUCCESSFUL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
      contextMetadataSnapshot: {
        executionLatencyInMillisecondsQuantity,
        httpStatusCodeNumeric: incomingNetworkResponse.status,
      },
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

  // 2. TRIAJE DE ERRORES DE AUTORIZACIÓN, CUOTA O SERVIDOR (400 / 403 / 429 / 5xx)
  const isAuthenticationFailureBoolean =
    incomingNetworkResponse.status === 400 || incomingNetworkResponse.status === 403;

  const isRateLimitExceededBoolean = incomingNetworkResponse.status === 429;

  const errorStatusDescriptionLiteral = isAuthenticationFailureBoolean
    ? `Autenticación rechazada por Google AI Studio (HTTP ${incomingNetworkResponse.status}): GOOGLE_GEMINI_API_KEY inválida o sin permisos.`
    : isRateLimitExceededBoolean
      ? 'Límite de tasa excedido en Google AI Studio (HTTP 429). Tier gratuito saturado temporalmente.'
      : `Google Gemini API respondió con código de error inesperado (HTTP ${incomingNetworkResponse.status}).`;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: isAuthenticationFailureBoolean
      ? ('GEMINI_PROBE_AUTH_REJECTED' as OperationCode)
      : ('GEMINI_PROBE_HTTP_ERROR' as OperationCode),
    correlationIdentifier,
    messageContentLiteral: errorStatusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: incomingNetworkResponse.status,
    },
  });

  return Object.freeze({
    providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
    probeStatusLiteral: isAuthenticationFailureBoolean
      ? 'AUTHENTICATION_REJECTED'
      : 'UNREACHABLE_FAILURE',
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral: errorStatusDescriptionLiteral,
    endpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}_${incomingNetworkResponse.statusText}`,
  });
};
