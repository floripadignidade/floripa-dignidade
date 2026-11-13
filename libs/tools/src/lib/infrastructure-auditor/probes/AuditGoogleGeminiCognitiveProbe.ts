/**
 * @section Tools & Infrastructure - Google Gemini AI Cognitive Probe (Orchestrator)
 * @description Sonda de conectividad y autenticación de red encargada de auditar
 * físicamente la clave de API oficial de Google AI Studio ('GOOGLE_GEMINI_API_KEY').
 * Orquesta la verificación de pre-vuelo de credenciales, el ping REST ultraliviano (1 token)
 * contra 'gemini-1.5-flash:generateContent' y la delegación del triaje SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO Zenith:
 * 1. Erradicación de TS2307 eliminando la importación fantasma './atoms/AuditGeminiPreflightCredentials.js'.
 * 2. Integración inline del pre-vuelo de credenciales en alineación simétrica con las demás sondas SRE.
 * 3. Purga de extensiones sintéticas '.js' a favor de Rutas Limpias (Extensionless) para Turbopack.
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

/* 2. Contratos Centralizados de Auditoría (Clean Paths - Extensionless) */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';

/* 3. Enjambre Atómico Local (Clean Paths - Extensionless) */
import { TriageGeminiProbeResponse } from './atoms/TriageGeminiProbeResponse';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PROBE_MODULE_IDENTIFIER = 'GOOGLE_GEMINI_COGNITIVE_PROBE_ATOM' as ModuleIdentifier;

/**
 * @constant MAXIMUM_GEMINI_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Límite estricto de espera de red (SRE) para evitar bloqueos en el pipeline de auditoría.
 */
const MAXIMUM_GEMINI_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * @constant GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL
 * Endpoint oficial de Google Generative Language API para inferencia ligera con Gemini 1.5 Flash.
 */
const GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL =
  'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Audita activamente la autenticación y disponibilidad física de Google Gemini AI Studio.
 * Despacha un ping autenticado mediante la cabecera segura 'x-goog-api-key' y mide la latencia física.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la API de Google Gemini.
 */
export const AuditGoogleGeminiCognitiveProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawGeminiApiKeySecret = environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'];

  // 1. AUDITORÍA PRE-VUELO DE CREDENCIALES (Simetría SRE)
  if (!rawGeminiApiKeySecret || rawGeminiApiKeySecret.trim() === '') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'GEMINI_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Google Gemini omitida: GOOGLE_GEMINI_API_KEY no configurado en el entorno.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La variable de entorno GOOGLE_GEMINI_API_KEY no está configurada.',
      endpointTargetLiteral: GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_GOOGLE_GEMINI_API_KEY',
    });
  }

  const sanitizedApiKeySecret = rawGeminiApiKeySecret.trim();
  const executionStartTimestampNumeric = performance.now();

  try {
    // 2. DESPACHO DE CONSULTA DE PING ULTRA-LIVIANA (1 Token Max)
    const incomingNetworkResponse = await fetch(GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL, {
      method: 'POST',
      headers: {
        'x-goog-api-key': sanitizedApiKeySecret,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: 'ping' }] }],
        generationConfig: { maxOutputTokens: 1 },
      }),
      signal: AbortSignal.timeout(MAXIMUM_GEMINI_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    // 3. TRIAJE Y EVALUACIÓN SRE DE RESPUESTA (Delegación Atómica)
    return TriageGeminiProbeResponse(
      incomingNetworkResponse,
      executionLatencyInMillisecondsQuantity,
      GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL,
      correlationIdentifier,
    );
  } catch (caughtExecutionError: unknown) {
    // 4. TRIAJE DE COLAPSO DE RED / TIMEOUT
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
      operationCodeLiteral: 'GEMINI_PROBE_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con Google Gemini: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetEndpointLiteral: GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL,
      },
    });

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de alcanzar Google Generative Language API: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: GEMINI_CANONICAL_REST_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
