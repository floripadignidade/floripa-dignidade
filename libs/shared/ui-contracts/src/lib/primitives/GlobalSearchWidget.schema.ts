/**
 * @section UI Contracts - Global Search Widget DNA
 * @description Define el contrato de integridad para el motor de descubrimiento.
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 */

import { z } from 'zod';
import { UiPrimitivesBaseSchema } from './UiPrimitives.schema';

export const GlobalSearchWidgetPropertiesSchema = z
  .object({
    placeholderTextLiteral: z.string().default('¿Qué estás buscando?'),
    minimumCharacterQuantityToSearch: z.number().int().default(3),
    isKeyboardShortcutEnabled: z.boolean().default(true),
    labels: z
      .object({
        inputPlaceholderLiteral: z.string().optional(),
        accessibilityLabelLiteral: z.string().optional(),
        searchingStatusLiteral: z.string().default('Explorando...'),
      })
      .optional(),
  })
  .merge(UiPrimitivesBaseSchema)
  .readonly();

export type IGlobalSearchWidgetProperties = z.infer<typeof GlobalSearchWidgetPropertiesSchema>;
