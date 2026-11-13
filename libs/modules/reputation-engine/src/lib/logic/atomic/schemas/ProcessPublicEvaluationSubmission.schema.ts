/**
 * @section Reputation DNA - Submission Result Contract
 * @description Define el contrato de salida inmutable para el proceso de ingesta.
 * Incluye el pulso original enriquecido con los hallazgos de la auditoría cognitiva.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { PublicEvaluationPulseSchema } from '../../../schemas/PublicEvaluationPulse.schema.js';
import { VeracityAnalysisSchema } from '../../../schemas/VeracityAnalysis.schema.js';

/**
 * @name PublicEvaluationSubmissionResultSchema
 * @description ADN resultante tras la validación estructural y auditoría ética.
 */
export const PublicEvaluationSubmissionResultSchema = z
  .object({
    /** El pulso purificado por la aduana Zod. */
    validatedPulseSnapshot: PublicEvaluationPulseSchema,

    /** Hallazgos de la IA sobre la veracidad del comentario (Si aplica). */
    veracityAuditMetadata: VeracityAnalysisSchema.optional(),

    /** Identificador de trazabilidad único de la transacción completa. */
    correlationIdentifier: z.string().uuid(),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IPublicEvaluationSubmissionResult = z.infer<
  typeof PublicEvaluationSubmissionResultSchema
>;
