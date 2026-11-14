/**
 * @section AI Providers - Hugging Face HTTP Error Status Classifier (Atom)
 * @description Átomo encargado de clasificar códigos de estado HTTP no exitosos de
 * Hugging Face Router (`503` Cold Start, `401/403` Auth, `429` Rate Limit, `400/404/422`
 * Modelo no soportado o petición inválida, `5xx` Fallo servidor), registrar evidencia mediante
 * `MapHttpErrorToException` + `ReportForensicException`, emitir telemetría SRE conforme a
 * `TelemetrySignalSchema` y sellar la respuesta degradada contra `InferenceResponseSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

import type { IHuggingFaceTriageI18n } from '../../i18n/schemas/HuggingFaceTriage.i18n.schema';
import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';

/**
 * @interface IClassifyHuggingFaceHttpErrorParameters
 * @description Parámetros inmutables requeridos para clasificar y reportar un error HTTP.
 */
export interface IClassifyHuggingFaceHttpErrorParameters {
  readonly httpStatusCodeNumeric: number;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly targetModelUrlLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly dictionarySnapshot: IHuggingFaceTriageI18n;
  readonly diagnosticDetailLiteral: string | undefined;
  readonly estimatedTimeSecondsNumeric: number | undefined;
  readonly modelIdentifierLiteral: string | undefined;
}

interface IHttpErrorTriageSpecification {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly observationLiteral: string;
  readonly suggestedActionLiteral: IInferenceResponse['suggestedAction'];
  readonly semanticAnomalyCodeLiteral: string;
}

const COLD_START_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_COLD_START',
);

const AUTH_REJECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_AUTH_REJECTED',
);

const RATE_LIMITED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_RATE_LIMITED',
);

const MODEL_UNSUPPORTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_MODEL_UNSUPPORTED',
);

const GENERIC_HTTP_ERROR_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_HTTP_ERROR',
);

const resolveErrorSpecification = (
  httpStatusCodeNumeric: number,
  observationsDictionary: IHuggingFaceTriageI18n['observations'],
): IHttpErrorTriageSpecification => {
  if (httpStatusCodeNumeric === 503) {
    return {
      severityLevelLiteral: 'WARNING',
      operationCodeLiteral: COLD_START_OPERATION_CODE,
      observationLiteral: observationsDictionary.coldStartLoadingLiteral,
      suggestedActionLiteral: 'NONE',
      semanticAnomalyCodeLiteral: 'HUGGING_FACE_COLD_START_LOADING',
    };
  }

  if (httpStatusCodeNumeric === 401 || httpStatusCodeNumeric === 403) {
    return {
      severityLevelLiteral: 'CRITICAL',
      operationCodeLiteral: AUTH_REJECTED_OPERATION_CODE,
      observationLiteral: observationsDictionary.authenticationRejectedLiteral,
      suggestedActionLiteral: 'RESTART_MODULE',
      semanticAnomalyCodeLiteral: 'HUGGING_FACE_AUTHENTICATION_REJECTED',
    };
  }

  if (httpStatusCodeNumeric === 429) {
    return {
      severityLevelLiteral: 'WARNING',
      operationCodeLiteral: RATE_LIMITED_OPERATION_CODE,
      observationLiteral: observationsDictionary.rateLimitExceededLiteral,
      suggestedActionLiteral: 'NONE',
      semanticAnomalyCodeLiteral: 'HUGGING_FACE_RATE_LIMIT_EXCEEDED',
    };
  }

  if (
    httpStatusCodeNumeric === 400 ||
    httpStatusCodeNumeric === 404 ||
    httpStatusCodeNumeric === 422
  ) {
    return {
      severityLevelLiteral: 'CRITICAL',
      operationCodeLiteral: MODEL_UNSUPPORTED_OPERATION_CODE,
      observationLiteral: observationsDictionary.modelUnsupportedOrInvalidLiteral,
      suggestedActionLiteral: 'CODE_REFACTOR_REQUIRED',
      semanticAnomalyCodeLiteral: 'HUGGING_FACE_MODEL_OR_REQUEST_UNSUPPORTED',
    };
  }

  return {
    severityLevelLiteral: 'CRITICAL',
    operationCodeLiteral: GENERIC_HTTP_ERROR_OPERATION_CODE,
    observationLiteral: `${observationsDictionary.unexpectedHttpErrorLiteral} (HTTP ${httpStatusCodeNumeric})`,
    suggestedActionLiteral: 'RESTART_MODULE',
    semanticAnomalyCodeLiteral: 'HUGGING_FACE_UNEXPECTED_HTTP_ERROR',
  };
};

/**
 * Clasifica la respuesta de error HTTP, registra trazabilidad forense y construye respuesta segura.
 *
 * @param parametersSnapshot - Código HTTP, latencia, detalles diagnósticos y diccionario localizado.
 * @returns {IInferenceResponse} Respuesta degradada validada contra `InferenceResponseSchema`.
 */
export const ClassifyHuggingFaceHttpErrorStatus = (
  parametersSnapshot: IClassifyHuggingFaceHttpErrorParameters,
): IInferenceResponse => {
  const {
    httpStatusCodeNumeric,
    executionLatencyInMillisecondsQuantity,
    targetModelUrlLiteral,
    correlationIdentifier,
    moduleIdentifierLiteral,
    dictionarySnapshot,
    diagnosticDetailLiteral,
    estimatedTimeSecondsNumeric,
    modelIdentifierLiteral,
  } = parametersSnapshot;

  const errorSpecification = resolveErrorSpecification(
    httpStatusCodeNumeric,
    dictionarySnapshot.observations,
  );

  const mappedException = MapHttpErrorToException(
    httpStatusCodeNumeric,
    errorSpecification.semanticAnomalyCodeLiteral,
    {
      targetModelUrlLiteral,
      ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
      ...(diagnosticDetailLiteral !== undefined && { diagnosticDetailLiteral }),
    },
  );

  ReportForensicException(mappedException, correlationIdentifier);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: errorSpecification.severityLevelLiteral,
    moduleIdentifierLiteral,
    operationCodeLiteral: errorSpecification.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: errorSpecification.observationLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_FAILURE',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric,
      targetModelUrlLiteral,
      ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
      ...(diagnosticDetailLiteral !== undefined && { diagnosticDetailLiteral }),
      ...(estimatedTimeSecondsNumeric !== undefined && { estimatedTimeSecondsNumeric }),
    }),
  });

  const validatedResponse = InferenceResponseSchema.parse({
    analysisId: correlationIdentifier,
    confidenceScore: 0,
    observation: errorSpecification.observationLiteral,
    suggestedAction: errorSpecification.suggestedActionLiteral,
    detectedAnomalies: [
      `HTTP_STATUS_${httpStatusCodeNumeric}`,
      errorSpecification.semanticAnomalyCodeLiteral,
    ],
    metadata: Object.freeze({
      isFaultyBoolean: true,
      httpStatusCodeNumeric,
      targetModelUrlLiteral,
      ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
      ...(diagnosticDetailLiteral !== undefined && { diagnosticDetailLiteral }),
      ...(estimatedTimeSecondsNumeric !== undefined && { estimatedTimeSecondsNumeric }),
    }),
  });

  return Object.freeze(validatedResponse);
};
