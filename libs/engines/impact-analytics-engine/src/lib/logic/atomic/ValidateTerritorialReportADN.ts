/**
 * @section Impact Analytics - Territorial Report Validator
 * @description Átomo de lógica pura encargado de la integridad del reporte geográfico.
 * Valida que la colección de clústeres territoriales cumpla con el esquema soberano.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Sovereign Data.
 * @author Raz Podestá - MetaShark Tech
 */

import { TerritorialImpactReportSchema } from '../../schemas/TerritorialImpactReport.schema';
import type { ITerritorialImpactReport } from '../../schemas/TerritorialImpactReport.schema';
import { ValidationException } from '@floripa-dignidade/exceptions';

/**
 * Valida un objeto de reporte territorial contra su ADN estructural.
 *
 * @param unvalidatedPayload - Datos del reporte generados por el orquestador.
 * @returns {ITerritorialImpactReport} Datos purificados y tipados.
 * @throws {ValidationException} Si el reporte viola el contrato de integridad.
 */
export const ValidateTerritorialReportADN = (
  unvalidatedPayload: unknown,
): ITerritorialImpactReport => {
  const validationResult = TerritorialImpactReportSchema.safeParse(unvalidatedPayload);

  if (!validationResult.success) {
    throw new ValidationException('IMPACT_ANALYTICS.ERRORS.ADN_CORRUPTION', {
      structuralIssuesCollection: validationResult.error.flatten(),
      apparatusIdentifierLiteral: 'TerritorialImpactReportSchema',
    });
  }

  return validationResult.data;
};
