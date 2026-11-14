// libs/engines/health-analysis/src/lib/logic/atomic/EmitBrainReasoningTelemetry.ts

/**
 * @section Cognitive Logic - Reasoning Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de evaluar el umbral de certeza del
 * razonamiento cognitivo y emitir la señal telemétrica SRE estructurada conforme a
 * `TelemetrySignalSchema` con metadatos inmutables.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad).
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

import type { IInferenceResponse, TAIProvider } from '../../schemas/Inference.schema';
import type { IInferenceRequest } from '../../schemas/InferenceRequest.schema';

const CONFIDENCE_CRITICAL_THRESHOLD_NUMERIC = 0.7;

const REASONING_NOMINAL_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'COGNITIVE_REASONING_NOMINAL',
);

/**
 * @interface IEmitBrainReasoningTelemetryParameters
 * @description Contrato inmutable de entrada para el reporte telemétrico de razonamiento.
 */
export interface IEmitBrainReasoningTelemetryParameters {
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly validatedInferenceResult: IInferenceResponse;
  readonly validatedRequestSnapshot: IInferenceRequest;
  readonly targetAiProviderLiteral: TAIProvider;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Emite de forma no bloqueante la señal telemétrica del veredicto cognitivo.
 *
 * @param parametersSnapshot - Módulo emisor, resultado validado, solicitud, proveedor y correlación.
 */
export const EmitBrainReasoningTelemetry = (
  parametersSnapshot: IEmitBrainReasoningTelemetryParameters,
): void => {
  const {
    moduleIdentifierLiteral,
    validatedInferenceResult,
    validatedRequestSnapshot,
    targetAiProviderLiteral,
    correlationIdentifier,
  } = parametersSnapshot;

  const isConfidenceCriticalBoolean =
    validatedInferenceResult.confidenceScore < CONFIDENCE_CRITICAL_THRESHOLD_NUMERIC;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isConfidenceCriticalBoolean ? 'WARNING' : 'INFO',
    moduleIdentifierLiteral,
    operationCodeLiteral: REASONING_NOMINAL_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Inferencia de salud finalizada con veredicto estructurado.',
    semanticIntentTag: 'AI_REASONING_COMPLETE',
    contextMetadataSnapshot: Object.freeze({
      analysisIdentifier: validatedInferenceResult.analysisId,
      suggestedActionLiteral: validatedInferenceResult.suggestedAction,
      confidenceScoreNumeric: validatedInferenceResult.confidenceScore,
      providerLiteral: targetAiProviderLiteral,
      priorityLiteral: validatedRequestSnapshot.inferencePriorityLevel,
      isConfidenceCriticalBoolean,
    }),
  });
};
