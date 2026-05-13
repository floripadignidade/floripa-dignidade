/**
 * @section Reputation Logic - Submission Result Sealer (Atom)
 * @description Átomo de lógica pura encargado del ensamblaje y sellado inmutable
 * del resultado de evaluación. Implementa el patrón de inyección condicional
 * para satisfacer restricciones estrictas de tipos opcionales (TS2379).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Type Sovereignty.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { PublicEvaluationSubmissionResultSchema } from './schemas/ProcessPublicEvaluationSubmission.schema';
import type { IPublicEvaluationPulse } from '../../schemas/PublicEvaluationPulse.schema';
import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema';
import type { IPublicEvaluationSubmissionResult } from './schemas/ProcessPublicEvaluationSubmission.schema';

/**
 * @interface ISealerParameters
 * @description Contrato inmutable para el ensamblaje del resultado final.
 */
interface ISealerParameters {
  readonly validatedPulseSnapshot: IPublicEvaluationPulse;
  readonly veracityAuditMetadata: IVeracityAnalysis | undefined;
  readonly correlationIdentifier: string;
}

/**
 * Ensambla, valida mediante Zod y sella el artefacto de resultado de sumisión.
 *
 * @param parametersSnapshot - Diccionario conteniendo las piezas del resultado.
 * @returns {IPublicEvaluationSubmissionResult} Artefacto validado e inmutable.
 */
export const SealSubmissionResult = (
  parametersSnapshot: ISealerParameters
): IPublicEvaluationSubmissionResult => {
  const {
    validatedPulseSnapshot,
    veracityAuditMetadata,
    correlationIdentifier
  } = parametersSnapshot;

  /**
   * @section Inyección Soberana de Opcionales
   * 🛡️ LEY ZENITH (Fix TS2379): Utilizamos la dispersión de objetos condicional
   * para evitar inyectar la llave si el valor es 'undefined', cumpliendo con
   * el rigor de 'exactOptionalPropertyTypes: true'.
   */
  const finalPayloadSnapshot = {
    validatedPulseSnapshot,
    correlationIdentifier,
    ...(veracityAuditMetadata !== undefined && { veracityAuditMetadata }),
  };

  /**
   * @section Aduana de ADN Final
   * Validamos el ensamble completo contra el esquema de salida del búnker.
   */
  return PublicEvaluationSubmissionResultSchema.parse(finalPayloadSnapshot);
};
