import { z } from 'zod';

export const NewsletterI18nSchema = z
  .object({
    email: z.object({
      confirmationSubjectLiteral: z.string(),
      greetingLiteral: z.string(),
      instructionLiteral: z.string(),
      trackingFooterLiteral: z.string(),
    }),
  })
  .readonly();

export type INewsletterI18n = z.infer<typeof NewsletterI18nSchema>;
