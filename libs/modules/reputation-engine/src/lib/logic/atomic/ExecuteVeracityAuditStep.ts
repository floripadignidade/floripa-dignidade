/**
 * @section Reputation Logic - Veracity Audit Step (Atom)
 * @description Átomo encargado de determinar y ejecutar la auditoría de veracidad
 * cognitiva basándose en la presencia de contenido cualitativo. Isola la lógica
 * de decisión del orquestador principal.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';
import { AnalyzeEvaluationVeracity } from './AnalyzeEvaluationVeracity';
import type { IPublicEvaluationPulse } from '../../schemas/PublicEvaluationPulse.schema';
import type { IVeracityAnalysis } from '../../schemas/VeracityAnalysis.schema';

/**
 * Evalúa el pulso y, si posee comentario, dispara el escaneo ético de la IA.
 *
 * @param validatedPulseSnapshot - ADN del pulso ya validado por la aduana.
 * @param correlationIdentifier - Identificador de trazabilidad del hilo.
 * @returns {Promise<IVeracityAnalysis | undefined>} Resultado de la IA o indefinido si no aplica.
 */
export const ExecuteVeracityAuditStep = async (
  validatedPulseSnapshot: IPublicEvaluationPulse,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<IVeracityAnalysis | undefined> => {

  /**
   * @section Triaje de Requisito Cognitivo
   * Solo enviamos a la IA si existe un rastro textual (testimonio).
   */
  const hasQualitativeContentBoolean = !!validatedPulseSnapshot.qualitativeCommentaryLiteral;

  if (!hasQualitativeContentBoolean) {
    return undefined;
  }

  return await AnalyzeEvaluationVeracity({
    qualitativeContentLiteral: validatedPulseSnapshot.qualitativeCommentaryLiteral as string,
    targetEntityIdentifier: validatedPulseSnapshot.targetEntityIdentifier,
    correlationIdentifier,
  });
};
