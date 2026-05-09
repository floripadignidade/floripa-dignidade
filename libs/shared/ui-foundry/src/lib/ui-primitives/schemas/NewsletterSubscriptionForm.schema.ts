/**
 * @section UI DNA - Newsletter Subscription Form Schema
 * @description Define la estructura de validación para la interacción del usuario.
 *
 * Protocolo OEDP-V15.0 - Sovereign Data & Pure Validation.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

export const NewsletterSubscriptionFormSchema = z.object({
  electronicMailAddressLiteral: z.string()
    .min(1, { message: 'ERROR_EMAIL_REQUIRED' })
    .email({ message: 'ERROR_EMAIL_INVALID' })
    .transform((value) => value.toLowerCase().trim())
    .describe('Dirección de correo capturada para la red de transparencia.'),

  hasGivenPrivacyConsentBoolean: z.boolean()
    .refine((value) => value === true, { message: 'ERROR_CONSENT_REQUIRED' })
    .describe('Estado del consentimiento legal para protección de datos (LGPD).'),
}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type INewsletterSubscriptionForm = z.infer<typeof NewsletterSubscriptionFormSchema>;
