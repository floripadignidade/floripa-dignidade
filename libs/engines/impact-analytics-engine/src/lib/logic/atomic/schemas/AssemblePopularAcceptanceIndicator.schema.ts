// libs/engines/impact-analytics-engine/src/lib/logic/atomic/schemas/AssemblePopularAcceptanceIndicator.schema.ts

/**
 * @section Impact Analytics Contracts - Indicator Assembler Parameters Schema (Atom)
 * @description Contrato Zod inmutable para validar los parámetros requeridos al
 * ensamblar y sellar un indicador de aceptación popular bayesiana.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  type EvaluatedEntityIdentifier,
  EvaluatedEntityIdentifierSchema,
} from '../../../schemas/PopularAcceptanceIndicator.schema';

/**
 * @name AssemblerParametersSchema
 * @description Aduana Zod inmutable para validar los parámetros de ensamblaje del indicador.
 */
export const AssemblerParametersSchema = z
  .object({
    targetEntityIdentifier: EvaluatedEntityIdentifierSchema,
    weightedTrustScoreNumeric: z
      .number()
      .min(0, { message: 'WEIGHTED_TRUST_SCORE_MUST_BE_NON_NEGATIVE' })
      .max(1, { message: 'WEIGHTED_TRUST_SCORE_EXCEEDS_UNIT_MAXIMUM' }),
    totalTrustWeightAccumulator: z
      .number()
      .nonnegative({ message: 'TOTAL_TRUST_WEIGHT_MUST_BE_NON_NEGATIVE' }),
    participantQuantity: z
      .number()
      .int()
      .nonnegative({ message: 'PARTICIPANT_QUANTITY_MUST_BE_NON_NEGATIVE_INTEGER' }),
    distributionMetadata: z
      .object({
        verifiedCitizensQuantity: z.number().int().nonnegative(),
        anonymousInteractionsQuantity: z.number().int().nonnegative(),
      })
      .readonly(),
  })
  .readonly();

/**
 * @interface IAssemblerParameters
 * @description Parámetros inmutables para la construcción del indicador de impacto.
 */
export interface IAssemblerParameters {
  readonly targetEntityIdentifier: EvaluatedEntityIdentifier;
  readonly weightedTrustScoreNumeric: number;
  readonly totalTrustWeightAccumulator: number;
  readonly participantQuantity: number;
  readonly distributionMetadata: {
    readonly verifiedCitizensQuantity: number;
    readonly anonymousInteractionsQuantity: number;
  };
}
