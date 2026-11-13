/**
 * @section Reputation DNA - Veracity Audit Contract
 * @description Define el contrato de integridad para la auditoría cognitiva de veracidad.
 * Garantiza que el contenido a auditar y el contexto sean inalterables.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @name AnalyzeEvaluationVeracityParametersSchema
 * @description Aduana de entrada para el motor de escaneo de veracidad.
 */
export const AnalyzeEvaluationVeracityParametersSchema = z
  .object({
    /** El contenido cualitativo (comentario/testimonio) a auditar por la IA. */
    qualitativeContentLiteral: z
      .string()
      .min(10, { message: 'CONTENT_TOO_SHORT_FOR_ANALYSIS' })
      .max(2000, { message: 'CONTENT_EXCEEDS_COGNITIVE_LIMIT' })
      .describe('Texto argumentativo del ciudadano para el escaneo ético.'),

    /** Identificador de la entidad relacionada (Gasto, Noticia, etc). */
    targetEntityIdentifier: z
      .string()
      .uuid()
      .describe('Vínculo físico con la entidad que recibe la evaluación.'),

    /** Identificador de trazabilidad del hilo de ejecución. */
    correlationIdentifier: z.string().uuid(),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IAnalyzeEvaluationVeracityParameters = z.infer<
  typeof AnalyzeEvaluationVeracityParametersSchema
>;
