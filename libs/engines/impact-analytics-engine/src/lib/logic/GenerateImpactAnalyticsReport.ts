/**
 * @section Impact Analytics - Comprehensive Report Orchestrator (Master)
 * @description Motor superior encargado de ensamblar la analítica bayesiana global
 * y el desglose territorial (Mapa de Calor). Orquesta el enjambre de lógica
 * estadística para generar evidencia inmutable de impacto social.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS2307, validación de ADN en frontera y
 * cumplimiento estricto de la Prosa ISO (Zero Abbreviations).
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
import type { IEvaluationInput } from '../schemas/EvaluationInput.schema';
import { GenerateImpactAnalyticsReportSchema } from './atomic/schemas/GenerateImpactAnalyticsReport.schema';

/* 2. Enjambre Atómico de Inteligencia (Swiss-Watch Swarm) */
import { AggregateBayesianImpactMetrics } from './AggregateBayesianImpactMetrics';
import { AggregateTerritorialSentiment } from './atomic/AggregateTerritorialSentiment';
import { ValidateTerritorialReportADN } from './atomic/ValidateTerritorialReportADN';
import {
  AssembleComprehensiveImpactReport,
  type IComprehensiveReportResult,
} from './atomic/AssembleComprehensiveImpactReport';

/** Identificador técnico del motor para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'IMPACT_ANALYTICS_REPORT_ENGINE';

/**
 * Genera un reporte de impacto multidimensional de grado forense.
 * Coordina los motores de confianza bayesiana y agrupación territorial,
 * garantizando la soberanía de la información mediante validación dual (Input/Output).
 *
 * @param targetEntityIdentifierLiteral - UUID de la entidad bajo auditoría (Gasto, Noticia o Denuncia).
 * @param evaluationInputsCollection - Colección de pulsos de interacción capturados por los sensores.
 * @returns {Promise<IComprehensiveReportResult>} Reporte consolidado, validado e inmutable.
 * @throws {ValidationException} Si los parámetros de entrada o los contratos violan el ADN institucional.
 * @throws {InternalSystemException} Si el pipeline estadístico colapsa por fallo de infraestructura.
 */
export const GenerateImpactAnalyticsReport = async (
  targetEntityIdentifierLiteral: string,
  evaluationInputsCollection: IEvaluationInput[],
): Promise<IComprehensiveReportResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_ANALYTICS_REPORT_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ENTRADA (Sovereign Validation) ---
        /**
         * 🛡️ LEY ZENITH: Validamos y realizamos el casting nominal en la frontera física.
         * Esto garantiza que los motores de cálculo reciban ADN purificado y tipado (Branded).
         */
        const inputValidationResult = GenerateImpactAnalyticsReportSchema.safeParse({
          targetEntityIdentifier: targetEntityIdentifierLiteral,
          evaluationInputsCollection,
        });

        if (!inputValidationResult.success) {
          throw new ValidationException('CONTRATO_DE_SOLICITUD_DE_REPORTE_CORRUPTO', {
            structuralIssuesCollection: inputValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const {
          targetEntityIdentifier,
          evaluationInputsCollection: validatedEvaluationInputsCollection,
        } = inputValidationResult.data;

        // --- FASE 2: ANALÍTICA BAYESIANA GLOBAL (Confianza Ponderada) ---
        /**
         * Calculamos el termómetro de credibilidad neutralizando el ruido de identidades anónimas.
         */
        const globalIndicatorSnapshot = await AggregateBayesianImpactMetrics(
          targetEntityIdentifier,
          validatedEvaluationInputsCollection,
        );

        // --- FASE 3: DESGLOSE TERRITORIAL (Geographic Sentiment Clustering) ---
        /**
         * Agrupamos el sentimiento popular por barrios de Florianópolis (IBGE Sync).
         */
        const rawTerritorialClustersCollection = await AggregateTerritorialSentiment(
          [...validatedEvaluationInputsCollection],
          correlationIdentifier,
        );

        // --- FASE 4: ADUANA DE ADN TERRITORIAL (Integrity Check) ---
        /**
         * Certificamos que el reporte geográfico cumpla con el esquema de visualización.
         */
        const territorialReportSnapshot = ValidateTerritorialReportADN({
          targetEntityIdentifier: targetEntityIdentifier as string,
          territorialClustersCollection: rawTerritorialClustersCollection,
          generationTimestampISO: new Date().toISOString(),
        });

        // --- FASE 5: ENSAMBLAJE SOBERANO (Delegación Atómica) ---
        /**
         * Consolidamos los hallazgos en un artefacto inmutable sellado (Lost Artifact).
         */
        const finalComprehensiveReport = AssembleComprehensiveImpactReport(
          globalIndicatorSnapshot,
          territorialReportSnapshot,
        );

        // --- FASE 6: REPORTE DE ÉXITO (SRE Visibility) ---
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'COMPREHENSIVE_REPORT_CONSOLIDATED',
          correlationIdentifier,
          /** Clave de diccionario institucional para la IA */
          messageContentLiteral: 'IMPACT_ANALYTICS.LOGS.REPORT_GENERATED_NOMINAL',
          semanticIntentTag: 'FORENSIC_SOCIAL_ANALYTICS',
          contextMetadataSnapshot: {
            targetEntityIdentifier: targetEntityIdentifier as string,
            totalEvaluationsProcessedQuantity: validatedEvaluationInputsCollection.length,
            territorialClusterCountQuantity: rawTerritorialClustersCollection.length,
          },
        });

        return finalComprehensiveReport;
      } catch (caughtError: unknown) {
        // --- FASE 7: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---

        /** Propagamos excepciones de validación o lógica ya niveladas. */
        if (caughtError instanceof ValidationException) throw caughtError;
        if (caughtError instanceof InternalSystemException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : 'UNKNOWN_ANALYTICS_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'COMPREHENSIVE_REPORT_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral:
            'Fallo catastrófico en la generación del reporte multidimensional.',
          semanticIntentTag: 'IMPACT_ENGINE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            attemptedEntityIdentifier: targetEntityIdentifierLiteral,
          },
        });

        throw new InternalSystemException('FALLO_CRITICO_EN_GENERACION_DE_REPORTE_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
