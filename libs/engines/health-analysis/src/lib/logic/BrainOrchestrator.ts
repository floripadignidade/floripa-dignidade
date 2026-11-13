/**
 * @section Cognitive Logic - Neural Sentinel Brain Orchestrator
 * @description Orquestador supremo encargado de la inferencia predictiva y preventiva.
 * Coordina la validación de entrada, la selección de modelos de IA y la auditoría
 * de resultados para generar directivas de auto-sanación inmutables.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Implementación de validación dual (Input/Output), telemetría
 * de razonamiento y erradicación de ceguera estructural.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import { InferenceRequestSchema } from '../schemas/InferenceRequest.schema';
// import { InferenceResponseSchema } from '../schemas/Inference.schema';
import type { IInferenceResponse, TAIProvider } from '../schemas/Inference.schema';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { DetermineIntelligenceDriver } from './IntelligenceProviderFactory';
import { ValidateCognitiveAdn } from './atomic/ValidateCognitiveAdn';

/** Identificador técnico del motor para el Neural Sentinel. */
const BRAIN_ORCHESTRATOR_IDENTIFIER = 'NEURAL_SENTINEL_BRAIN_ORCHESTRATOR';

/**
 * Ejecuta una sesión de razonamiento cognitivo orquestando proveedores de IA.
 * Implementa el patrón "Sovereign Intelligence": valida el ADN antes y después
 * de la computación, asegurando la integridad de la directiva de salud.
 *
 * @param unvalidatedRequestSnapshot - Datos crudos de la solicitud (Contexto + Tags).
 * @param targetAiProviderLiteral - Identificador del proveedor (Default: HUGGING_FACE).
 * @returns {Promise<IInferenceResponse>} Directiva de sanación validada y sellada.
 * @throws {ValidationException} Si la solicitud es impura.
 * @throws {InternalSystemException} Si el modelo alucina o la infraestructura colapsa.
 */
export const BrainOrchestrator = async (
  unvalidatedRequestSnapshot: unknown,
  targetAiProviderLiteral: TAIProvider = 'HUGGING_FACE',
): Promise<IInferenceResponse> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    BRAIN_ORCHESTRATOR_IDENTIFIER,
    `EXECUTE_COGNITIVE_REASONING_VIA_${targetAiProviderLiteral}`,
    correlationIdentifier,
    async () => {
      try {
        // 1. ADUANA DE ENTRADA (Pre-inference DNA Check)
        /**
         * 🛡️ LEY ZENITH: No procesamos datos que no cumplan el contrato.
         * Esto ahorra latencia y costes en proveedores de IA externos.
         */
        const requestValidationResult = InferenceRequestSchema.safeParse(
          unvalidatedRequestSnapshot,
        );

        if (!requestValidationResult.success) {
          throw new ValidationException('ADN_DE_SOLICITUD_COGNITIVA_CORRUPTO', {
            structuralIssuesCollection: requestValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedRequest = requestValidationResult.data;

        // 2. RESOLUCIÓN DE INTELIGENCIA (Driver Factory)
        const executeInferenceAction = DetermineIntelligenceDriver(targetAiProviderLiteral);

        // 3. EJECUCIÓN DE INFERENCIA (Hardware/Cloud I/O)
        /**
         * Despachamos el snapshot validado hacia el driver específico.
         */
        const unvalidatedIntelligenceResponse = await executeInferenceAction(validatedRequest);

        // 4. ADUANA DE SALIDA (Post-inference DNA Check)
        /**
         * Delegamos en el átomo de validación de respuesta para capturar alucinaciones.
         * Transforma el resultado crudo en el tipo nominal IInferenceResponse.
         */
        const validatedInferenceResult = ValidateCognitiveAdn(
          unvalidatedIntelligenceResponse,
          correlationIdentifier,
        );

        // 5. ANÁLISIS DE UMBRAL DE CERTEZA (SRE Decision)
        const isConfidenceCriticalBoolean = validatedInferenceResult.confidenceScore < 0.7;

        // 6. REPORTE DE SINFONÍA COGNITIVA (Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: isConfidenceCriticalBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: BRAIN_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'COGNITIVE_REASONING_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Inferencia de salud finalizada con veredicto estructurado.',
          semanticIntentTag: 'AI_REASONING_COMPLETE',
          contextMetadataSnapshot: {
            analysisId: validatedInferenceResult.analysisId,
            suggestedActionLiteral: validatedInferenceResult.suggestedAction,
            confidenceScoreNumeric: validatedInferenceResult.confidenceScore,
            providerLiteral: targetAiProviderLiteral,
            priorityLiteral: validatedRequest.inferencePriorityLevel,
          },
        });

        return validatedInferenceResult;
      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)

        // Propagación de excepciones de validación ya tipadas (400)
        if (caughtError instanceof ValidationException) throw caughtError;

        // Propagación de fallos de ADN (500) ya gestionados por átomos
        if (caughtError instanceof InternalSystemException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : 'UNKNOWN_BRAIN_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: BRAIN_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'COGNITIVE_PIPELINE_FAILURE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador cerebral.',
          semanticIntentTag: 'COGNITIVE_ENGINE_COLLAPSE',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            providerLiteral: targetAiProviderLiteral,
          },
        });

        throw new InternalSystemException('COLAPSO_EN_SISTEMA_DE_RAZONAMIENTO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
