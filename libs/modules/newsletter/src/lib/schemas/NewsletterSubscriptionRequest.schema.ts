/**
 * @section Newsletter Contracts - Subscription Request Schema
 * @description Define la estructura inmutable para la solicitud inicial de suscripción
 * ciudadana. Soporta múltiples canales de verificación Double Opt-In y consume el catálogo
 * único de idiomas BCP 47 desde `@floripa-dignidade/contracts` (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 y LGPD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { z } from 'zod';

/**
 * @name SubscriptionVerificationChannelSchema
 * @description Canales físicos admitidos para despachar el código de confirmación Double Opt-In.
 */
export const SubscriptionVerificationChannelSchema = z
  .enum(['ELECTRONIC_MAIL', 'WHATSAPP_MESSAGE', 'SHORT_MESSAGE_SERVICE'])
  .describe('Canal físico por el cual se enviará el enlace o código de confirmación.');

export type ISubscriptionVerificationChannel = z.infer<
  typeof SubscriptionVerificationChannelSchema
>;

/**
 * @name NewsletterSubscriptionRequestSchema
 * @description Validador perimetral para la solicitud de entrada al ecosistema informativo.
 */
export const NewsletterSubscriptionRequestSchema = z
  .object({
    /**
     * Identificador de contacto (correo electrónico o teléfono en formato internacional E.164).
     */
    communicationIdentifierLiteral: z
      .string()
      .trim()
      .min(5, { message: 'COMMUNICATION_IDENTIFIER_TOO_SHORT' })
      .describe('Correo electrónico o número telefónico en formato E.164 del ciudadano.'),

    verificationChannelPreference: SubscriptionVerificationChannelSchema,

    preferredLinguisticLocaleIdentifier: SupportedLocaleSchema.default(
      DEFAULT_LOCALE_IDENTIFIER,
    ).describe('Código de localización BCP 47 activo preferido por el ciudadano.'),

    hasGivenPrivacyConsentBoolean: z
      .literal(true, {
        errorMap: () => ({ message: 'PRIVACY_CONSENT_MANDATORY' }),
      })
      .describe('Confirmación explícita de consentimiento para tratamiento de datos (LGPD).'),
  })
  .readonly();

export type INewsletterSubscriptionRequest = z.infer<typeof NewsletterSubscriptionRequestSchema>;
