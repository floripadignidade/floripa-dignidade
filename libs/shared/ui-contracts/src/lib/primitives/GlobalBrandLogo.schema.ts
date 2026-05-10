/**
 * @section UI Contracts - Global Brand Logo DNA
 * @description Define el contrato de integridad para la identidad visual.
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 * SANEADO Zenith: Resolución de TS2345 mediante fusión con Base Schema.
 */

import { z } from 'zod';
import { UiPrimitivesBaseSchema } from './UiPrimitives.schema';

/**
 * @name GlobalBrandLogoPropertiesSchema
 * @description Aduana de ADN para el Logotipo. Fusiona la identidad visual
 * con los planos base de accesibilidad y auditoría.
 */
export const GlobalBrandLogoPropertiesSchema = z.object({
  imageWidthPixelQuantity: z.number().default(180),
  imageHeightPixelQuantity: z.number().default(60),
  isNavigationLinkEnabledBoolean: z.boolean().default(true),
  visualVariantLiteral: z.enum(['STANDARD', 'MONOCHROME_WHITE']).default('STANDARD'),
  labels: z.object({
    logoAlternativeTextLiteral: z.string().min(1),
    navigationAriaLabelLiteral: z.string().min(1),
  }).readonly(),
})
/** 🛡️ SANEADO: Fusión con el objeto base (ZodObject) antes de sellar */
.merge(UiPrimitivesBaseSchema)
.readonly();

export type IGlobalBrandLogoProperties = z.infer<typeof GlobalBrandLogoPropertiesSchema>;
