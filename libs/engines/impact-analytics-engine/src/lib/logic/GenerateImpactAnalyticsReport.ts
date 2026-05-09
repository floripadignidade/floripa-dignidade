/**
 * @section Impact Analytics - Comprehensive Report Orchestrator
 * @description Motor superior encargado de ensamblar la analítica bayesiana global
 * y el desglose territorial (Mapa de Calor). Orquesta el enjambre de lógica
 * estadística para generar evidencia inmutable de impacto social.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de entropía en importaciones (sort-imports),
 * sincronización de telemetría forense y cumplimiento de Prosa ISO.
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

/* 1. ADN Estructural del Dominio (Interfaces Internas) */
import type { IEvaluationInput } from '../schemas/EvaluationInput.schema';
import type {
  EvaluatedEntityIdentifier,
  IPopularAcceptanceIndicator,
} from '../schemas/PopularAcceptanceIndicator.schema';
import type { ITerritorialImpactReport } from '../schemas/TerritorialImpactReport.schema';

/* 2. Enjambre Atómico de Inteligencia (Swiss-Watch Swarm) */
import { AggregateBayesianImpactMetrics } from './AggregateBayesianImpactMetrics';
import { AggregateTerritorialSentiment } from './atomic/AggregateTerritorialSentiment';
import { ValidateTerritorialReportADN } from './atomic/ValidateTerritorialReportADN';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const IMPACT_REPORT_ORCHESTRATOR_IDENTIFIER = 'IMPACT_ANALYTICS_REPORT_ENGINE';

/**
 * Genera un reporte de impacto multidimensional basado en entradas de evaluación ciudadana.
 * Implementa la elevación de tipos nominales para garantizar la integridad del Ledger.
 *
 * @param targetEntityIdentifier - UUID de la entidad bajo auditoría (Gasto, Noticia o Denuncia).
 * @param evaluationInputsCollection - Colección agnóstica de pulsos de interacción capturados.
 * @returns {Promise<{ globalIndicator: IPopularAcceptanceIndicator, territorialReport: ITerritorialImpactReport }>}
 * @throws {InternalSystemException} Si el pipeline de agregación colapsa o viola el ADN de datos.
 */
export const GenerateImpactAnalyticsReport = async (
  targetEntityIdentifier: string,
  evaluationInputsCollection: IEvaluationInput[],
): Promise<{
  readonly globalIndicator: IPopularAcceptanceIndicator;
  readonly territorialReport: ITerritorialImpactReport;
}> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    IMPACT_REPORT_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_ANALYTICS_REPORT_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 🛡️ SANEADO Zenith: Casting Soberano.
         * Elevamos el identificador primitivo al tipo nominal 'EvaluatedEntityIdentifier'
         * para cumplir con el contrato de integridad de los motores estadísticos.
         */
        const sealedEntityIdentifier = targetEntityIdentifier as EvaluatedEntityIdentifier;

        // FASE 1: ANÁLISIS BAYESIANO GLOBAL (Confianza Ponderada por Autoridad)
        const globalIndicatorSnapshot = await AggregateBayesianImpactMetrics(
          sealedEntityIdentifier,
          evaluationInputsCollection,
        );

        // FASE 2: DESGLOSE TERRITORIAL (Geographic Sentiment Clustering)
        const rawTerritorialClustersCollection = await AggregateTerritorialSentiment(
          evaluationInputsCollection,
          correlationIdentifier,
        );

        // FASE 3: CONSOLIDACIÓN Y ADUANA DE ADN (Structural Integrity Check)
        const territorialReportSnapshot = ValidateTerritorialReportADN({
          targetEntityIdentifier: sealedEntityIdentifier,
          territorialClustersCollection: rawTerritorialClustersCollection,
          generationTimestampISO: new Date().toISOString(),
        });

        // 4. REPORTE DE ÉXITO OPERACIONAL (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: IMPACT_REPORT_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IMPACT_REPORT_CONSOLIDATED',
          correlationIdentifier,
          messageContentLiteral: 'Reporte multidimensional de impacto generado con éxito.',
          contextMetadataSnapshot: {
            targetEntityIdentifier: sealedEntityIdentifier,
            territorialClusterCountQuantity: rawTerritorialClustersCollection.length,
            totalEvaluationsProcessedQuantity: evaluationInputsCollection.length,
          },
        });

        return {
          globalIndicator: globalIndicatorSnapshot,
          territorialReport: territorialReportSnapshot,
        };

      } catch (caughtExecutionError: unknown) {
        // 5. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: IMPACT_REPORT_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'REPORT_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la generación del reporte de impacto social.',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            attemptedEntityId: targetEntityIdentifier,
          },
        });

        throw new InternalSystemException('FALLO_CRITICO_EN_GENERACION_DE_REPORTE_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          evaluatedEntityIdentifierLiteral: targetEntityIdentifier,
          correlationIdentifier,
        });
      }
    },
  );
};
