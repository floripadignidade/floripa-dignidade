/**
 * @section Reputation Logic - Submission Outcome Reporter (Atom)
 * @description Átomo encargado de la clasificación telemétrica y reporte de
 * resultados tras la ingesta de reputación. Traduce veredictos cognitivos
 * en señales de visibilidad para el Neural Sentinel.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Solución al error TS2379 (exactOptionalPropertyTypes) mediante
 * la inclusión explícita de 'undefined' en el contrato de unión.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import type { IPublicEvaluationPulse } from '../../schemas/PublicEvaluationPulse.schema';
import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'REPUTATION_OUTCOME_REPORTER_ATOM';

/**
 * @interface IReportOutcomeParameters
 * @description Contrato inmutable para la emisión de señales de resultado.
 * 🛡️ LEY ZENITH: Se permite 'undefined' explícitamente para cumplir con
 * las restricciones de tipos opcionales estrictos del compilador.
 */
export interface IReportOutcomeParameters {
  readonly validatedPulseSnapshot: IPublicEvaluationPulse;
  readonly veracityAuditMetadata: IVeracityAnalysis | undefined;
  readonly correlationIdentifier: string;
}

/**
 * Clasifica y despacha el reporte final de la transacción de reputación.
 * Implementa el patrón "Fire-and-Forget" para no bloquear el flujo principal.
 *
 * @param parametersSnapshot - Snapshot conteniendo el pulso y la auditoría de veracidad.
 * @returns {void}
 */
export const ReportReputationSubmissionOutcome = (
  parametersSnapshot: IReportOutcomeParameters
): void => {
  const {
    validatedPulseSnapshot,
    veracityAuditMetadata,
    correlationIdentifier
  } = parametersSnapshot;

  /**
   * @section Triaje de Resiliencia
   * Si la auditoría no existe, asumimos neutralidad informativa.
   */
  const isRejectionRecommendedBoolean = veracityAuditMetadata?.moderationActionSuggestion === 'REJECT';

  void EmitTelemetrySignal({
    severityLevelLiteral: isRejectionRecommendedBoolean ? 'WARNING' : 'INFO',
    moduleIdentifierLiteral: ATOM_IDENTIFIER,
    operationCodeLiteral: 'EVALUATION_INGESTION_NOMINAL',
    correlationIdentifier,
    messageContentLiteral: 'REPUTATION.LOGS.SUBMISSION_NOMINAL',
    semanticIntentTag: 'REPUTATION_TRUST_INGESTION',
    contextMetadataSnapshot: {
      targetEntityTypeLiteral: validatedPulseSnapshot.targetEntityType,
      veracityScoreNumeric: veracityAuditMetadata?.veracityConfidenceScoreNumeric ?? 1.0,
      moderationActionLiteral: veracityAuditMetadata?.moderationActionSuggestion ?? 'APPROVE',
    },
  });
};
