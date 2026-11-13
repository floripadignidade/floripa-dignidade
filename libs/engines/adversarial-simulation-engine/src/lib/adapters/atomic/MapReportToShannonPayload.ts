/**
 * @section Adversarial Adapters - Shannon Payload Mapper
 * @description Átomo de lógica pura encargado de enriquecer el reporte forense
 * con directivas semánticas específicas para la IA Shannon.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IForensicAuditReport } from '../../schemas/ForensicAuditReport.schema';

/**
 * Transforma un reporte de auditoría en un objeto compatible con Shannon AI.
 *
 * @param forensicReportSnapshot - Datos de la simulación.
 * @returns {Record<string, unknown>} Payload enriquecido semánticamente.
 */
export const MapReportToShannonPayload = (
  forensicReportSnapshot: IForensicAuditReport,
): Record<string, unknown> => {
  const hasDetectedVulnerabilitiesBoolean =
    forensicReportSnapshot.detectedVulnerabilitiesCollection.length > 0;

  /**
   * @section Inyección de Directivas Shannon
   * Estas claves le indican a la IA en GitHub cómo debe reaccionar en la PR.
   */
  return {
    _shannonDirectives: {
      analyzeForPullRequestBoolean: true,
      requiredActionLiteral: hasDetectedVulnerabilitiesBoolean
        ? 'BLOCK_MERGE_AND_SUGGEST_FIXES'
        : 'APPROVE_SECURITY_CHECK',
    },
    ...forensicReportSnapshot,
  };
};
