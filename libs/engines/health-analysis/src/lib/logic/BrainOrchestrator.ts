// libs/engines/health-analysis/src/lib/logic/BrainOrchestrator.ts

/**
 * @section Cognitive Logic - Cognitive Reasoning Orchestrator
 * @description Orquestador central encargado de coordinar la inferencia predictiva
 * y preventiva de salud del sistema. Valida el contrato de entrada con Zod, resuelve
 * el driver del proveedor de IA correspondiente, certifica la estructura de salida
 * con `ValidateCognitiveAdn` y emite trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  AIProviderSchema,
  type IInferenceResponse,
  type TAIProvider,
} from '../schemas/Inference.schema';
import { type IInferenceRequest, InferenceRequestSchema } from '../schemas/InferenceRequest.schema';
import { EmitBrainReasoningTelemetry } from './atomic/EmitBrainReasoningTelemetry';
import { NormalizeBrainOrchestrationError } from './atomic/NormalizeBrainOrchestrationError';
import { ValidateCognitiveAdn } from './atomic/ValidateCognitiveAdn';
import { DetermineIntelligenceDriver } from './IntelligenceProviderFactory';

const REASONING_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'COGNITIVE_REASONING_ORCHESTRATOR',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const validateRequestContract = (
  unvalidatedRequestSnapshot: unknown,
  correlationIdentifier: CorrelationIdentifier,
): IInferenceRequest => {
  const requestValidationResult = InferenceRequestSchema.safeParse(unvalidatedRequestSnapshot);

  if (!requestValidationResult.success) {
    throw new ValidationException('ADN_DE_SOLICITUD_COGNITIVA_CORRUPTO', {
      structuralIssuesCollection: requestValidationResult.error.flatten(),
      correlationIdentifier,
    });
  }

  return requestValidationResult.data;
};

const validateProviderContract = (
  targetAiProviderLiteral: unknown,
  correlationIdentifier: CorrelationIdentifier,
): TAIProvider => {
  const providerValidationResult = AIProviderSchema.safeParse(targetAiProviderLiteral);

  if (!providerValidationResult.success) {
    throw new ValidationException('PROVEEDOR_COGNITIVO_NO_AUTORIZADO', {
      attemptedProviderLiteral: targetAiProviderLiteral,
      correlationIdentifier,
    });
  }

  return providerValidationResult.data;
};

/**
 * Ejecuta una sesión de razonamiento cognitivo orquestando proveedores de IA autorizados.
 *
 * @param unvalidatedRequestSnapshot - Solicitud estructurada (`healthContextSnapshot`, `analysisScopeTagsCollection`).
 * @param targetAiProviderLiteral - Proveedor de inteligencia artificial (por defecto `'HUGGING_FACE'`).
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para trazabilidad distribuida.
 * @returns {Promise<IInferenceResponse>} Directiva de salud validada, sellada e inmutable.
 * @throws {ValidationException} Si los parámetros o la solicitud incumplen los contratos Zod.
 * @throws {InternalSystemException} Si el modelo externo falla o produce una respuesta corrupta.
 */
export const BrainOrchestrator = async (
  unvalidatedRequestSnapshot: unknown,
  targetAiProviderLiteral: TAIProvider = 'HUGGING_FACE',
  correlationIdentifierFallback?: string,
): Promise<IInferenceResponse> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  const validatedProviderLiteral = validateProviderContract(
    targetAiProviderLiteral,
    correlationIdentifier,
  );

  const executionOperationCode: OperationCode = OperationCodeSchema.parse(
    `EXECUTE_COGNITIVE_REASONING_VIA_${validatedProviderLiteral}`,
  );

  return await TraceExecutionTime(
    REASONING_MODULE_IDENTIFIER,
    executionOperationCode,
    correlationIdentifier,
    async (): Promise<IInferenceResponse> => {
      try {
        const validatedRequestSnapshot = validateRequestContract(
          unvalidatedRequestSnapshot,
          correlationIdentifier,
        );

        const executeInferenceAction = DetermineIntelligenceDriver(validatedProviderLiteral);
        const unvalidatedIntelligenceResponse =
          await executeInferenceAction(validatedRequestSnapshot);

        const validatedInferenceResult = ValidateCognitiveAdn(
          unvalidatedIntelligenceResponse,
          correlationIdentifier,
        );

        EmitBrainReasoningTelemetry({
          moduleIdentifierLiteral: REASONING_MODULE_IDENTIFIER,
          validatedInferenceResult,
          validatedRequestSnapshot,
          targetAiProviderLiteral: validatedProviderLiteral,
          correlationIdentifier,
        });

        return validatedInferenceResult;
      } catch (caughtExecutionError: unknown) {
        throw NormalizeBrainOrchestrationError({
          caughtExecutionError,
          moduleIdentifierLiteral: REASONING_MODULE_IDENTIFIER,
          targetAiProviderLiteral: validatedProviderLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};

/**
 * @name CognitiveReasoningOrchestrator
 * @description Alias institucional bajo norma ISO/IEC 11179 sin metáforas.
 */
export const CognitiveReasoningOrchestrator = BrainOrchestrator;
