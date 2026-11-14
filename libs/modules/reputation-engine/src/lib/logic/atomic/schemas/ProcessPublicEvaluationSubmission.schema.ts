/**
 * @section Reputation Contracts - Evaluation Submission Result Schema (Atom)
 * @description Contrato Zod inmutable que estructura el resultado consolidado del
 * procesamiento de una evaluación ciudadana, integrando el pulso validado, el dictamen
 * cognitivo opcional de veracidad y el identificador de correlación distribuida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { PublicEvaluationPulseSchema } from '../../../schemas/PublicEvaluationPulse.schema';
import { VeracityAnalysisSchema } from '../../../schemas/VeracityAnalysis.schema';

/**
 * @name PublicEvaluationSubmissionResultSchema
 * @description Contrato inmutable de salida emitido tras validar y auditar una evaluación pública.
 */
export const PublicEvaluationSubmissionResultSchema = z
  .object({
    /** Pulso de evaluación purificado mediante `PublicEvaluationPulseSchema`. */
    validatedPulseSnapshot: PublicEvaluationPulseSchema.describe(
      'Snapshot inmutable del pulso de evaluación ciudadana validado.',
    ),

    /** Resultado de la auditoría ética y de veracidad cuando existe comentario cualitativo. */
    veracityAuditMetadata: VeracityAnalysisSchema.optional().describe(
      'Dictamen opcional de veracidad emitido por el motor de análisis cognitivo.',
    ),

    /** Identificador UUID v4 único para trazabilidad forense distribuida. */
    correlationIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_CORRELATION_IDENTIFIER_UUID' })
      .describe('Identificador de correlación UUID v4 de la transacción completa.'),
  })
  .readonly()
  .describe('Contrato inmutable del resultado de sumisión de evaluación pública.');

export type IPublicEvaluationSubmissionResult = z.infer<
  typeof PublicEvaluationSubmissionResultSchema
>;
