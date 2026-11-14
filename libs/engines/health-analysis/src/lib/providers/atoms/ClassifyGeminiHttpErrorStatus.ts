/**
 * @section AI Providers - Google Gemini HTTP Error Status Classifier (Atom)
 * @description Átomo encargado de clasificar códigos de error HTTP de Google Gemini API
 * (`400/401/403` Auth, `404` Modelo retirado, `429` Cuota excedida, `5xx` Servidor),
 * registrar evidencia mediante `MapHttpErrorToException` + `ReportForensicException`,
 * emitir telemetría SRE conforme a `TelemetrySignalSchema` y sellar la respuesta degradada.
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

import type { IGeminiDriverI18n } from '../../i18n/schemas/GeminiDriver.i18n.schema';
import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';

const INFERENCE_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_INFERENCE_HTTP_ERROR',
);

const MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY = 256;

export interface IClassifyGeminiHttpErrorParameters {
  readonly incomingNetworkResponse: Response;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly modelIdentifierLiteral: string;
  readonly targetEndpointUrlLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly dictionarySnapshot: IGeminiDriverI18n;
}

interface IHttpErrorSpecification {
  readonly severityLevelLiteral: SeverityLevel;
  readonly observationLiteral: string;
  readonly suggestedActionLiteral: IInferenceResponse['suggestedAction'];
}

const resolveErrorSpecification = (
  httpStatusCodeNumeric: number,
  observationsDictionary: IGeminiDriverI18n['observations'],
): IHttpErrorSpecification => {
  if (httpStatusCodeNumeric === 429) {
    return {
      severityLevelLiteral: 'WARNING',
      observationLiteral: observationsDictionary.rateLimitExceededLiteral,
      suggestedActionLiteral: 'NONE',
    };
  }
  if (httpStatusCodeNumeric === 404) {
    return {
      severityLevelLiteral: 'CRITICAL',
      observationLiteral: observationsDictionary.modelUnavailableLiteral,
      suggestedActionLiteral: 'CODE_REFACTOR_REQUIRED',
    };
  }
  if (
    httpStatusCodeNumeric === 400 ||
    httpStatusCodeNumeric === 401 ||
    httpStatusCodeNumeric === 403
  ) {
    return {
      severityLevelLiteral: 'CRITICAL',
      observationLiteral: observationsDictionary.authenticationRejectedLiteral,
      suggestedActionLiteral: 'RESTART_MODULE',
    };
  }
  return {
    severityLevelLiteral: 'CRITICAL',
    observationLiteral: `${observationsDictionary.unexpectedHttpErrorLiteral} (HTTP ${httpStatusCodeNumeric})`,
    suggestedActionLiteral: 'RESTART_MODULE',
  };
};

/**
 * Clasifica la respuesta de error HTTP, reporta evidencia forense y construye respuesta degradada.
 *
 * @param parametersSnapshot - Respuesta HTTP, latencia, modelo y diccionario localizado.
 * @returns {Promise<IInferenceResponse>} Respuesta degradada validada contra `InferenceResponseSchema`.
 */
export const ClassifyGeminiHttpErrorStatus = async (
  parametersSnapshot: IClassifyGeminiHttpErrorParameters,
): Promise<IInferenceResponse> => {
  const {
    incomingNetworkResponse,
    executionLatencyInMillisecondsQuantity,
    modelIdentifierLiteral,
    targetEndpointUrlLiteral,
    correlationIdentifier,
    moduleIdentifierLiteral,
    dictionarySnapshot,
  } = parametersSnapshot;

  const httpStatusCodeNumeric = incomingNetworkResponse.status;
  const rawErrorTextLiteral = await incomingNetworkResponse
    .text()
    .then((textLiteral) => textLiteral.slice(0, MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY))
    .catch(() => '');

  const errorSpecification = resolveErrorSpecification(
    httpStatusCodeNumeric,
    dictionarySnapshot.observations,
  );

  const mappedException = MapHttpErrorToException(
    httpStatusCodeNumeric,
    `GEMINI_API_HTTP_${httpStatusCodeNumeric}`,
    {
      modelIdentifierLiteral,
      targetEndpointUrlLiteral,
      ...(rawErrorTextLiteral.length > 0 && { rawErrorTextLiteral }),
    },
  );

  ReportForensicException(mappedException, correlationIdentifier);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: errorSpecification.severityLevelLiteral,
    moduleIdentifierLiteral,
    operationCodeLiteral: INFERENCE_FAILURE_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: `${dictionarySnapshot.telemetry.inferenceFailureLiteral} (HTTP ${httpStatusCodeNumeric})`,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_FAILURE',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric,
      modelIdentifierLiteral,
      ...(rawErrorTextLiteral.length > 0 && { rawErrorTextLiteral }),
    }),
  });

  return Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: `${errorSpecification.observationLiteral} (HTTP ${httpStatusCodeNumeric})`,
      suggestedAction: errorSpecification.suggestedActionLiteral,
      detectedAnomalies: [`HTTP_STATUS_${httpStatusCodeNumeric}`],
      metadata: Object.freeze({
        isFaultyBoolean: true,
        providerIdentifierLiteral: 'GOOGLE_GEMINI',
        modelIdentifierLiteral,
        httpStatusCodeNumeric,
        ...(rawErrorTextLiteral.length > 0 && { rawErrorTextLiteral }),
      }),
    }),
  );
};
