/**
 * @section Cognitive Logic - System Health Inference Orchestrator
 * @description Orquestador soberano encargado de canalizar el análisis cognitivo
 * de salud del sistema a través de los proveedores de IA autorizados (Google Gemini,
 * Hugging Face Router o SLMs locales). Delega la resolución del driver en
 * `DetermineIntelligenceDriver`, la certificación estructural en `ValidateCognitiveAdn`,
 * la medición en `TraceExecutionTime` y la emisión telemétrica bajo `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
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
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import {
  AIProviderSchema,
  type IInferenceResponse,
  type TAIProvider,
} from '../schemas/Inference.schema';
import { ValidateCognitiveAdn } from './atomic/ValidateCognitiveAdn';
import { DetermineIntelligenceDriver } from './IntelligenceProviderFactory';

const COGNITIVE_ENGINE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'HEALTH_ANALYSIS_COGNITIVE_ENGINE',
);

const CONFIDENCE_WARNING_THRESHOLD_NUMERIC = 0.75;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const validateProviderContractAction = (
  targetAiProviderLiteral: unknown,
  correlationIdentifier: CorrelationIdentifier,
): TAIProvider => {
  const providerValidationResult = AIProviderSchema.safeParse(targetAiProviderLiteral);

  if (!providerValidationResult.success) {
    const validationException = new ValidationException('PROVEEDOR_COGNITIVO_NO_AUTORIZADO', {
      attemptedProviderLiteral: targetAiProviderLiteral,
      validationIssuesCollection: providerValidationResult.error.flatten(),
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  return providerValidationResult.data;
};

/**
 * Ejecuta una consulta cognitiva de evaluación de salud del sistema sobre un payload dado.
 *
 * @param unvalidatedHealthPayloadSnapshot - Estado, métricas o contexto bajo análisis.
 * @param targetAiProviderCandidate - Identificador del proveedor de inferencia (por defecto `'HUGGING_FACE'`).
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para propagar la traza.
 * @returns {Promise<IInferenceResponse>} Directiva de acción validada, sellada e inmutable.
 * @throws {ValidationException} Si el proveedor solicitado no pertenece al catálogo SSOT.
 * @throws {InternalSystemException} Si el proveedor externo colapsa o retorna un ADN corrupto.
 */
export const AnalyzeSystemHealthInference = async (
  unvalidatedHealthPayloadSnapshot: unknown,
  targetAiProviderCandidate: TAIProvider = 'HUGGING_FACE',
  correlationIdentifierFallback?: string,
): Promise<IInferenceResponse> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const validatedProviderLiteral = validateProviderContractAction(
    targetAiProviderCandidate,
    correlationIdentifier,
  );

  const orchestrationOperationCode: OperationCode = OperationCodeSchema.parse(
    `COGNITIVE_INFERENCE_ORCHESTRATION_${validatedProviderLiteral}`,
  );

  return await TraceExecutionTime(
    COGNITIVE_ENGINE_MODULE_IDENTIFIER,
    orchestrationOperationCode,
    correlationIdentifier,
    async (): Promise<IInferenceResponse> => {
      try {
        const executeInferenceAction = DetermineIntelligenceDriver(validatedProviderLiteral);

        const unvalidatedIntelligenceResponse = await executeInferenceAction(
          unvalidatedHealthPayloadSnapshot,
        );

        const validatedInferenceResult = ValidateCognitiveAdn(
          unvalidatedIntelligenceResponse,
          correlationIdentifier,
        );

        const isConfidenceWarningRequiredBoolean =
          validatedInferenceResult.confidenceScore < CONFIDENCE_WARNING_THRESHOLD_NUMERIC;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isConfidenceWarningRequiredBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: COGNITIVE_ENGINE_MODULE_IDENTIFIER,
          operationCodeLiteral: OperationCodeSchema.parse('INFERENCE_SUCCESSFULLY_ORCHESTRATED'),
          correlationIdentifier,
          messageContentLiteral:
            'Inferencia cognitiva de salud procesada exitosamente por el proveedor.',
          semanticIntentTag: 'COGNITIVE_HEALTH_ANALYSIS_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            analysisId: validatedInferenceResult.analysisId,
            suggestedActionLiteral: validatedInferenceResult.suggestedAction,
            confidenceScoreNumeric: validatedInferenceResult.confidenceScore,
            providerLiteral: validatedProviderLiteral,
            isConfidenceWarningRequiredBoolean,
          }),
        });

        return validatedInferenceResult;
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          ReportForensicException(caughtExecutionError, correlationIdentifier);
          throw caughtExecutionError;
        }

        if (caughtExecutionError instanceof InternalSystemException) {
          ReportForensicException(caughtExecutionError, correlationIdentifier);
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : new InternalSystemException('FALLO_EN_ORQUESTACION_COGNITIVA', {
                originalErrorLiteral: errorDescriptionLiteral,
                providerLiteral: validatedProviderLiteral,
                correlationIdentifier,
              });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: COGNITIVE_ENGINE_MODULE_IDENTIFIER,
          operationCodeLiteral: OperationCodeSchema.parse('COGNITIVE_ORCHESTRATION_COLLAPSE'),
          correlationIdentifier,
          messageContentLiteral: `Fallo crítico en la orquestación cognitiva con el proveedor [${validatedProviderLiteral}].`,
          semanticIntentTag: 'COGNITIVE_PIPELINE_FAULT',
          contextMetadataSnapshot: Object.freeze({
            errorTraceLiteral: errorDescriptionLiteral,
            providerLiteral: validatedProviderLiteral,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};

/**
 * @name analyzeSystemHealthInference
 * @description Alias institucional en camelCase para compatibilidad de importación.
 */
export const analyzeSystemHealthInference = AnalyzeSystemHealthInference;
