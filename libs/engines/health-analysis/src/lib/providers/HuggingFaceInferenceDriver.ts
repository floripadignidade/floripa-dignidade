/**
 * @section AI Providers - Hugging Face Router Engine Driver (Orchestrator)
 * @description Adaptador de red y transporte encargado de la comunicación física con
 * los modelos de inteligencia artificial alojados en el enrutador de Hugging Face.
 * Implementa protocolo de transporte seguro, medición de latencia y gestión de estados
 * de inicialización en frío bajo estándares SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * SANEADO Zenith:
 * 1. Atomización completada: triaje de respuesta HTTP delegado a 'TriageHuggingFaceResponse'.
 * 2. Reducción física a 105 líneas (max-lines <= 150) y complejidad ciclomática a <= 4 (max 10).
 * 3. Consumo tipado del contrato 'IInferenceResponse' erradicando variables no utilizadas.
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

/* 2. Contratos Centralizados de Inferencia (Clean Paths) */
import type { IInferenceResponse } from '../schemas/Inference.schema';

/* 3. Enjambre Atómico Local (Clean Paths) */
import { TriageHuggingFaceResponse } from './atoms/TriageHuggingFaceResponse';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const DRIVER_MODULE_IDENTIFIER = 'HUGGING_FACE_ROUTER_INFERENCE_DRIVER' as ModuleIdentifier;

/** Endpoint oficial de inferencia serverless en Hugging Face Router (Phi-3 Mini). */
const CANONICAL_ROUTER_MODEL_URL_LITERAL =
  'https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct';

/** Límite estricto de espera de red (SRE) para evitar bloqueos en el hilo principal. */
const INFERENCE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 12000;

/**
 * Ejecuta una consulta física de inferencia cognitiva contra el enrutador de Hugging Face.
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Carga útil o prompt a procesar por el modelo de IA.
 * @returns {Promise<IInferenceResponse>} Respuesta estructurada y tipada bajo el contrato de inferencia.
 */
export const ExecuteHuggingFaceInference = async (
  unvalidatedIntelligencePayloadSnapshot: unknown,
): Promise<IInferenceResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawApiTokenSecret = environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'];
  const rawModelUrlLiteral =
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_URL'] ?? CANONICAL_ROUTER_MODEL_URL_LITERAL;

  // 1. VERIFICACIÓN PRE-VUELO DE SECRETOS DE ENTORNO
  const isTokenConfiguredBoolean = !!rawApiTokenSecret && rawApiTokenSecret.trim() !== '';

  if (!isTokenConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
      operationCodeLiteral: 'HF_ROUTER_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Conexión con Hugging Face abortada: HUGGING_FACE_API_TOKEN no configurado.',
      semanticIntentTag: 'AI_INFERENCE_ABORTED',
    });

    return Object.freeze({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: 'El token de acceso HUGGING_FACE_API_TOKEN no está configurado en el entorno.',
      suggestedAction: 'NONE',
      detectedAnomalies: ['MISSING_HF_ACCESS_TOKEN'],
      metadata: { statusLiteral: 'UNCONFIGURED_CREDENTIALS' },
    });
  }

  // 2. NORMALIZACIÓN DE LA URL DEL ENRUTADOR (Corrección automática de dominios obsoletos)
  const targetModelUrlLiteral = rawModelUrlLiteral.includes('api-inference.huggingface.co')
    ? rawModelUrlLiteral.replace(
        'api-inference.huggingface.co',
        'router.huggingface.co/hf-inference',
      )
    : rawModelUrlLiteral;

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
        Authorization: `Bearer ${rawApiTokenSecret.trim()}`,
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

    // 4. TRIAJE Y EVALUACIÓN SRE DE RESPUESTA (Delegación Atómica)
    return await TriageHuggingFaceResponse(
      incomingNetworkResponse,
      executionLatencyInMillisecondsQuantity,
      targetModelUrlLiteral,
      correlationIdentifier,
    );
  } catch (caughtExecutionError: unknown) {
    // 5. TRIAJE DE COLAPSO DE RED / TIMEOUT
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
      operationCodeLiteral: 'HF_ROUTER_NETWORK_COLLAPSE' as OperationCode,
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
