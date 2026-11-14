/**
 * @section AI Providers - Hugging Face Network Error Normalizer (Atom)
 * @description Átomo encargado de clasificar fallos ocurridos durante la invocación a
 * Hugging Face Router (validación, timeout HTTP 504 o colapso de red HTTP 500), emitir
 * reporte forense mediante `ReportForensicException`, despachar señal crítica conforme
 * a `TelemetrySignalSchema` y retornar un `IInferenceResponse` degradado y certificado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Observabilidad).
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

import type { IHuggingFaceDriverI18n } from '../../i18n/schemas/HuggingFaceDriver.i18n.schema';
import type { IInferenceResponse } from '../../schemas/Inference.schema';
import { BuildHuggingFaceFallbackResponse } from './BuildHuggingFaceFallbackResponse';

const NETWORK_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_NETWORK_COLLAPSE',
);

/**
 * @interface INormalizeHuggingFaceNetworkErrorParameters
 * @description Contexto inmutable requerido para normalizar y reportar un fallo de red/payload.
 */
export interface INormalizeHuggingFaceNetworkErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly targetEndpointUrlLiteral: string;
  readonly modelIdentifierLiteral: string;
  readonly dictionarySnapshot: IHuggingFaceDriverI18n;
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
    isTimeoutErrorBoolean
      ? 'HUGGING_FACE_ROUTER_TIMEOUT'
      : 'HUGGING_FACE_ROUTER_COMMUNICATION_FAULT',
    {
      originalErrorLiteral: errorDescriptionLiteral,
      targetEndpointUrlLiteral,
      correlationIdentifier,
    },
  );
};

/**
 * Normaliza la falla, registra trazabilidad forense SRE y genera respuesta degradada segura.
 *
 * @param parametersSnapshot - Error capturado, latencia, coordenadas y diccionario localizado.
 * @returns {IInferenceResponse} Respuesta degradada certificada contra `InferenceResponseSchema`.
 */
export const NormalizeHuggingFaceNetworkError = (
  parametersSnapshot: INormalizeHuggingFaceNetworkErrorParameters,
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
      targetEndpointUrlLiteral,
      modelIdentifierLiteral,
      isTimeoutErrorBoolean,
    }),
  });

  return BuildHuggingFaceFallbackResponse({
    correlationIdentifier,
    observationLiteral: `${observationPrefixLiteral} (${normalizedException.message})`,
    suggestedActionLiteral: isValidationFailureBoolean ? 'NONE' : 'RESTART_MODULE',
    detectedAnomaliesCollection: [normalizedException.operationalErrorCodeLiteral],
    metadataSnapshot: {
      isFaultyBoolean: true,
      httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
      modelIdentifierLiteral,
      errorDescriptionLiteral: normalizedException.message,
    },
  });
};
