/**
 * @section Tools & Infrastructure - Google Gemini AI Cognitive Probe (Orchestrator)
 * @description Sonda de conectividad y autenticación de red encargada de auditar físicamente
 * la clave de API oficial de Google AI Studio (`GOOGLE_GEMINI_API_KEY`) y la disponibilidad
 * del modelo vigente (`gemini-3.8-flash` o `GOOGLE_GEMINI_MODEL_ID`). Despacha una consulta
 * REST ultraliviana (1 token max) con `TraceExecutionTime`, contiene errores de red con
 * `AbortSignal.timeout` y delega la clasificación SRE en `TriageGeminiProbeResponse`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';
import { TriageGeminiProbeResponse } from './atoms/TriageGeminiProbeResponse';

const PROBE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'GOOGLE_GEMINI_COGNITIVE_PROBE_ATOM',
);

const PROBE_EXECUTION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_GEMINI_INFRASTRUCTURE_PROBE',
);

const CREDENTIALS_MISSING_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_PROBE_CREDENTIALS_MISSING',
);

const NETWORK_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_PROBE_NETWORK_COLLAPSE',
);

const CANONICAL_GEMINI_API_BASE_URL_LITERAL =
  'https://generativelanguage.googleapis.com/v1beta/models';
const CANONICAL_GEMINI_DEFAULT_MODEL_LITERAL = 'gemini-3.8-flash';
const MAXIMUM_GEMINI_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const resolveTargetGeminiEndpointLiteral = (
  environmentSnapshot: Readonly<Record<string, string | undefined>>,
): { readonly endpointUrlLiteral: string; readonly modelIdentifierLiteral: string } => {
  const configuredModelIdCandidate = environmentSnapshot['GOOGLE_GEMINI_MODEL_ID']?.trim();
  const modelIdentifierLiteral =
    configuredModelIdCandidate && configuredModelIdCandidate.length > 0
      ? configuredModelIdCandidate
      : CANONICAL_GEMINI_DEFAULT_MODEL_LITERAL;

  const endpointUrlLiteral = `${CANONICAL_GEMINI_API_BASE_URL_LITERAL}/${modelIdentifierLiteral}:generateContent`;

  return Object.freeze({
    endpointUrlLiteral,
    modelIdentifierLiteral,
  });
};

/**
 * Audita activamente la autenticación y disponibilidad física de Google Gemini API.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la API de Google Gemini.
 */
export const AuditGoogleGeminiCognitiveProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawGeminiApiKeySecret = environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'];

  const { endpointUrlLiteral: targetEndpointUrlLiteral, modelIdentifierLiteral } =
    resolveTargetGeminiEndpointLiteral(environmentMetadataSnapshot);

  if (!rawGeminiApiKeySecret || rawGeminiApiKeySecret.trim() === '') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: CREDENTIALS_MISSING_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Google Gemini omitida: GOOGLE_GEMINI_API_KEY no configurado en el entorno.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
      contextMetadataSnapshot: Object.freeze({
        targetEndpointUrlLiteral,
        modelIdentifierLiteral,
      }),
    });

    return Object.freeze({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La variable de entorno GOOGLE_GEMINI_API_KEY no está configurada.',
      endpointTargetLiteral: targetEndpointUrlLiteral,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_GOOGLE_GEMINI_API_KEY',
    });
  }

  const sanitizedApiKeySecret = rawGeminiApiKeySecret.trim();

  return await TraceExecutionTime(
    PROBE_MODULE_IDENTIFIER,
    PROBE_EXECUTION_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IIndividualProviderAuditSnapshot> => {
      const executionStartTimestampNumeric = globalThis.performance.now();

      try {
        const incomingNetworkResponse = await fetch(targetEndpointUrlLiteral, {
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

        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return TriageGeminiProbeResponse(
          incomingNetworkResponse,
          executionLatencyInMillisecondsQuantity,
          targetEndpointUrlLiteral,
          correlationIdentifier,
        );
      } catch (caughtExecutionError: unknown) {
        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
          operationCodeLiteral: NETWORK_COLLAPSE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: `Fallo de red al conectar con Google Gemini: ${errorDescriptionLiteral}`,
          executionLatencyInMillisecondsQuantity,
          semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
          contextMetadataSnapshot: Object.freeze({
            errorDescriptionLiteral,
            targetEndpointUrlLiteral,
            modelIdentifierLiteral,
          }),
        });

        return Object.freeze({
          providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
          probeStatusLiteral: 'UNREACHABLE_FAILURE',
          executionLatencyInMillisecondsQuantity,
          statusDescriptionLiteral: `Incapaz de alcanzar Google Generative Language API (${modelIdentifierLiteral}): ${errorDescriptionLiteral}`,
          endpointTargetLiteral: targetEndpointUrlLiteral,
          hasValidSecretFormatBoolean: true,
          diagnosticErrorLiteral: errorDescriptionLiteral,
        });
      }
    },
  );
};
