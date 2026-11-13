/**
 * @section AI Providers - Hugging Face Response Triage Engine (Atom)
 * @description Átomo de lógica pura encargado de evaluar las respuestas HTTP devueltas
 * por el enrutador de Hugging Face, discriminar estados de arranque en frío (Cold Start 503)
 * de rechazos de autenticación (401/403) y emitir la telemetría SRE correspondiente.
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

/* 2. Contratos Centralizados de Inferencia (Clean Paths) */
import type { IInferenceResponse } from '../../schemas/Inference.schema';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const TRIAGE_MODULE_IDENTIFIER = 'HUGGING_FACE_RESPONSE_TRIAGE_ATOM' as ModuleIdentifier;

/**
 * Evalúa la respuesta HTTP de Hugging Face Router y emite el dictamen de inferencia estructurado.
 *
 * @param incomingNetworkResponse - Respuesta HTTP física capturada del enrutador.
 * @param executionLatencyInMillisecondsQuantity - Latencia de red medida en milisegundos.
 * @param targetModelUrlLiteral - URL canónica consultada.
 * @param correlationIdentifier - Identificador de correlación forense.
 * @returns {Promise<IInferenceResponse>} Snapshot inmutable con el contrato de inferencia garantizado.
 */
export const TriageHuggingFaceResponse = async (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  targetModelUrlLiteral: string,
  correlationIdentifier: string,
): Promise<IInferenceResponse> => {
  // 1. TRIAJE DE RESPUESTA EXITOSA (HTTP 200 OK)
  if (incomingNetworkResponse.ok) {
    const parsedResponseBody: unknown = await incomingNetworkResponse.json();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'HF_ROUTER_INFERENCE_SUCCESS' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Inferencia cognitiva procesada con éxito a través de Hugging Face Router.',
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'AI_INFERENCE_SUCCESS',
      contextMetadataSnapshot: {
        targetModelUrlLiteral,
        executionLatencyInMillisecondsQuantity,
      },
    });

    return Object.freeze({
      analysisId: correlationIdentifier,
      confidenceScore: 0.95,
      observation: 'Inferencia procesada nominalmente por el enrutador SLM.',
      suggestedAction: 'NONE',
      detectedAnomalies: [],
      metadata: {
        targetModelUrlLiteral,
        executionLatencyInMillisecondsQuantity,
        rawResponseSnapshot: parsedResponseBody,
      },
    });
  }

  // 2. TRIAJE DE ESTADOS CRÍTICOS (Cold Start 503 vs Autenticación 401/403)
  const isModelLoadingColdStartBoolean = incomingNetworkResponse.status === 503;
  const isAuthenticationRejectedBoolean =
    incomingNetworkResponse.status === 401 || incomingNetworkResponse.status === 403;

  const errorStatusDescriptionLiteral = isModelLoadingColdStartBoolean
    ? 'El modelo cognitivo está cargando en la memoria del enrutador (Cold Start 503). Reintento sugerido.'
    : isAuthenticationRejectedBoolean
      ? `Autenticación rechazada por Hugging Face Router (HTTP ${incomingNetworkResponse.status}): HUGGING_FACE_API_TOKEN inválido.`
      : `El enrutador de Hugging Face respondió con código de error HTTP ${incomingNetworkResponse.status}.`;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isModelLoadingColdStartBoolean ? 'WARNING' : 'CRITICAL',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: isModelLoadingColdStartBoolean
      ? ('HF_ROUTER_COLD_START' as OperationCode)
      : ('HF_ROUTER_HTTP_ERROR' as OperationCode),
    correlationIdentifier,
    messageContentLiteral: errorStatusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_FAILURE',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: incomingNetworkResponse.status,
    },
  });

  return Object.freeze({
    analysisId: correlationIdentifier,
    confidenceScore: 0,
    observation: errorStatusDescriptionLiteral,
    suggestedAction: isModelLoadingColdStartBoolean ? 'NONE' : 'RESTART_MODULE',
    detectedAnomalies: [`HTTP_STATUS_${incomingNetworkResponse.status}`],
    metadata: {
      isFaultyBoolean: true,
      httpStatusCodeNumeric: incomingNetworkResponse.status,
    },
  });
};
