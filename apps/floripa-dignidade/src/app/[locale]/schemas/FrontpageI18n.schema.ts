/**
 * @section Frontpage DNA - Linguistic Schema
 * @description Define el contrato de contenido para la página de inicio.
 *
 * Protocolo OEDP-V15.0 - Sovereign Data & ReadOnly Integrity.
 * Saneamiento: Inclusión de contrato para la sección de conversión (Newsletter).
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const FrontpageI18nSchema = z
  .object({
    hero: z.object({
      badgeLabelLiteral: z.string(),
      headlineMainLiteral: z.string(),
      headlineAccentLiteral: z.string(),
      descriptionLiteral: z.string(),
      primaryActionLabelLiteral: z.string(),
      secondaryActionLabelLiteral: z.string(),
    }),
    features: z.array(
      z.object({
        identifier: z.string(),
        titleLiteral: z.string(),
        descriptionLiteral: z.string(),
      }),
    ),
    /**
     * @section Nueva Sección de Conversión
     * ADN para captación de ciudadanos en la red de transparencia.
     */
    newsletter: z.object({
      sectionHeadlineLiteral: z.string(),
      sectionDescriptionLiteral: z.string(),
    }),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IFrontpageI18n = z.infer<typeof FrontpageI18nSchema>;
