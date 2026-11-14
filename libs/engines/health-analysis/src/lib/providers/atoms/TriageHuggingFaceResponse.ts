/**
 * @section AI Providers - Hugging Face Response Triage Engine (Orchestrator Atom)
 * @description Orquestador de triaje encargado de evaluar respuestas HTTP de Hugging Face
 * Router en arquitecturas multi-modelo (Chat Completions OpenAI-Compatible y Task API),
 * delegando extracción segura de contenido, reporte de cuerpos corruptos, ensamblaje de
 * respuestas exitosas y clasificación de errores HTTP con trazabilidad SRE completa.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';
import {
  type ITriageHuggingFaceResponseOptionsInput,
  TriageHuggingFaceResponseOptionsSchema,
} from '../schemas/TriageHuggingFaceResponse.schema';
import { BuildHuggingFaceSuccessInferenceResponse } from './BuildHuggingFaceSuccessInferenceResponse';
import { ClassifyHuggingFaceHttpErrorStatus } from './ClassifyHuggingFaceHttpErrorStatus';
import { ExtractHuggingFaceErrorDiagnostic } from './ExtractHuggingFaceErrorDiagnostic';
import { ExtractHuggingFaceInferenceContent } from './ExtractHuggingFaceInferenceContent';
import { ResolveHuggingFaceTriageDictionary } from './ResolveHuggingFaceTriageDictionary';

const TRIAGE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'HUGGING_FACE_RESPONSE_TRIAGE_ATOM',
);

const MALFORMED_PAYLOAD_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_ROUTER_MALFORMED_SUCCESS_PAYLOAD',
);

const resolveSafeCorrelationIdentifier = (candidateIdentifier: string): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const resolveValidatedTriageOptions = (
  rawOptionsSnapshot: ITriageHuggingFaceResponseOptionsInput | undefined,
) => {
  const optionsValidationResult = TriageHuggingFaceResponseOptionsSchema.safeParse(
    rawOptionsSnapshot ?? {},
  );
  return optionsValidationResult.success
    ? optionsValidationResult.data
    : TriageHuggingFaceResponseOptionsSchema.parse({});
};

const handleMalformedSuccessResponse = (
  executionLatencyInMillisecondsQuantity: number,
  targetModelUrlLiteral: string,
  correlationIdentifier: CorrelationIdentifier,
  malformedObservationLiteral: string,
  telemetryWarningLiteral: string,
  modelIdentifierLiteral: string | undefined,
): IInferenceResponse => {
  const mappedException = MapHttpErrorToException(502, 'MALFORMED_HUGGING_FACE_JSON_BODY', {
    targetModelUrlLiteral,
    ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
  });

  ReportForensicException(mappedException, correlationIdentifier);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: MALFORMED_PAYLOAD_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: telemetryWarningLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'AI_INFERENCE_CONTRACT_WARNING',
    contextMetadataSnapshot: Object.freeze({
      targetModelUrlLiteral,
      ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
    }),
  });

  return Object.freeze(
    InferenceResponseSchema.parse({
      analysisId: correlationIdentifier,
      confidenceScore: 0,
      observation: malformedObservationLiteral,
      suggestedAction: 'RESTART_MODULE',
      detectedAnomalies: ['MALFORMED_ROUTER_JSON_RESPONSE'],
      metadata: Object.freeze({
        isFaultyBoolean: true,
        targetModelUrlLiteral,
        executionLatencyInMillisecondsQuantity,
        ...(modelIdentifierLiteral !== undefined && { modelIdentifierLiteral }),
      }),
    }),
  );
};

/**
 * Evalúa la respuesta HTTP de Hugging Face Router y emite el dictamen de inferencia validado.
 *
 * @param incomingNetworkResponse - Respuesta HTTP física capturada desde el enrutador.
 * @param executionLatencyInMillisecondsQuantity - Latencia de red medida en milisegundos.
 * @param targetModelUrlLiteral - URL canónica consultada durante la inferencia.
 * @param correlationIdentifierInput - Identificador UUID v4 de correlación distribuida.
 * @param rawOptionsSnapshot - Opciones opcionales de localización, modelo y protocolo activo.
 * @returns {Promise<IInferenceResponse>} Snapshot inmutable validado contra `InferenceResponseSchema`.
 */
export const TriageHuggingFaceResponse = async (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  targetModelUrlLiteral: string,
  correlationIdentifierInput: string,
  rawOptionsSnapshot?: ITriageHuggingFaceResponseOptionsInput,
): Promise<IInferenceResponse> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierInput);
  const validatedOptions = resolveValidatedTriageOptions(rawOptionsSnapshot);
  const dictionarySnapshot = ResolveHuggingFaceTriageDictionary(validatedOptions.localeIdentifier);

  if (!incomingNetworkResponse.ok) {
    const { diagnosticDetailLiteral, estimatedTimeSecondsNumeric } =
      await ExtractHuggingFaceErrorDiagnostic(incomingNetworkResponse);

    return ClassifyHuggingFaceHttpErrorStatus({
      httpStatusCodeNumeric: incomingNetworkResponse.status,
      executionLatencyInMillisecondsQuantity,
      targetModelUrlLiteral,
      correlationIdentifier,
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      dictionarySnapshot,
      diagnosticDetailLiteral,
      estimatedTimeSecondsNumeric,
      modelIdentifierLiteral: validatedOptions.modelIdentifierLiteral,
    });
  }

  const extractionResult = await ExtractHuggingFaceInferenceContent(
    incomingNetworkResponse,
    dictionarySnapshot.observations.nominalInferenceFallbackLiteral,
  );

  if (!extractionResult.isJsonValidBoolean) {
    return handleMalformedSuccessResponse(
      executionLatencyInMillisecondsQuantity,
      targetModelUrlLiteral,
      correlationIdentifier,
      dictionarySnapshot.observations.malformedSuccessPayloadLiteral,
      dictionarySnapshot.telemetry.malformedPayloadWarningLiteral,
      validatedOptions.modelIdentifierLiteral,
    );
  }

  return BuildHuggingFaceSuccessInferenceResponse({
    extractionResult,
    executionLatencyInMillisecondsQuantity,
    targetModelUrlLiteral,
    correlationIdentifier,
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    dictionarySnapshot,
    configuredModelIdentifierLiteral: validatedOptions.modelIdentifierLiteral,
    inferenceProtocolLiteral: validatedOptions.inferenceProtocolLiteral,
  });
};
