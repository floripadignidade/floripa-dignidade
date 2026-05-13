/**
 * @section Impact Analytics - Social Efficiency Assembler
 * @description Átomo encargado de la construcción y sellado del reporte de eficiencia.
 * Isola la arquitectura del objeto de salida y garantiza la inmutabilidad.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ReadOnly Integrity.
 */

import type { ISocialEfficiencyReport } from '../../schemas/SocialEfficiencyReport.schema';

interface IAssemblerParameters {
  readonly expenditureIdentifier: string;
  readonly ibgeIdentifier: string;
  readonly territoryNameLiteral: string;
  readonly executedAmountNumeric: number;
  readonly communityTrustScoreNumeric: number;
  readonly efficiencyIndexNumeric: number;
  readonly isAnomalyDetectedBoolean: boolean;
}

/**
 * Ensambla el snapshot forense de eficiencia social.
 */
export const AssembleSocialEfficiencyReport = (
  parameters: IAssemblerParameters
): ISocialEfficiencyReport => {
  return Object.freeze({
    expenditureIdentifier: parameters.expenditureIdentifier,
    territorialContext: {
      ibgeIdentifier: parameters.ibgeIdentifier,
      territoryNameLiteral: parameters.territoryNameLiteral,
    },
    analysisMetrics: {
      executedAmountNumeric: parameters.executedAmountNumeric,
      communityTrustScoreNumeric: parameters.communityTrustScoreNumeric,
      efficiencyIndexNumeric: parameters.efficiencyIndexNumeric,
    },
    anomalyAlertBoolean: parameters.isAnomalyDetectedBoolean,
    generationTimestampISO: new Date().toISOString(),
  });
};
