/**
 * @section Reputation Logic - Evaluation Veracity Analyzer (Orchestrator)
 * @description Orquestador de inteligencia encargado de la auditoría de veracidad
 * cualitativa. Coordina la comunicación con el cerebro cognitivo (Neural Sentinel)
 * para detectar sesgos, falsedades o patrones de odio en testimonios ciudadanos.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS2305 (BrainOrchestrator Sync), inyección de
 * extensiones ESM (.js) y cumplimiento total de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';

/** 🛡️ SANEADO Zenith (Fix TS2305): Sincronización con el orquestador cerebral nivelado. */
import { BrainOrchestrator } from '@floripa-dignidade/health-analysis-engine';

import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
/** 🛡️ SANEADO Zenith: Inyección de extensiones '.js' para resolución de Grafo. */
import { AnalyzeEvaluationVeracityParametersSchema } from './schemas/AnalyzeEvaluationVeracity.schema.js';
import type { IAnalyzeEvaluationVeracityParameters } from './schemas/AnalyzeEvaluationVeracity.schema.js';
import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema.js';

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { BuildVeracityAuditPayload } from './BuildVeracityAuditPayload.js';
import { ValidateCognitiveVeracityAdn } from './ValidateCognitiveVeracityAdn.js';

/** Identificador técnico del aparato para el Neural Sentinel. */
const VERACITY_ANALYZER_IDENTIFIER = 'REPUTATION_VERACITY_SENTRY_ENGINE';

/**
 * Ejecuta una auditoría cognitiva integral sobre el contenido de una evaluación.
 * Implementa el patrón "Zero-Knowledge Audit": la IA solo recibe el rastro
 * textual anonimizado y devuelve una clasificación ética estructurada.
 *
 * @param parametersSnapshot - Snapshot de datos y contexto validado por la aduana.
 * @returns {Promise<IVeracityAnalysis>} Resultado de la auditoría validado e inmutable.
 * @throws {InternalSystemException} Si el puente con el motor de IA colapsa.
 */
export const AnalyzeEvaluationVeracity = async (
  parametersSnapshot: IAnalyzeEvaluationVeracityParameters,
): Promise<IVeracityAnalysis> => {
  const { correlationIdentifier } = parametersSnapshot;

  return await TraceExecutionTime(
    VERACITY_ANALYZER_IDENTIFIER,
    'EXECUTE_COGNITIVE_VERACITY_AUDIT_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ENTRADA (Input Boundary) ---
        const inputValidationResult =
          AnalyzeEvaluationVeracityParametersSchema.safeParse(parametersSnapshot);

        if (!inputValidationResult.success) {
          throw MapHttpErrorToException(400, 'PARAMETROS_DE_AUDITORIA_INVALIDOS', {
            structuralIssuesCollection: inputValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const { qualitativeContentLiteral, targetEntityIdentifier } = inputValidationResult.data;

        // --- FASE 2: PREPARACIÓN DE CONTRATO COGNITIVO ---
        const intelligencePayloadSnapshot = BuildVeracityAuditPayload(qualitativeContentLiteral);

        // --- FASE 3: INFERENCIA IA (Brain Synergy) ---
        /**
         * 🛡️ SANEADO Zenith: Delegación al 'BrainOrchestrator'.
         * Se inyectan las etiquetas de alcance para orientar el razonamiento del Sentinel.
         */
        const rawInferenceResponseSnapshot = await BrainOrchestrator(
          {
            healthContextSnapshot: intelligencePayloadSnapshot,
            analysisScopeTagsCollection: ['REPUTATION_ETHICS', 'CONTENT_VERACITY'],
            inferencePriorityLevel: 'MEDIUM',
          },
          'HUGGING_FACE',
        );

        // --- FASE 4: ADUANA DE SALIDA (Alucination Shield) ---
        /**
         * Validamos el rastro 'veracityAuditOutput' inyectado en el metadata por la IA.
         * Si el formato es corrupto, el átomo de validación aplicará el Fallback de Triaje Humano.
         */
        const validatedVeracityResult = ValidateCognitiveVeracityAdn(
          rawInferenceResponseSnapshot.metadata['veracityAuditOutput'],
          correlationIdentifier,
        );

        // --- FASE 5: REPORTE DE SALUD SRE (Visibility) ---
        const isSuspiciousBoolean =
          validatedVeracityResult.moderationActionSuggestion !== 'APPROVE';

        void EmitTelemetrySignal({
          severityLevelLiteral: isSuspiciousBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: VERACITY_ANALYZER_IDENTIFIER,
          operationCodeLiteral: 'VERACITY_SCAN_CONSOLIDATED',
          correlationIdentifier,
          messageContentLiteral: 'Auditoría ética finalizada con veredicto estructurado.',
          semanticIntentTag: 'AI_ETHICS_AUDIT',
          contextMetadataSnapshot: {
            targetEntityIdentifier,
            veracityConfidenceScoreNumeric: validatedVeracityResult.veracityConfidenceScoreNumeric,
            moderationActionLiteral: validatedVeracityResult.moderationActionSuggestion,
            detectedFlagsCollection: validatedVeracityResult.semanticFlagsCollection,
          },
        });

        return validatedVeracityResult;
      } catch (caughtError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE FALLO (Resilience) ---
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : 'UNKNOWN_VERACITY_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: VERACITY_ANALYZER_IDENTIFIER,
          operationCodeLiteral: 'VERACITY_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de veracidad cognitiva.',
          semanticIntentTag: 'COGNITIVE_PIPELINE_FAULT',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw MapHttpErrorToException(500, 'FALLO_EN_AUDITORIA_DE_VERACIDAD_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
