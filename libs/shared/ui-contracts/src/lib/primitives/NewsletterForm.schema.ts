/**
 * @section UI Contracts - Newsletter Form DNA
 * @description Define la estructura de validación de datos y las propiedades
 * del componente de suscripción.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 */

import { z } from 'zod';
import { UiPrimitivesBaseSchema } from './UiPrimitives.schema';

/**
 * @name NewsletterSubscriptionFormSchema
 * @description Aduana de ADN para los datos de entrada del ciudadano.
 */
export const NewsletterSubscriptionFormSchema = z.object({
  electronicMailAddressLiteral: z.string()
    .min(1, { message: 'ERROR_EMAIL_REQUIRED' })
    .email({ message: 'ERROR_EMAIL_INVALID' })
    .transform((value) => value.toLowerCase().trim()),

  hasGivenPrivacyConsentBoolean: z.boolean()
    .refine((value) => value === true, { message: 'ERROR_CONSENT_REQUIRED' }),
}).readonly();

/**
 * @name NewsletterSubscriptionFormPropertiesSchema
 * @description Contrato de propiedades para el componente visual.
 */
export const NewsletterSubscriptionFormPropertiesSchema = z.object({
  targetApiEndpointPathLiteral: z.string().default('/api/newsletter/subscribe'),
  visualVariantLiteral: z.enum(['STANDARD', 'MINIMAL']).default('STANDARD'),
}).merge(UiPrimitivesBaseSchema).readonly();

export type INewsletterSubscriptionForm = z.infer<typeof NewsletterSubscriptionFormSchema>;
export type INewsletterSubscriptionFormProperties = z.infer<typeof NewsletterSubscriptionFormPropertiesSchema>;
