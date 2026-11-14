/**
 * @section Reputation Logic - Evaluation Veracity Analyzer (Orchestrator)
 * @description Orquestador encargado de ejecutar la auditoría cognitiva de veracidad
 * cualitativa sobre testimonios ciudadanos. Valida parámetros de entrada con Zod,
 * delega la inferencia al motor de análisis de salud (`BrainOrchestrator`), verifica
 * el contrato de salida ante posibles inconsistencias y reporta trazabilidad SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import { BrainOrchestrator, type TAIProvider } from '@floripa-dignidade/health-analysis-engine';
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

import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema';
import { BuildVeracityAuditPayload } from './BuildVeracityAuditPayload';
import {
  AnalyzeEvaluationVeracityParametersSchema,
  type IAnalyzeEvaluationVeracityParameters,
} from './schemas/AnalyzeEvaluationVeracity.schema';
import { ValidateCognitiveVeracityAdn } from './ValidateCognitiveVeracityAdn';

const VERACITY_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'REPUTATION_VERACITY_SENTRY_ENGINE',
);

const AUDIT_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_COGNITIVE_VERACITY_AUDIT_TRANSACTION',
);

const VERACITY_SCAN_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'VERACITY_SCAN_CONSOLIDATED',
);

const VERACITY_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'VERACITY_PIPELINE_COLLAPSE',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Ejecuta la auditoría cognitiva de veracidad ética sobre un testimonio ciudadano.
 *
 * @param parametersSnapshot - Contenido cualitativo, entidad destino y correlación forense.
 * @param targetAiProviderLiteral - Proveedor cognitivo opcional (por defecto `'HUGGING_FACE'`).
 * @returns {Promise<IVeracityAnalysis>} Dictamen de veracidad validado e inmutable.
 * @throws {ValidationException} Si los parámetros de entrada incumplen el esquema Zod.
 * @throws {GlobalBaseException} Si el motor de inferencia sufre un colapso de infraestructura.
 */
export const AnalyzeEvaluationVeracity = async (
  parametersSnapshot: IAnalyzeEvaluationVeracityParameters,
  targetAiProviderLiteral: TAIProvider = 'HUGGING_FACE',
): Promise<IVeracityAnalysis> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    parametersSnapshot?.correlationIdentifier,
  );

  return await TraceExecutionTime(
    VERACITY_MODULE_IDENTIFIER,
    AUDIT_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IVeracityAnalysis> => {
      try {
        const inputValidationResult =
          AnalyzeEvaluationVeracityParametersSchema.safeParse(parametersSnapshot);

        if (!inputValidationResult.success) {
          throw MapHttpErrorToException(400, 'PARAMETROS_DE_AUDITORIA_INVALIDOS', {
            structuralIssuesCollection: inputValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const { qualitativeContentLiteral, targetEntityIdentifier } = inputValidationResult.data;
        const intelligencePayloadSnapshot = BuildVeracityAuditPayload(qualitativeContentLiteral);

        const rawInferenceResponseSnapshot = await BrainOrchestrator(
          {
            healthContextSnapshot: intelligencePayloadSnapshot,
            analysisScopeTagsCollection: ['REPUTATION_ETHICS', 'CONTENT_VERACITY'],
            inferencePriorityLevel: 'MEDIUM',
          },
          targetAiProviderLiteral,
        );

        const validatedVeracityResult = ValidateCognitiveVeracityAdn(
          rawInferenceResponseSnapshot.metadata['veracityAuditOutput'],
          correlationIdentifier,
        );

        const isSuspiciousBoolean =
          validatedVeracityResult.moderationActionSuggestion !== 'APPROVE';

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isSuspiciousBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: VERACITY_MODULE_IDENTIFIER,
          operationCodeLiteral: VERACITY_SCAN_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Auditoría ética finalizada con veredicto estructurado.',
          semanticIntentTag: 'AI_ETHICS_AUDIT',
          contextMetadataSnapshot: Object.freeze({
            targetEntityIdentifier,
            targetAiProviderLiteral,
            veracityConfidenceScoreNumeric: validatedVeracityResult.veracityConfidenceScoreNumeric,
            moderationActionLiteral: validatedVeracityResult.moderationActionSuggestion,
            detectedFlagsCollection: validatedVeracityResult.semanticFlagsCollection,
          }),
        });

        return Object.freeze(validatedVeracityResult);
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof ValidationException) {
          ReportForensicException(caughtExecutionError, correlationIdentifier);
          throw caughtExecutionError;
        }

        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'FALLO_EN_AUDITORIA_DE_VERACIDAD_SRE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : 'UNKNOWN_VERACITY_FAULT',
                correlationIdentifier,
              });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: VERACITY_MODULE_IDENTIFIER,
          operationCodeLiteral: VERACITY_COLLAPSE_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de veracidad cognitiva.',
          semanticIntentTag: 'COGNITIVE_PIPELINE_FAULT',
          contextMetadataSnapshot: Object.freeze({
            ...normalizedException.runtimeContextSnapshot,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
