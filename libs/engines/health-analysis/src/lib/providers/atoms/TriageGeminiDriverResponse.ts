/**
 * @section AI Providers - Google Gemini Response Triage Engine (Atom)
 * @description Evalúa respuestas HTTP de Google Gemini API (`generateContent`),
 * extrayendo texto y métricas de tokens en respuestas exitosas y delegando la
 * clasificación de errores HTTP en `ClassifyGeminiHttpErrorStatus` con trazabilidad SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import type { IGeminiDriverI18n } from '../../i18n/schemas/GeminiDriver.i18n.schema';
import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';
import { GeminiGenerateContentResponseSchema } from '../schemas/GoogleGeminiInferenceDriver.schema';
import { ClassifyGeminiHttpErrorStatus } from './ClassifyGeminiHttpErrorStatus';

const INFERENCE_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'GEMINI_INFERENCE_SUCCESS',
);

export interface ITriageGeminiDriverResponseParameters {
  readonly incomingNetworkResponse: Response;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly promptLengthQuantity: number;
  readonly modelIdentifierLiteral: string;
  readonly targetEndpointUrlLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly dictionarySnapshot: IGeminiDriverI18n;
}

interface IExtractedContentResult {
  readonly observationTextLiteral: string;
  readonly hasExtractedTextBoolean: boolean;
  readonly usageMetadataSnapshot: Readonly<Record<string, unknown>> | undefined;
}

const extractContentFromPayload = (
  rawJsonSnapshot: unknown,
  fallbackObservationLiteral: string,
): IExtractedContentResult => {
  const parsedResponseResult = GeminiGenerateContentResponseSchema.safeParse(rawJsonSnapshot);
  if (!parsedResponseResult.success) {
    return {
      observationTextLiteral: fallbackObservationLiteral,
      hasExtractedTextBoolean: false,
      usageMetadataSnapshot: undefined,
    };
  }

  const candidateTextLiteral =
    parsedResponseResult.data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
  const hasExtractedTextBoolean = Boolean(candidateTextLiteral);

  return {
    observationTextLiteral: hasExtractedTextBoolean
      ? (candidateTextLiteral as string)
      : fallbackObservationLiteral,
    hasExtractedTextBoolean,
    usageMetadataSnapshot: parsedResponseResult.data.usageMetadata,
  };
};

const buildSuccessResponse = (
  parametersSnapshot: ITriageGeminiDriverResponseParameters,
  extractedContent: IExtractedContentResult,
): IInferenceResponse => {
  const {
    executionLatencyInMillisecondsQuantity,
    promptLengthQuantity,
    modelIdentifierLiteral,
    correlationIdentifier,
    moduleIdentifierLiteral,
    dictionarySnapshot,
  } = parametersSnapshot;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral,
    operationCodeLiteral: INFERENCE_SUCCESS_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: dictionarySnapshot.telemetry.inferenceSuccessLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_SUCCESS',
    contextMetadataSnapshot: Object.freeze({
      executionLatencyInMillisecondsQuantity,
      promptLengthQuantity,
      modelIdentifierLiteral,
      hasExtractedTextBoolean: extractedContent.hasExtractedTextBoolean,
    }),
  });

  return Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: extractedContent.hasExtractedTextBoolean ? 0.95 : 0.75,
      observation: extractedContent.observationTextLiteral,
      suggestedAction: 'NONE',
      detectedAnomalies: [],
      metadata: Object.freeze({
        providerIdentifierLiteral: 'GOOGLE_GEMINI',
        modelIdentifierLiteral,
        executionLatencyInMillisecondsQuantity,
        ...(extractedContent.usageMetadataSnapshot !== undefined && {
          usageMetadataSnapshot: extractedContent.usageMetadataSnapshot,
        }),
      }),
    }),
  );
};

const handleMalformedSuccessPayload = (
  correlationIdentifier: CorrelationIdentifier,
  modelIdentifierLiteral: string,
  malformedObservationLiteral: string,
): IInferenceResponse =>
  Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: malformedObservationLiteral,
      suggestedAction: 'RESTART_MODULE',
      detectedAnomalies: ['MALFORMED_GEMINI_JSON_RESPONSE'],
      metadata: Object.freeze({
        isFaultyBoolean: true,
        providerIdentifierLiteral: 'GOOGLE_GEMINI',
        modelIdentifierLiteral,
      }),
    }),
  );

/**
 * Procesa la respuesta HTTP de Google Gemini API y emite el resultado validado.
 *
 * @param parametersSnapshot - Respuesta HTTP, latencia, modelo, correlación y diccionario.
 * @returns {Promise<IInferenceResponse>} Snapshot validado contra `InferenceResponseSchema`.
 */
export const TriageGeminiDriverResponse = async (
  parametersSnapshot: ITriageGeminiDriverResponseParameters,
): Promise<IInferenceResponse> => {
  if (!parametersSnapshot.incomingNetworkResponse.ok) {
    return await ClassifyGeminiHttpErrorStatus(parametersSnapshot);
  }

  try {
    const rawJsonSnapshot: unknown = await parametersSnapshot.incomingNetworkResponse.json();
    const extractedContent = extractContentFromPayload(
      rawJsonSnapshot,
      parametersSnapshot.dictionarySnapshot.observations.nominalInferenceFallbackLiteral,
    );

    return buildSuccessResponse(parametersSnapshot, extractedContent);
  } catch {
    return handleMalformedSuccessPayload(
      parametersSnapshot.correlationIdentifier,
      parametersSnapshot.modelIdentifierLiteral,
      parametersSnapshot.dictionarySnapshot.observations.malformedResponseLiteral,
    );
  }
};
