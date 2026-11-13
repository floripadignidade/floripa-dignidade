/**
 * @section Impact Analytics DNA - Evaluation Input Contract
 * @description Define la estructura mínima que el motor requiere para procesar
 * métricas, desacoplando el motor de los módulos de negocio.
 *
 * Protocolo OEDP-V17.0 - Boundary Protection & SRE.
 */

import { z } from 'zod';

export const EvaluationInputSchema = z
  .object({
    /** Valor numérico capturado (0.0 a 1.0). */
    quantitativeTrustScoreNumeric: z.number().min(0).max(1),

    /** Identificador de identidad (Null si es anónimo). */
    evaluatorIdentityIdentifier: z.string().uuid().nullable(),

    /** Contexto geográfico para el mapa de calor (Ej: "TAPERA"). */
    territorialContextLiteral: z.string().optional(),
  })
  .readonly();

export type IEvaluationInput = z.infer<typeof EvaluationInputSchema>;
