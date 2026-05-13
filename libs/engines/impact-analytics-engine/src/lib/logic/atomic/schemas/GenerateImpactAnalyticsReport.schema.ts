/**
 * @section Impact Analytics DNA - Report Generation Contract
 * @description Define el contrato de integridad para la creación de reportes
 * multidimensionales. Garantiza que la entidad y sus evaluaciones cumplan
 * con el estándar institucional antes de procesar la analítica.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';
import { EvaluatedEntityIdentifierSchema } from '../../../schemas/PopularAcceptanceIndicator.schema';
import { EvaluationInputSchema } from '../../../schemas/EvaluationInput.schema';

/**
 * @name GenerateImpactAnalyticsReportSchema
 * @description Aduana de entrada para el orquestador de reportes.
 */
export const GenerateImpactAnalyticsReportSchema = z.object({
  /** Identificador nominal de la entidad (Branded Type). */
  targetEntityIdentifier: EvaluatedEntityIdentifierSchema,

  /** Colección de pulsos de interacción a procesar. */
  evaluationInputsCollection: z.array(EvaluationInputSchema)
    .min(1, { message: 'EMPTY_EVALUATION_COLLECTION_FOR_REPORT' }),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IGenerateImpactAnalyticsReportParameters = z.infer<typeof GenerateImpactAnalyticsReportSchema>;
