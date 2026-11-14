/**
 * @section AI Providers - Google Gemini Network Error Normalizer (Atom)
 * @description Clasifica fallos de transporte, serialización o timeout (HTTP 504) al
 * conectar con Google Gemini API, registra evidencia con `ReportForensicException`, emite
 * telemetría SRE y retorna una respuesta degradada validada contra `InferenceResponseSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import type { IGeminiDriverI18n } from '../../i18n/schemas/GeminiDriver.i18n.schema';
import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';

const NETWORK_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_INFERENCE_COLLAPSE',
);

export interface INormalizeGeminiNetworkErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly targetEndpointUrlLiteral: string;
  readonly modelIdentifierLiteral: string;
  readonly dictionarySnapshot: IGeminiDriverI18n;
}

const isTimeoutOrAbortErrorBoolean = (caughtExecutionError: unknown): boolean =>
  caughtExecutionError instanceof Error &&
  (caughtExecutionError.name === 'AbortError' || caughtExecutionError.name === 'TimeoutError');

const resolveDomainException = (
  caughtExecutionError: unknown,
  isTimeoutErrorBoolean: boolean,
  targetEndpointUrlLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) {
    return caughtExecutionError;
  }

  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  return MapHttpErrorToException(
    isTimeoutErrorBoolean ? 504 : 500,
    isTimeoutErrorBoolean ? 'GEMINI_API_TIMEOUT' : 'GEMINI_API_COMMUNICATION_FAULT',
    {
      originalErrorLiteral: errorDescriptionLiteral,
      targetEndpointUrlLiteral,
      correlationIdentifier,
    },
  );
};

/**
 * Normaliza el error capturado, reporta evidencia forense y sella la respuesta degradada.
 */
export const NormalizeGeminiNetworkError = (
  parametersSnapshot: INormalizeGeminiNetworkErrorParameters,
): IInferenceResponse => {
  const {
    caughtExecutionError,
    moduleIdentifierLiteral,
    correlationIdentifier,
    executionLatencyInMillisecondsQuantity,
    targetEndpointUrlLiteral,
    modelIdentifierLiteral,
    dictionarySnapshot,
  } = parametersSnapshot;

  const isTimeoutErrorBoolean = isTimeoutOrAbortErrorBoolean(caughtExecutionError);
  const normalizedException = resolveDomainException(
    caughtExecutionError,
    isTimeoutErrorBoolean,
    targetEndpointUrlLiteral,
    correlationIdentifier,
  );

  ReportForensicException(normalizedException, correlationIdentifier);

  const isValidationFailureBoolean = normalizedException instanceof ValidationException;
  const observationPrefixLiteral = isTimeoutErrorBoolean
    ? dictionarySnapshot.observations.networkTimeoutLiteral
    : dictionarySnapshot.observations.networkFailureLiteral;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isValidationFailureBoolean ? 'WARNING' : 'CRITICAL',
    moduleIdentifierLiteral,
    operationCodeLiteral: NETWORK_COLLAPSE_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `${dictionarySnapshot.telemetry.networkCollapseLiteral} (${normalizedException.message})`,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_NETWORK_COLLAPSE',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
      operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
      modelIdentifierLiteral,
      isTimeoutErrorBoolean,
    }),
  });

  return Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: `${observationPrefixLiteral} (${normalizedException.message})`,
      suggestedAction: isValidationFailureBoolean ? 'NONE' : 'RESTART_MODULE',
      detectedAnomalies: [normalizedException.operationalErrorCodeLiteral],
      metadata: Object.freeze({
        isFaultyBoolean: true,
        providerIdentifierLiteral: 'GOOGLE_GEMINI',
        modelIdentifierLiteral,
        httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
        errorDescriptionLiteral: normalizedException.message,
      }),
    }),
  );
};
