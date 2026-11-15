/**
 * @file libs/engines/health-analysis/src/lib/providers/HuggingFaceInferenceDriver.ts
 * @section AI Providers - Hugging Face Router Multi-Model Inference Driver (Orchestrator)
 * @description Adaptador de red y transporte encargado de la comunicación física con los
 * modelos de inteligencia artificial alojados en el enrutador unificado de Hugging Face
 * (protocolo multi-modelo Chat Completions OpenAI-Compatible y Task API). Delega validación
 * de entorno/TLS, serialización segura, timeout con `AbortController`, triaje HTTP localizado
 * con contexto de modelo/protocolo y normalización forense de fallos en átomos dedicados bajo
 * `TraceExecutionTime`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
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

import type { IInferenceResponse } from '../schemas/Inference.schema';
import { BuildHuggingFaceFallbackResponse } from './atoms/BuildHuggingFaceFallbackResponse';
import { BuildHuggingFaceInferenceRequestPayload } from './atoms/BuildHuggingFaceInferenceRequestPayload';
import { NormalizeHuggingFaceNetworkError } from './atoms/NormalizeHuggingFaceNetworkError';
import { ResolveHuggingFaceDriverConfiguration } from './atoms/ResolveHuggingFaceDriverConfiguration';
import { ResolveHuggingFaceDriverDictionary } from './atoms/ResolveHuggingFaceDriverDictionary';
import { TriageHuggingFaceResponse } from './atoms/TriageHuggingFaceResponse';
import {
  HuggingFaceDriverOptionsSchema,
  type IHuggingFaceDriverOptions,
  type IHuggingFaceDriverOptionsInput,
  type IHuggingFaceUnconfiguredState,
  type THuggingFaceConfigurationErrorCode,
} from './schemas/HuggingFaceInferenceDriver.schema';

const DRIVER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'HUGGING_FACE_ROUTER_INFERENCE_DRIVER',
);

const INFERENCE_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_HUGGING_FACE_INFERENCE_TRANSACTION',
);

const CREDENTIALS_MISSING_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_CREDENTIALS_MISSING',
);

const INVALID_OPTIONS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_DRIVER_OPTIONS_FALLBACK',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const selectConfigurationObservationLiteral = (
  errorCodeLiteral: THuggingFaceConfigurationErrorCode,
  observationsDictionary: ReturnType<typeof ResolveHuggingFaceDriverDictionary>['observations'],
): string => {
  if (errorCodeLiteral === 'INVALID_HUGGING_FACE_TOKEN_FORMAT') {
    return observationsDictionary.invalidTokenFormatLiteral;
  }
  if (errorCodeLiteral === 'NON_HTTPS_ENDPOINT_PROHIBITED') {
    return observationsDictionary.invalidEndpointProtocolLiteral;
  }
  return observationsDictionary.missingCredentialsLiteral;
};

const resolveValidatedDriverOptions = (
  rawOptionsSnapshot: IHuggingFaceDriverOptionsInput,
): {
  readonly validatedOptions: IHuggingFaceDriverOptions;
  readonly correlationIdentifier: CorrelationIdentifier;
} => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    rawOptionsSnapshot.correlationIdentifier,
  );
  const optionsValidationResult = HuggingFaceDriverOptionsSchema.safeParse(rawOptionsSnapshot);

  if (optionsValidationResult.success) {
    return Object.freeze({
      validatedOptions: optionsValidationResult.data,
      correlationIdentifier,
    });
  }

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
    operationCodeLiteral: INVALID_OPTIONS_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral:
      'Opciones de invocación inválidas en Hugging Face Driver; aplicando valores por defecto.',
    semanticIntentTag: 'AI_DRIVER_OPTIONS_VALIDATION_WARNING',
    contextMetadataSnapshot: Object.freeze({
      validationIssuesCollection: optionsValidationResult.error.flatten(),
    }),
  });

  return Object.freeze({
    validatedOptions: HuggingFaceDriverOptionsSchema.parse({}),
    correlationIdentifier,
  });
};

const handleUnconfiguredDriverState = (
  unconfiguredState: IHuggingFaceUnconfiguredState,
  dictionarySnapshot: ReturnType<typeof ResolveHuggingFaceDriverDictionary>,
  correlationIdentifier: CorrelationIdentifier,
): IInferenceResponse => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
    operationCodeLiteral: CREDENTIALS_MISSING_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: dictionarySnapshot.telemetry.credentialsRejectedLiteral,
    semanticIntentTag: 'AI_INFERENCE_ABORTED',
    contextMetadataSnapshot: Object.freeze({
      errorCodeLiteral: unconfiguredState.errorCodeLiteral,
      targetEndpointUrlLiteral: unconfiguredState.targetEndpointUrlLiteral,
      modelIdentifierLiteral: unconfiguredState.modelIdentifierLiteral,
    }),
  });

  return BuildHuggingFaceFallbackResponse({
    correlationIdentifier,
    observationLiteral: selectConfigurationObservationLiteral(
      unconfiguredState.errorCodeLiteral,
      dictionarySnapshot.observations,
    ),
    suggestedActionLiteral: 'NONE',
    detectedAnomaliesCollection: [unconfiguredState.errorCodeLiteral],
    metadataSnapshot: {
      statusLiteral: 'UNCONFIGURED_CREDENTIALS',
      errorCodeLiteral: unconfiguredState.errorCodeLiteral,
      modelIdentifierLiteral: unconfiguredState.modelIdentifierLiteral,
    },
  });
};

/**
 * Ejecuta una consulta física de inferencia cognitiva contra Hugging Face Router.
 * Compatible de forma retroactiva con `TInferenceDriverAction` y extensible mediante
 * opciones multi-modelo (`preferredModelIdentifier`, `inferenceProtocolLiteral`, `localeIdentifier`).
 *
 * @param unvalidatedIntelligencePayloadSnapshot - Prompt o snapshot de contexto a analizar.
 * @param rawOptionsSnapshot - Opciones opcionales de selección de modelo, protocolo, idioma y timeout.
 * @returns {Promise<IInferenceResponse>} Respuesta estructurada y sellada contra `InferenceResponseSchema`.
 */
