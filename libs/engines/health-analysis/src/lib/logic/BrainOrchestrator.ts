/**
 * @section Cognitive Logic - Neural Sentinel Brain Orchestrator
 * @description Orquestador supremo encargado de la inferencia predictiva.
 * Transforma señales de telemetría en directivas de acción delegando la carga
 * cognitiva al enjambre de proveedores de IA autorizados.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Pulverización de lógica de validación (SRP), erradicación
 * de literales hardcoded y sincronización de telemetría ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import type { IInferenceResponse, TAIProvider } from '../schemas/Inference.schema';

/* 2. Enjambre Atómico (Internal Swarm) */
import { DetermineIntelligenceDriver } from './IntelligenceProviderFactory';
import { ValidateCognitiveAdn } from './atomic/ValidateCognitiveAdn';

/** Identificador técnico del motor para el Neural Sentinel. */
const ANALYSIS_ENGINE_IDENTIFIER = 'HEALTH_ANALYSIS_ENGINE_ORCHESTRATOR';

/**
 * Ejecuta un análisis cognitivo sobre señales de salud orquestando al proveedor seleccionado.
 * Implementa el patrón 'Sovereign Inference' con medición de latencia y auditoría de veracidad.
 *
 * @param unvalidatedHealthPayloadSnapshot - Estado del sistema capturado para análisis.
 * @param targetAiProviderLiteral - Proveedor de IA (Default: HUGGING_FACE).
 * @returns {Promise<IInferenceResponse>} Directiva de sanación validada y estructurada.
 * @throws {InternalSystemException} Si el modelo falla o el ADN es ilegítimo.
 */
export const AnalyzeSystemHealthInference = async (
  unvalidatedHealthPayloadSnapshot: unknown,
  targetAiProviderLiteral: TAIProvider = 'HUGGING_FACE'
): Promise<IInferenceResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ANALYSIS_ENGINE_IDENTIFIER,
    `COGNITIVE_INFERENCE_ORCHESTRATION_${targetAiProviderLiteral}`,
    correlationIdentifier,
    async () => {
      try {
        // 1. RESOLUCIÓN DE DRIVER (Delegación al Factory)
        const executeInferenceAction = DetermineIntelligenceDriver(targetAiProviderLiteral);

        // 2. EJECUCIÓN DE INFERENCIA (Hardware/Cloud I/O)
        const unvalidatedIntelligenceResponse = await executeInferenceAction(
          unvalidatedHealthPayloadSnapshot
        );

        // 3. AUDITORÍA DE INTEGRIDAD (Delegación al Átomo de Aduana)
        const validatedInferenceResult = ValidateCognitiveAdn(
          unvalidatedIntelligenceResponse,
          correlationIdentifier
        );

        // 4. ANÁLISIS DE UMBRAL DE CERTEZA
        const isConfidenceBelowThresholdBoolean = validatedInferenceResult.confidenceScore < 0.75;

        // 5. REPORTE DE ESTADO COGNITIVO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: isConfidenceBelowThresholdBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: ANALYSIS_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'INFERENCE_ORCHESTRATION_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'HEALTH_ANALYSIS.LOGS.INFERENCE_ORCHESTRATION_COMPLETED',
          contextMetadataSnapshot: {
            suggestedActionLiteral: validatedInferenceResult.suggestedAction,
            analysisIdentifierLiteral: validatedInferenceResult.analysisId,
            confidenceScoreNumeric: validatedInferenceResult.confidenceScore,
            providerLiteral: targetAiProviderLiteral
          },
        });

        return validatedInferenceResult;

      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)

        // Si la excepción ya fue tipada por el átomo de validación, se propaga intacta.
        if (caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : 'UNKNOWN_COGNITIVE_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ANALYSIS_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'COGNITIVE_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'HEALTH_ANALYSIS.ERRORS.ORCHESTRATION_FAILURE',
          contextMetadataSnapshot: {
            targetAiProviderLiteral,
            errorTraceLiteral: errorDescriptionLiteral
          },
        });

        throw new InternalSystemException('COLAPSO_COGNITIVO_EN_ORQUESTACION', {
          aiProviderLiteral: targetAiProviderLiteral,
          errorTraceLiteral: errorDescriptionLiteral,
        });
      }
    }
  );
};
