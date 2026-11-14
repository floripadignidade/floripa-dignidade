/**
 * @section AI Providers - Google Gemini Cognitive Inference Driver (Orchestrator)
 * @description Adaptador de red y transporte multi-modelo para Google Generative Language
 * API (`gemini-3.8-flash` / `gemini-3.5-flash-lite` / modelos v1beta). Compatible con
 * claves estándar restringidas (`AIza*`) y Auth Keys (`AQ.*`) de Google AI Studio.
 * Delega resolución de credenciales, serialización, timeout con `AbortController`,
 * triaje HTTP y normalización de errores en átomos dedicados bajo `TraceExecutionTime`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

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

import { type IInferenceResponse, InferenceResponseSchema } from '../schemas/Inference.schema';
import { BuildGeminiInferenceRequestPayload } from './atoms/BuildGeminiInferenceRequestPayload';
import { NormalizeGeminiNetworkError } from './atoms/NormalizeGeminiNetworkError';
import { ResolveGeminiDriverConfiguration } from './atoms/ResolveGeminiDriverConfiguration';
import { ResolveGeminiDriverDictionary } from './atoms/ResolveGeminiDriverDictionary';
import { TriageGeminiDriverResponse } from './atoms/TriageGeminiDriverResponse';
import {
  GoogleGeminiDriverOptionsSchema,
  type IGoogleGeminiDriverOptionsInput,
} from './schemas/GoogleGeminiInferenceDriver.schema';

const DRIVER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'GOOGLE_GEMINI_INFERENCE_DRIVER',
);

const INFERENCE_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_GEMINI_INFERENCE_TRANSACTION',
);

const INFERENCE_WARNING_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_INFERENCE_WARNING',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Ejecuta una consulta física de inferencia cognitiva contra Google Gemini API v1beta.
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Carga útil o prompt a procesar.
 * @param rawOptionsSnapshot - Opciones opcionales de modelo (`gemini-3.8-flash`), idioma y timeout.
 * @returns {Promise<IInferenceResponse>} Respuesta validada e inmutable bajo `InferenceResponseSchema`.
 */
export const ExecuteGoogleGeminiInference = async (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  rawOptionsSnapshot: IGoogleGeminiDriverOptionsInput = {},
): Promise<IInferenceResponse> => {
  const optionsValidationResult = GoogleGeminiDriverOptionsSchema.safeParse(rawOptionsSnapshot);
  const validatedOptions = optionsValidationResult.success
    ? optionsValidationResult.data
    : GoogleGeminiDriverOptionsSchema.parse({});

  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    validatedOptions.correlationIdentifier,
  );
  const dictionarySnapshot = ResolveGeminiDriverDictionary(validatedOptions.localeIdentifier);
  const configurationResolution = ResolveGeminiDriverConfiguration(validatedOptions);

  if (!configurationResolution.isConfiguredBoolean) {
    const isInvalidFormatBoolean =
      configurationResolution.errorCodeLiteral === 'INVALID_GOOGLE_GEMINI_API_KEY_FORMAT';

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
      operationCodeLiteral: INFERENCE_WARNING_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: dictionarySnapshot.telemetry.credentialsRejectedLiteral,
      semanticIntentTag: 'AI_INFERENCE_ABORTED',
      contextMetadataSnapshot: Object.freeze({
        errorCodeLiteral: configurationResolution.errorCodeLiteral,
        modelIdentifierLiteral: configurationResolution.modelIdentifierLiteral,
      }),
    });

    return Object.freeze(
      InferenceResponseSchema.parse({
        analysisId: correlationIdentifier,
        confidenceScore: 0,
        observation: isInvalidFormatBoolean
          ? dictionarySnapshot.observations.invalidKeyFormatLiteral
          : dictionarySnapshot.observations.missingCredentialsLiteral,
        suggestedAction: 'NONE',
        detectedAnomalies: [configurationResolution.errorCodeLiteral],
        metadata: Object.freeze({
          statusLiteral: 'UNCONFIGURED_CREDENTIALS',
          modelIdentifierLiteral: configurationResolution.modelIdentifierLiteral,
        }),
      }),
    );
  }

  return await TraceExecutionTime(
    DRIVER_MODULE_IDENTIFIER,
    INFERENCE_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IInferenceResponse> => {
      const executionStartTimestampNumeric = globalThis.performance.now();
      const abortControllerInstance = new AbortController();
      const timeoutHandleReference = setTimeout(
        () => abortControllerInstance.abort(),
        configurationResolution.timeoutInMillisecondsQuantity,
      );

      try {
        const { serializedBodyLiteral, promptLengthQuantity } = BuildGeminiInferenceRequestPayload(
          unvalidatedIntelligencePayloadSnapshot,
          configurationResolution,
          correlationIdentifier,
          validatedOptions.systemInstructionPromptLiteral,
        );

        const incomingNetworkResponse = await fetch(
          configurationResolution.targetEndpointUrlLiteral,
          {
            method: 'POST',
            headers: {
              'x-goog-api-key': configurationResolution.apiKeySecret,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-Correlation-Identifier': correlationIdentifier,
            },
            body: serializedBodyLiteral,
            signal: abortControllerInstance.signal,
          },
        );

        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return await TriageGeminiDriverResponse({
          incomingNetworkResponse,
          executionLatencyInMillisecondsQuantity,
          promptLengthQuantity,
          modelIdentifierLiteral: configurationResolution.modelIdentifierLiteral,
          targetEndpointUrlLiteral: configurationResolution.targetEndpointUrlLiteral,
          correlationIdentifier,
          moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
          dictionarySnapshot,
        });
      } catch (caughtExecutionError: unknown) {
        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return NormalizeGeminiNetworkError({
          caughtExecutionError,
          moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
          correlationIdentifier,
          executionLatencyInMillisecondsQuantity,
          targetEndpointUrlLiteral: configurationResolution.targetEndpointUrlLiteral,
          modelIdentifierLiteral: configurationResolution.modelIdentifierLiteral,
          dictionarySnapshot,
        });
      } finally {
        clearTimeout(timeoutHandleReference);
      }
    },
  );
};

/**
 * @name executeGoogleGeminiInference
 * @description Alias de compatibilidad histórica para consumidores en camelCase.
 * @deprecated Utilizar canónicamente `ExecuteGoogleGeminiInference` bajo la norma OEDP-V18.1.
 */
export const executeGoogleGeminiInference = ExecuteGoogleGeminiInference;
