/**
 * @section Impact Analytics - Territorial Aproval Lookup
 * @description Átomo de lógica pura encargado de extraer el score de aprobación
 * de un territorio específico dentro de un reporte de impacto.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

import type { ITerritorialImpactReport } from '../../schemas/TerritorialImpactReport.schema';

/**
 * Busca la métrica de confianza agregada para un territorio.
 * Si el territorio no posee rastro de datos, retorna incertidumbre neutral (0.5).
 *
 * @param targetTerritoryIdentifier - Código técnico (IBGE) del territorio.
 * @param globalImpactReport - Reporte territorial completo.
 * @returns {{ trustScoreNumeric: number, territoryNameLiteral: string }}
 */
export const IdentifyTerritorialAprovalScore = (
  targetTerritoryIdentifier: string,
  globalImpactReport: ITerritorialImpactReport,
): { readonly trustScoreNumeric: number; readonly territoryNameLiteral: string } => {
  const matchingTerritoryCluster = globalImpactReport.territorialClustersCollection.find(
    (cluster) => cluster.territoryIdentifierLiteral === targetTerritoryIdentifier,
  );

  return {
    trustScoreNumeric: matchingTerritoryCluster?.aggregatedTrustScoreNumeric ?? 0.5,
    territoryNameLiteral: matchingTerritoryCluster?.territoryIdentifierLiteral ?? 'GLOBAL_FLORIPA',
  };
};