export const ExecuteHuggingFaceInference = async (
  unvalidatedIntelligencePayloadSnapshot: unknown,
  rawOptionsSnapshot: IHuggingFaceDriverOptionsInput = {},
): Promise<IInferenceResponse> => {
  const { validatedOptions, correlationIdentifier } =
    resolveValidatedDriverOptions(rawOptionsSnapshot);
  const dictionarySnapshot = ResolveHuggingFaceDriverDictionary(validatedOptions.localeIdentifier);

  return await TraceExecutionTime(
    DRIVER_MODULE_IDENTIFIER,
    INFERENCE_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IInferenceResponse> => {
      const configurationResolution = ResolveHuggingFaceDriverConfiguration(validatedOptions);

      if (!configurationResolution.isConfiguredBoolean) {
        return handleUnconfiguredDriverState(
          configurationResolution,
          dictionarySnapshot,
          correlationIdentifier,
        );
      }

      const executionStartTimestampNumeric = globalThis.performance.now();
      const abortControllerInstance = new AbortController();
      const timeoutHandleReference = setTimeout(
        () => abortControllerInstance.abort(),
        configurationResolution.timeoutInMillisecondsQuantity,
      );

      try {
        const serializedPayloadLiteral = BuildHuggingFaceInferenceRequestPayload(
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
              Authorization: `Bearer ${configurationResolution.apiTokenSecret}`,
              'Content-Type': 'application/json',
              Accept: 'application/json',
              'X-Correlation-Identifier': correlationIdentifier,
            },
            body: serializedPayloadLiteral,
            signal: abortControllerInstance.signal,
          },
        );

        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return await TriageHuggingFaceResponse(
          incomingNetworkResponse,
          executionLatencyInMillisecondsQuantity,
          configurationResolution.targetEndpointUrlLiteral,
          correlationIdentifier,
          {
            localeIdentifier: validatedOptions.localeIdentifier,
            modelIdentifierLiteral: configurationResolution.modelIdentifierLiteral,
            inferenceProtocolLiteral: configurationResolution.inferenceProtocolLiteral,
          },
        );
      } catch (caughtExecutionError: unknown) {
        const executionLatencyInMillisecondsQuantity = Math.max(
          0,
          Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
        );

        return NormalizeHuggingFaceNetworkError({
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
 * @name executeHuggingFaceInference
 * @description Alias de compatibilidad histórica para consumidores en camelCase.
 * @deprecated Utilizar canónicamente `ExecuteHuggingFaceInference` bajo la norma OEDP-V18.1.
 */
export const executeHuggingFaceInference = ExecuteHuggingFaceInference;
