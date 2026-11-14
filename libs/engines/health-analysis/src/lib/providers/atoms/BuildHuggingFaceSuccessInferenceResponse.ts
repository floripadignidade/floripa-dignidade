/**
 * @section AI Providers - Hugging Face Success Response Builder (Atom)
 * @description Átomo encargado de evaluar la degradación por latencia en respuestas
 * HTTP `200`, emitir la señal telemétrica SRE correspondiente conforme a `TelemetrySignalSchema`
 * y sellar inmutablemente el resultado contra `InferenceResponseSchema`.
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

import type { IHuggingFaceTriageI18n } from '../../i18n/schemas/HuggingFaceTriage.i18n.schema';
import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';
import type { THuggingFaceInferenceProtocol } from '../schemas/HuggingFaceInferenceDriver.schema';
import { HUGGING_FACE_DEGRADED_LATENCY_THRESHOLD_MILLISECONDS_QUANTITY } from '../schemas/TriageHuggingFaceResponse.schema';
import type { IExtractedHuggingFaceContent } from './ExtractHuggingFaceInferenceContent';

const INFERENCE_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_INFERENCE_SUCCESS',
);

/**
 * @interface IBuildHuggingFaceSuccessResponseParameters
 * @description Parámetros inmutables para construir y auditar una respuesta exitosa de inferencia.
 */
export interface IBuildHuggingFaceSuccessResponseParameters {
  readonly extractionResult: IExtractedHuggingFaceContent;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly targetModelUrlLiteral: string;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly dictionarySnapshot: IHuggingFaceTriageI18n;
  readonly configuredModelIdentifierLiteral: string | undefined;
  readonly inferenceProtocolLiteral: THuggingFaceInferenceProtocol | undefined;
}

const buildTelemetryContextMetadata = (
  targetModelUrlLiteral: string,
  executionLatencyInMillisecondsQuantity: number,
  isLatencyDegradedBoolean: boolean,
  extractionResult: IExtractedHuggingFaceContent,
  resolvedModelLiteral: string | undefined,
): Readonly<Record<string, unknown>> =>
  Object.freeze({
    targetModelUrlLiteral,
    executionLatencyInMillisecondsQuantity,
    isLatencyDegradedBoolean,
    hasExtractedTextBoolean: extractionResult.hasExtractedTextBoolean,
    ...(resolvedModelLiteral !== undefined && { modelIdentifierLiteral: resolvedModelLiteral }),
    ...(extractionResult.finishReasonLiteral !== undefined && {
      finishReasonLiteral: extractionResult.finishReasonLiteral,
    }),
  });

const buildOutputMetadata = (
  targetModelUrlLiteral: string,
  executionLatencyInMillisecondsQuantity: number,
  isLatencyDegradedBoolean: boolean,
  extractionResult: IExtractedHuggingFaceContent,
  resolvedModelLiteral: string | undefined,
  inferenceProtocolLiteral: THuggingFaceInferenceProtocol | undefined,
): Readonly<Record<string, unknown>> =>
  Object.freeze({
    targetModelUrlLiteral,
    executionLatencyInMillisecondsQuantity,
    isLatencyDegradedBoolean,
    ...(resolvedModelLiteral !== undefined && { modelIdentifierLiteral: resolvedModelLiteral }),
    ...(inferenceProtocolLiteral !== undefined && { inferenceProtocolLiteral }),
    ...(extractionResult.finishReasonLiteral !== undefined && {
      finishReasonLiteral: extractionResult.finishReasonLiteral,
    }),
    ...(extractionResult.tokenUsageSnapshot !== undefined && {
      tokenUsageSnapshot: extractionResult.tokenUsageSnapshot,
    }),
    rawResponseSnapshot: extractionResult.rawResponseSnapshot,
  });

/**
 * Emite telemetría SRE y ensambla la respuesta certificada para respuestas HTTP `200`.
 *
 * @param parametersSnapshot - Contenido extraído, latencia, modelo, protocolo y diccionario.
 * @returns {IInferenceResponse} Respuesta validada contra `InferenceResponseSchema` y congelada.
 */
export const BuildHuggingFaceSuccessInferenceResponse = (
  parametersSnapshot: IBuildHuggingFaceSuccessResponseParameters,
): IInferenceResponse => {
  const {
    extractionResult,
    executionLatencyInMillisecondsQuantity,
    targetModelUrlLiteral,
    correlationIdentifier,
    moduleIdentifierLiteral,
    dictionarySnapshot,
    configuredModelIdentifierLiteral,
    inferenceProtocolLiteral,
  } = parametersSnapshot;

  const isLatencyDegradedBoolean =
    executionLatencyInMillisecondsQuantity >
    HUGGING_FACE_DEGRADED_LATENCY_THRESHOLD_MILLISECONDS_QUANTITY;

  const resolvedModelLiteral =
    extractionResult.resolvedModelIdentifierLiteral ?? configuredModelIdentifierLiteral;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
    moduleIdentifierLiteral,
    operationCodeLiteral: INFERENCE_SUCCESS_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: isLatencyDegradedBoolean
      ? dictionarySnapshot.telemetry.inferenceDegradedLatencyLiteral
      : dictionarySnapshot.telemetry.inferenceSuccessLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_SUCCESS',
    contextMetadataSnapshot: buildTelemetryContextMetadata(
      targetModelUrlLiteral,
      executionLatencyInMillisecondsQuantity,
      isLatencyDegradedBoolean,
      extractionResult,
      resolvedModelLiteral,
    ),
  });

  return Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: extractionResult.hasExtractedTextBoolean ? 0.95 : 0.75,
      observation: extractionResult.extractedObservationLiteral,
      suggestedAction: 'NONE',
      detectedAnomalies: [],
      metadata: buildOutputMetadata(
        targetModelUrlLiteral,
        executionLatencyInMillisecondsQuantity,
        isLatencyDegradedBoolean,
        extractionResult,
        resolvedModelLiteral,
        inferenceProtocolLiteral,
      ),
    }),
  );
};
