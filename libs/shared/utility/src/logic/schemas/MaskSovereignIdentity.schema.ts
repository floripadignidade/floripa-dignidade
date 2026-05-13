/**
 * @section Utility DNA - Identity Masking Contract
 * @description Define el contrato de integridad para la protección de PII.
 * Garantiza que solo estrategias autorizadas sean procesadas por el orquestador.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Catálogo de estrategias de opacidad admitidas por el enjambre.
 */
export const IdentityMaskingStrategySchema = z.enum([
  'BRAZILIAN_DOCUMENT',
  'CITIZEN_NAME',
  'ELECTRONIC_MAIL'
]).describe('Identificador técnico de la estrategia de enmascaramiento.');

export type TIdentityMaskingStrategy = z.infer<typeof IdentityMaskingStrategySchema>;

/**
 * @name MaskIdentityParametersSchema
 * @description Aduana de ADN para la protección de identidad ciudadana.
 */
export const MaskIdentityParametersSchema = z.object({
  /** El rastro de identidad original (Email, CPF, Nombre). */
  rawIdentityLiteral: z.string()
    .describe('Dato sensible original antes de la purificación.'),

  /** La estrategia a aplicar para la anonimización. */
  maskingStrategyLiteral: IdentityMaskingStrategySchema,

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IMaskIdentityParameters = z.infer<typeof MaskIdentityParametersSchema>;
