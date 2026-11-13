/**
 * @section Adversarial Orchestrators - Forensic Consolidation Atom
 * @description Átomo de lógica pura encargado de la construcción del objeto
 * de reporte inmutable. Realiza la métrica de ejecución y empaquetado de ADN.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Mathematical Precision.
 * @author Raz Podestá - MetaShark Tech
 */

import type { IAdversarialVulnerability } from '../../schemas/AdversarialVulnerability.schema';
import type { IForensicAuditReport } from '../../schemas/ForensicAuditReport.schema';

interface IConsolidationParameters {
  readonly vulnerabilitiesCollection: IAdversarialVulnerability[];
  readonly totalSimulationsExecutedQuantity: number;
  readonly startTimestampNumeric: number;
  readonly endTimestampNumeric: number;
}

/**
 * Ensambla el rastro forense final basado en los resultados de la simulación.
 */
export const ConsolidateForensicReport = (
  parameters: IConsolidationParameters,
): IForensicAuditReport => {
  return {
    reportIdentifier: crypto.randomUUID(),
    totalSimulationsExecutedQuantity: parameters.totalSimulationsExecutedQuantity,
    executionDurationInMillisecondsNumeric:
      parameters.endTimestampNumeric - parameters.startTimestampNumeric,
    detectedVulnerabilitiesCollection: parameters.vulnerabilitiesCollection,
    auditStartTimestampISO: new Date(parameters.startTimestampNumeric).toISOString(),
    auditEndTimestampISO: new Date(parameters.endTimestampNumeric).toISOString(),
  };
};
