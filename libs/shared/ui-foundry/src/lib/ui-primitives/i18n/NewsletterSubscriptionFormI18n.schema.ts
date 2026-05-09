/**
 * @section i18n DNA - Newsletter Form Dictionary Schema
 * @description Contrato de traducción para el componente de suscripción.
 */

import { z } from 'zod';

export const NewsletterSubscriptionFormI18nSchema = z.object({
  labels: z.object({
    inputPlaceholderLiteral: z.string(),
    submitButtonLiteral: z.string(),
    submittingStatusLiteral: z.string(),
    consentCheckboxLiteral: z.string(),
  }),
  messages: z.object({
    successHeadlineLiteral: z.string(),
    successDescriptionLiteral: z.string(),
    errorGenericLiteral: z.string(),
  }),
  validation: z.object({
    emailRequiredLiteral: z.string(),
    emailInvalidLiteral: z.string(),
    consentRequiredLiteral: z.string(),
  })
}).readonly();

export type INewsletterSubscriptionFormI18n = z.infer<typeof NewsletterSubscriptionFormI18nSchema>;
