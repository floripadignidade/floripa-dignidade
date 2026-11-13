/**
 * @section Reputation Logic - Cognitive ADN Validator Atom
 * @description Átomo encargado de validar los hallazgos del motor de IA.
 * Implementa una estrategia de fallback resiliente ante alucinaciones.
 *
 * Protocolo OEDP-V17.0 - Zod Sovereign Aduana & SRE Resilience.
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import { VeracityAnalysisSchema } from '../../schemas/VeracityAnalysis.schema';
import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema';

/**
 * Valida el rastro devuelto por la IA y activa el modo de contingencia si el ADN es corrupto.
 */
export const ValidateCognitiveVeracityAdn = (
  unvalidatedAuditOutput: unknown,
  correlationIdentifier: string,
): IVeracityAnalysis => {
  const veracityValidationResult = VeracityAnalysisSchema.safeParse(unvalidatedAuditOutput);

  if (!veracityValidationResult.success) {
    /**
     * @section Resiliencia ante Alucinaciones
     * Si la IA devuelve un formato corrupto, marcamos para revisión humana manual.
     */
    void EmitTelemetrySignal({
      severityLevel: 'WARNING',
      moduleIdentifier: 'REPUTATION_VERACITY_SENTRY',
      operationCode: 'COGNITIVE_ADN_INCONSISTENCY',
      correlationIdentifier,
      message: 'Fallo estructural en la respuesta de la IA. Aplicando fallback de triaje humano.',
      contextMetadataSnapshot: {
        structuralIssuesCollection: veracityValidationResult.error.flatten(),
      },
    });

    return {
      veracityConfidenceScoreNumeric: 0.5,
      semanticFlagsCollection: ['LOGICAL_INCONSISTENCY'],
      moderationActionSuggestion: 'FLAG_FOR_REVIEW',
      inferenceReasoningLiteral:
        'Auditoría automática inconsistente; activada contingencia de auditoría manual.',
    };
  }

  return veracityValidationResult.data;
};
