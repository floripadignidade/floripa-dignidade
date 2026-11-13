/**
 * @section Cognitive Logic - System Health Inference Orchestrator
 * @description Punto de entrada soberano para la auditoría cognitiva.
 * Transforma telemetría en directivas de acción mediante el enjambre de IA.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & ISO Technical Naming.
 * SANEADO Zenith: Promesas flotantes resueltas (void) y atomización forense del ADN Zod.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';
import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { InferenceResponseSchema } from '../schemas/Inference.schema';
import type { IInferenceResponse, TAIProvider } from '../schemas/Inference.schema';

/* 2. Enjambre Atómico */
import { DetermineIntelligenceDriver } from './IntelligenceProviderFactory';

/** Identificador técnico del motor para el Neural Sentinel. */
const COGNITIVE_ENGINE_IDENTIFIER = 'HEALTH_ANALYSIS_COGNITIVE_ENGINE';

/**
 * @section Átomo Interno: Aduana de ADN Cognitivo
 * @description Aísla la responsabilidad de validar la estructura devuelta por la IA externa.
 * Esto cumple con la regla de SRP, permitiendo capturar "alucinaciones" de la IA
 * sin contaminar el flujo de orquestación principal.
 */
const validateCognitiveAdn = (
  rawAiPayload: unknown,
  correlationIdentifier: string,
): IInferenceResponse => {
  const validationResult = InferenceResponseSchema.safeParse(rawAiPayload);

  if (!validationResult.success) {
    // Reporte inmediato de alucinación o cambio de contrato por parte de la IA
    void EmitTelemetrySignal({
      severityLevel: 'CRITICAL',
      moduleIdentifier: COGNITIVE_ENGINE_IDENTIFIER,
      operationCode: 'AI_HALLUCINATION_OR_ADN_CORRUPTION',
      correlationIdentifier,
      message: 'HEALTH_ANALYSIS.ERRORS.AI_CONTRACT_VIOLATION',
      contextMetadata: {
        structuralIssuesCollection: validationResult.error.flatten(),
        rawAiResponseSnapshot: rawAiPayload,
      },
    });

    throw new InternalSystemException('ALUCINACION_O_ADN_COGNITIVO_CORRUPTO', {
      validationIssues: validationResult.error.flatten(),
    });
  }

  return validationResult.data;
};

/**
 * Ejecuta un análisis cognitivo sobre señales de salud orquestando al proveedor.
 *
 * @param unvalidatedHealthPayloadSnapshot - Estado del sistema capturado para análisis.
 * @param targetAiProviderLiteral - Proveedor de inteligencia (Default: HUGGING_FACE).
 * @returns {Promise<IInferenceResponse>} Directiva de sanación validada y purificada.
 * @throws {InternalSystemException} Si la inferencia falla o viola el contrato de ADN.
 */
export const AnalyzeSystemHealthInference = async (
  unvalidatedHealthPayloadSnapshot: unknown,
  targetAiProviderLiteral: TAIProvider = 'HUGGING_FACE',
): Promise<IInferenceResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    COGNITIVE_ENGINE_IDENTIFIER,
    `COGNITIVE_INFERENCE_ORCHESTRATION_${targetAiProviderLiteral}`,
    correlationIdentifier,
    async () => {
      try {
        // 1. RESOLUCIÓN DE DRIVER (Delegación Atómica)
        const executeInferenceAction = DetermineIntelligenceDriver(targetAiProviderLiteral);

        // 2. EJECUCIÓN DE INFERENCIA (I/O Red Externa)
        const unvalidatedIntelligenceResponse = await executeInferenceAction(
          unvalidatedHealthPayloadSnapshot,
        );

        // 3. ADUANA DE ADN (Delegación a Átomo Interno)
        const validatedInferenceResult = validateCognitiveAdn(
          unvalidatedIntelligenceResponse,
          correlationIdentifier,
        );

        const isConfidenceWarningRequiredBoolean = validatedInferenceResult.confidenceScore < 0.75;

        // 4. REPORTE DE ESTADO COGNITIVO (Telemetry Sync)
        void EmitTelemetrySignal({
          severityLevel: isConfidenceWarningRequiredBoolean ? 'WARNING' : 'INFO',
          moduleIdentifier: COGNITIVE_ENGINE_IDENTIFIER,
          operationCode: 'INFERENCE_SUCCESSFULLY_ORCHESTRATED',
          correlationIdentifier,
          /** Uso de clave soberana para internacionalización de logs técnicos */
          message: 'HEALTH_ANALYSIS.LOGS.INFERENCE_NOMINAL',
          contextMetadata: {
            analysisId: validatedInferenceResult.analysisId,
            suggestedActionLiteral: validatedInferenceResult.suggestedAction,
            confidenceScoreNumeric: validatedInferenceResult.confidenceScore,
            providerLiteral: targetAiProviderLiteral,
          },
        });

        return validatedInferenceResult;
      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)

        // Si la excepción ya fue generada y tipada por la Aduana Interna, se propaga.
        if (caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: COGNITIVE_ENGINE_IDENTIFIER,
          operationCode: 'COGNITIVE_ORCHESTRATION_COLAPSE',
          correlationIdentifier,
          message: 'HEALTH_ANALYSIS.ERRORS.ORCHESTRATION_FAULT',
          contextMetadata: {
            errorTraceLiteral: errorDescriptionLiteral,
            providerLiteral: targetAiProviderLiteral,
          },
        });

        throw new InternalSystemException('FALLO_EN_ORQUESTACION_COGNITIVA', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
