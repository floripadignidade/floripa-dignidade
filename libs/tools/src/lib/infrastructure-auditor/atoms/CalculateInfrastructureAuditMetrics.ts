/**
 * @section Infrastructure Auditor - SRE Metrics Calculation Atom
 * @description Átomo de lógica pura encargado de computar las estadísticas consolidadas
 * de disponibilidad, salud y estado operacional de los proveedores evaluados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';

export interface ICalculatedInfrastructureMetricsSnapshot {
  readonly totalTestedProvidersQuantity: number;
  readonly healthyProvidersCountQuantity: number;
  readonly compromisedProvidersCountQuantity: number;
  readonly isInfrastructureFullyOperationalBoolean: boolean;
}

/**
 * Calcula las métricas de fiabilidad a partir de los snapshots individuales de las sondas.
 *
 * @param probesResultsCollection - Matriz inmutable de diagnósticos emitidos por las sondas.
 * @returns {ICalculatedInfrastructureMetricsSnapshot} Métricas consolidadas selladas.
 */
export const CalculateInfrastructureAuditMetrics = (
  probesResultsCollection: readonly IIndividualProviderAuditSnapshot[],
): ICalculatedInfrastructureMetricsSnapshot => {
  const totalTestedProvidersQuantity = probesResultsCollection.length;

  const healthyProvidersCountQuantity = probesResultsCollection.filter(
    (individualProbeSnapshot) =>
      individualProbeSnapshot.probeStatusLiteral === 'NOMINAL_OPERATIONAL',
  ).length;

  const compromisedProvidersCountQuantity = probesResultsCollection.filter(
    (individualProbeSnapshot) =>
      individualProbeSnapshot.probeStatusLiteral === 'UNREACHABLE_FAILURE' ||
      individualProbeSnapshot.probeStatusLiteral === 'AUTHENTICATION_REJECTED',
  ).length;

  const isInfrastructureFullyOperationalBoolean =
    compromisedProvidersCountQuantity === 0 &&
    probesResultsCollection.every(
      (individualProbeSnapshot) =>
        individualProbeSnapshot.probeStatusLiteral === 'NOMINAL_OPERATIONAL' ||
        individualProbeSnapshot.probeStatusLiteral === 'DEGRADED_LATENCY',
    );

  return Object.freeze({
    totalTestedProvidersQuantity,
    healthyProvidersCountQuantity,
    compromisedProvidersCountQuantity,
    isInfrastructureFullyOperationalBoolean,
  });
};
