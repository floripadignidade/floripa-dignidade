/**
 * @section Tools & Infrastructure - Hugging Face Router Cognitive Probe (Atom)
 * @description Sonda de conectividad y autenticación de red para el enrutador
 * serverless de Hugging Face ('router.huggingface.co/hf-inference'). Realiza una
 * inferencia mínima autenticada para auditar el token 'HUGGING_FACE_API_TOKEN'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO: Complejidad ciclomática reducida a 3 mediante resolución atómica de estatus.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import type {
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../schemas/CloudInfrastructureAuditReport.schema';

const PROBE_MODULE_IDENTIFIER = 'HUGGING_FACE_PROBE_ATOM' as ModuleIdentifier;

const CANONICAL_ROUTER_MODEL_URL_LITERAL =
  'https://router.huggingface.co/hf-inference/models/microsoft/Phi-3-mini-4k-instruct';
const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 8000;

/**
 * Resuelve el estatus categórico y diagnóstico semántico a partir del código HTTP de Hugging Face.
 */
const resolveHuggingFaceErrorStatus = (
  statusCodeNumeric: number,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
} => {
  if (statusCodeNumeric === 503) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral:
        'El modelo cognitivo está cargando en memoria (Cold Start 503). Reintento sugerido.',
    };
  }

  const isAuthenticationRejectedBoolean = statusCodeNumeric === 401 || statusCodeNumeric === 403;

  if (isAuthenticationRejectedBoolean) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Hugging Face Router rechazó la autenticación (HTTP ${statusCodeNumeric}): HUGGING_FACE_API_TOKEN inválido.`,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `Hugging Face Router respondió con código de error HTTP ${statusCodeNumeric}.`,
  };
};

/**
 * Extrae la descripción legible de una excepción capturada.
 */
const extractExecutionErrorMessageLiteral = (caughtExecutionError: unknown): string => {
  return caughtExecutionError instanceof Error
    ? caughtExecutionError.message
    : String(caughtExecutionError);
};

/**
 * Audita activamente el token y disponibilidad del enrutador de Hugging Face.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para la traza forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la sonda.
 */
export const AuditHuggingFaceCognitiveProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawApiTokenSecret = environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'];
  const rawModelUrlLiteral =
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_URL'] ?? CANONICAL_ROUTER_MODEL_URL_LITERAL;

  if (!rawApiTokenSecret || rawApiTokenSecret.trim() === '') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'HF_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Hugging Face omitida: HUGGING_FACE_API_TOKEN no configurado.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'La variable de entorno HUGGING_FACE_API_TOKEN no está configurada.',
      endpointTargetLiteral: rawModelUrlLiteral,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_HUGGING_FACE_API_TOKEN',
    });
  }

  const executionStartTimestampNumeric = performance.now();

  try {
    const incomingNetworkResponse = await fetch(rawModelUrlLiteral.trim(), {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${rawApiTokenSecret.trim()}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify({ inputs: 'ping' }),
      signal: AbortSignal.timeout(MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    if (incomingNetworkResponse.ok) {
      return Object.freeze({
        providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
        probeStatusLiteral: 'NOMINAL_OPERATIONAL',
        executionLatencyInMillisecondsQuantity,
        statusDescriptionLiteral: 'Hugging Face Router plenamente operativo y autenticado.',
        endpointTargetLiteral: rawModelUrlLiteral,
        hasValidSecretFormatBoolean: true,
      });
    }

    const { probeStatusLiteral, statusDescriptionLiteral } = resolveHuggingFaceErrorStatus(
      incomingNetworkResponse.status,
    );

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral: rawModelUrlLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}`,
    });
  } catch (caughtExecutionError: unknown) {
    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );
    const errorDescriptionLiteral = extractExecutionErrorMessageLiteral(caughtExecutionError);

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de conectar con Hugging Face Router: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: rawModelUrlLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
