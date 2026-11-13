/**
 * @section Impact Analytics - Holistic Social Anomaly Detector
 * @description Átomo encargado de la inferencia de irregularidades sociales.
 * Aplica una matriz de decisión multidimensional cruzando datos financieros,
 * confianza bayesiana, consenso y certidumbre estadística.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { SocialAnomalyVerdictSchema } from '../../schemas/SocialAnomalyVerdict.schema';
import type { ISocialAnomalyVerdict } from '../../schemas/SocialAnomalyVerdict.schema';

/**
 * @interface IAnomalyDetectionParameters
 * @description Snapshot inmutable de las métricas requeridas para la inferencia.
 */
export interface IAnomalyDetectionParameters {
  readonly totalExecutedAmountNumeric: number;
  readonly weightedTrustScoreNumeric: number;
  readonly communityConsensusIndexNumeric: number;
  readonly statisticalConfidenceLevelNumeric: number;
  readonly correlationIdentifier?: string;
}

/**
 * @section Umbrales Institucionales (Ground Truth)
 */
const THRESHOLDS = {
  MASIVE_SPENDING_NUMERIC: 150000, // Gastos > 150k se consideran de alta saliencia.
  CRITICAL_TRUST_LIMIT: 0.35, // Menos del 35% de confianza es alarma.
  CRITICAL_CONCENSUS_LIMIT: 0.2, // Menos del 20% de consenso es fractura social.
  MINIMUM_RELIABLE_CONFIDENCE: 0.4, // Menos del 40% de certidumbre es "datos insuficientes".
};

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'SOCIAL_ANOMALY_DETECTOR_ATOM';

/**
 * Ejecuta la detección holística de anomalías sociales.
 * Implementa el patrón "Reasoning Engine": genera un veredicto con justificación.
 *
 * @param parameters - Métricas del gasto y percepción civil.
 * @returns {Promise<ISocialAnomalyVerdict>} Veredicto validado y sellado.
 */
export const DetectSocialAnomaly = async (
  parameters: IAnomalyDetectionParameters,
): Promise<ISocialAnomalyVerdict> => {
  const correlationIdentifier = parameters.correlationIdentifier ?? GenerateCorrelationIdentifier();

  // 1. INFERENCIA DE DIMENSIÓN A: DISCREPANCIA CRÍTICA
  const isMasiveSpendingBoolean =
    parameters.totalExecutedAmountNumeric > THRESHOLDS.MASIVE_SPENDING_NUMERIC;
  const isTrustCriticalBoolean =
    parameters.weightedTrustScoreNumeric < THRESHOLDS.CRITICAL_TRUST_LIMIT;
  const hasCriticalDiscrepancyBoolean = isMasiveSpendingBoolean && isTrustCriticalBoolean;

  // 2. INFERENCIA DE DIMENSIÓN B: POLARIZACIÓN FRACTURADA
  const hasHighPolarizationBoolean =
    parameters.communityConsensusIndexNumeric < THRESHOLDS.CRITICAL_CONCENSUS_LIMIT &&
    parameters.statisticalConfidenceLevelNumeric > THRESHOLDS.MINIMUM_RELIABLE_CONFIDENCE;

  // 3. INFERENCIA DE DIMENSIÓN C: CEGUERA OPERATIVA (Baja participación)
  const isParticipationInsufficientBoolean =
    parameters.statisticalConfidenceLevelNumeric < 0.15 && isMasiveSpendingBoolean;

  /**
   * @section Orquestación de Veredicto (Triage)
   * Determinamos la anomalía más severa para el reporte.
   */
  let verdict: Partial<ISocialAnomalyVerdict> = {
    isAnomalyDetectedBoolean: false,
    anomalySeverityLiteral: 'NOMINAL_HEALTH',
    anomalyProbabilityNumeric: 0,
    inferenceReasoningLiteral: 'IMPACT_ANALYTICS.ANOMALIES.NOMINAL_HEALTH_REASON',
  };

  if (hasCriticalDiscrepancyBoolean) {
    verdict = {
      isAnomalyDetectedBoolean: true,
      anomalySeverityLiteral: 'CRITICAL_DISCREPANCY',
      anomalyProbabilityNumeric: 0.95,
      inferenceReasoningLiteral: 'IMPACT_ANALYTICS.ANOMALIES.CRITICAL_DISCREPANCY_REASON',
    };
  } else if (hasHighPolarizationBoolean) {
    verdict = {
      isAnomalyDetectedBoolean: true,
      anomalySeverityLiteral: 'HIGH_POLARIZATION',
      anomalyProbabilityNumeric: 0.8,
      inferenceReasoningLiteral: 'IMPACT_ANALYTICS.ANOMALIES.HIGH_POLARIZATION_REASON',
    };
  } else if (isParticipationInsufficientBoolean) {
    verdict = {
      isAnomalyDetectedBoolean: true,
      anomalySeverityLiteral: 'LOW_PARTICIPATION',
      anomalyProbabilityNumeric: 0.7,
      inferenceReasoningLiteral: 'IMPACT_ANALYTICS.ANOMALIES.LOW_PARTICIPATION_REASON',
    };
  }

  // 4. ADUANA DE ADN FINAL (Integrity Check)
  const finalVerdictSnapshot = SocialAnomalyVerdictSchema.parse({
    ...verdict,
    algorithmVersionLiteral: 'HOLISTIC_SRE_V1.0',
  });

  // 5. REPORTE SRE (Visibility)
  void EmitTelemetrySignal({
    severityLevelLiteral: finalVerdictSnapshot.isAnomalyDetectedBoolean ? 'WARNING' : 'INFO',
    moduleIdentifierLiteral: ATOM_IDENTIFIER,
    operationCodeLiteral: 'ANOMALY_DETECTION_COMPLETED',
    correlationIdentifier,
    messageContentLiteral: `Detección finalizada. Anomalía: [${finalVerdictSnapshot.isAnomalyDetectedBoolean}]. Severidad: [${finalVerdictSnapshot.anomalySeverityLiteral}]`,
    semanticIntentTag: 'SOCIAL_ANOMALY_INFERENCE',
    contextMetadataSnapshot: {
      amountNumeric: parameters.totalExecutedAmountNumeric,
      probabilityNumeric: finalVerdictSnapshot.anomalyProbabilityNumeric,
    },
  });

  return finalVerdictSnapshot;
};
