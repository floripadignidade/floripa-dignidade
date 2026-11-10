/**
 * @section AI Providers - Hugging Face Router Engine Driver (Atom)
 * @description Adaptador de red y transporte encargado de la comunicación física con
 * los modelos de inteligencia artificial alojados en el enrutador de Hugging Face
 * (Inference Providers Router: 'https://router.huggingface.co/hf-inference/models/...').
 * Implementa protocolo de transporte seguro, medición de latencia y gestión de estados
 * de inicialización en frío (Cold Start) bajo estándares SRE.
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

/* 2. Contratos Centralizados de Inferencia */
import type { IInferenceResponse } from '../schemas/Inference.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const DRIVER_MODULE_IDENTIFIER =
  'HUGGING_FACE_ROUTER_INFERENCE_DRIVER' as ModuleIdentifier;

/**
 * @constant CANONICAL_ROUTER_MODEL_URL_LITERAL
 * Endpoint oficial actualizado para inferencia serverless en Hugging Face Router (Phi-3 Mini).
 */
const CANONICAL_ROUTER_MODEL_URL_LITERAL =
  'https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct';

/**
 * @constant INFERENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Límite estricto de espera de red para evitar bloqueos en el hilo principal o en Vercel Serverless.
 */
const INFERENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 12000;

/**
 * Ejecuta una consulta física de inferencia cognitiva contra el enrutador de Hugging Face.
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Carga útil o prompt a procesar por el modelo de IA.
 * @returns {Promise<unknown>} Respuesta cruda del proveedor para ser certificada por la aduana de ADN.
 */
export const ExecuteHuggingFaceInference = async (
  unvalidatedIntelligencePayloadSnapshot: unknown,
): Promise<unknown> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawHuggingFaceApiTokenSecret =
    environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'];
  const rawHuggingFaceModelUrlLiteral =
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_URL'] ??
    CANONICAL_ROUTER_MODEL_URL_LITERAL;

  // 1. VERIFICACIÓN DE SECRETOS DE ENTORNO
  const isTokenConfiguredBoolean =
    !!rawHuggingFaceApiTokenSecret && rawHuggingFaceApiTokenSecret.trim() !== '';

  if (!isTokenConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'HF_ROUTER_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Conexión con Hugging Face abortada: HUGGING_FACE_API_TOKEN no configurado.',
      semanticIntentTag: 'AI_INFERENCE_ABORTED',
    });

    return Object.freeze({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation:
        'El token de acceso HUGGING_FACE_API_TOKEN no está configurado en las variables de entorno.',
      suggestedAction: 'NONE',
      detectedAnomalies: ['MISSING_HF_ACCESS_TOKEN'],
      metadata: { statusLiteral: 'UNCONFIGURED_CREDENTIALS' },
    });
  }

  // 2. NORMALIZACIÓN DE LA URL DEL ENRUTADOR (Corrección automática de dominios obsoletos)
  const targetModelUrlLiteral = rawHuggingFaceModelUrlLiteral.includes(
    'api-inference.huggingface.co',
  )
    ? rawHuggingFaceModelUrlLiteral.replace(
        'api-inference.huggingface.co',
        'router.huggingface.co/hf-inference',
      )
    : rawHuggingFaceModelUrlLiteral;

  const executionStartTimestampNumeric = performance.now();

  try {
    const serializedPayloadLiteral = JSON.stringify(
      typeof unvalidatedIntelligencePayloadSnapshot === 'string'
        ? { inputs: unvalidatedIntelligencePayloadSnapshot }
        : unvalidatedIntelligencePayloadSnapshot,
    );

    // 3. DESPACHO DE LA CONSULTA AL ENRUTADOR DE HUGGING FACE
    const incomingNetworkResponse = await fetch(targetModelUrlLiteral.trim(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${rawHuggingFaceApiTokenSecret.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
        'X-Correlation-Identifier': correlationIdentifier,
      },
      body: serializedPayloadLiteral,
      signal: AbortSignal.timeout(INFERENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    // 4. TRIAJE DE RESPUESTA EXITOSA
    if (incomingNetworkResponse.ok) {
      const parsedResponseBody: unknown = await incomingNetworkResponse.json();

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
        operationCodeLiteral:
          'HF_ROUTER_INFERENCE_SUCCESS' as OperationCode,
        correlationIdentifier,
        messageContentLiteral:
          'Inferencia cognitiva ejecutada exitosamente a través de Hugging Face Router.',
        executionLatencyInMillisecondsQuantity,
        semanticIntentTag: 'AI_INFERENCE_SUCCESS',
        contextMetadataSnapshot: {
          targetModelUrlLiteral,
          executionLatencyInMillisecondsQuantity,
        },
      });

      return {
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
      };
    }

    // 5. TRIAJE DE ESTADOS CRÍTICOS (Cold Start 503 o Rechazo 401/403)
    const isModelLoadingColdStartBoolean =
      incomingNetworkResponse.status === 503;
    const isAuthenticationRejectedBoolean =
      incomingNetworkResponse.status === 401 ||
      incomingNetworkResponse.status === 403;

    const errorStatusDescriptionLiteral = isModelLoadingColdStartBoolean
      ? 'El modelo cognitivo está cargando en la memoria del enrutador (Cold Start). Reintento sugerido.'
      : isAuthenticationRejectedBoolean
        ? `Autenticación rechazada por Hugging Face Router (HTTP ${incomingNetworkResponse.status}): HUGGING_FACE_API_TOKEN inválido.`
        : `El enrutador de Hugging Face respondió con error HTTP ${incomingNetworkResponse.status}.`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: isModelLoadingColdStartBoolean
        ? 'WARNING'
        : 'CRITICAL',
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
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
      suggestedAction: isModelLoadingColdStartBoolean
        ? 'NONE'
        : 'RESTART_MODULE',
      detectedAnomalies: [`HTTP_STATUS_${incomingNetworkResponse.status}`],
      metadata: {
        isFaultyBoolean: true,
        httpStatusCodeNumeric: incomingNetworkResponse.status,
      },
    });
  } catch (caughtExecutionError: unknown) {
    // 6. GESTIÓN FORENSE DE COLAPSO DE RED / TIMEOUT
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
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'HF_ROUTER_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con Hugging Face Router: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'AI_INFERENCE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetModelUrlLiteral,
      },
    });

    return Object.freeze({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: `Fallo de comunicación de red con el modelo de IA: ${errorDescriptionLiteral}`,
      suggestedAction: 'RESTART_MODULE',
      detectedAnomalies: [errorDescriptionLiteral],
      metadata: {
        isFaultyBoolean: true,
        errorDescriptionLiteral,
      },
    });
  }
};

/**
 * @name executeHuggingFaceInference
 * @description Alias institucional en camelCase para compatibilidad con la factoría de drivers.
 */
export const executeHuggingFaceInference = ExecuteHuggingFaceInference;