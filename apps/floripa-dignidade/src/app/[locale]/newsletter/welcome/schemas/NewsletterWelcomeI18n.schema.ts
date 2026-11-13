import { z } from 'zod';

/**
 * @section UI DNA - Newsletter Welcome Schema
 * @description Define el contrato de contenido para la página de éxito de suscripción.
 * Protocolo OEDP-V16.0 - Sovereign Data & ReadOnly Integrity.
 */
export const NewsletterWelcomeI18nSchema = z
  .object({
    hero: z.object({
      headlineLiteral: z.string(),
      descriptionLiteral: z.string(),
    }),
    actions: z.object({
      primaryActionLabelLiteral: z.string(),
      secondaryActionLabelLiteral: z.string(),
    }),
    /** 🛡️ MEJORA: Extracción de textos de soporte secundario */
    supportSection: z.object({
      newsHeadlineLiteral: z.string(),
      newsDescriptionLiteral: z.string(),
      dataHeadlineLiteral: z.string(),
      dataDescriptionLiteral: z.string(),
    }),
    metadata: z.object({
      pageTitleLiteral: z.string(),
    }),
  })
  .readonly();

export type INewsletterWelcomeI18n = z.infer<typeof NewsletterWelcomeI18nSchema>;
