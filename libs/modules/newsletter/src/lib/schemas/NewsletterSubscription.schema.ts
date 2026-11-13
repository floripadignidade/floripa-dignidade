/**
 * @section Newsletter Contracts - Subscription Schema
 * @description Contrato institucional inmutable para la suscripción de ciudadanos al boletín.
 * Consume el validador de idiomas BCP 47 desde `@floripa-dignidade/contracts` (ADR 0030)
 * y garantiza el consentimiento explícito conforme a la LGPD (Lei 13.709/2018).
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
 * @name NewsletterSubscriptionSchema
 * @description Validador perimetral para los datos de alta ciudadana en el boletín informativo.
 */
export const NewsletterSubscriptionSchema = z
  .object({
    /** Dirección de correo electrónico normalizada en minúsculas. */
    electronicMailAddressLiteral: z
      .string()
      .trim()
      .email({ message: 'INVALID_EMAIL_FORMAT' })
      .transform((emailAddressInputLiteral: string) => emailAddressInputLiteral.toLowerCase())
      .describe('Correo electrónico oficial del ciudadano.'),

    /** Identificador BCP 47 del idioma preferido para segmentación de comunicaciones. */
    preferredLinguisticLocaleIdentifier: SupportedLocaleSchema.default(
      DEFAULT_LOCALE_IDENTIFIER,
    ).describe('Código de localización BCP 47 activo preferido por el ciudadano.'),

    /** Validación de consentimiento inequívoco (Conformidad LGPD). */
    hasGivenPrivacyConsentBoolean: z
      .literal(true, {
        errorMap: () => ({ message: 'CONSENT_REQUIRED' }),
      })
      .describe('Indica si el ciudadano aceptó los términos de privacidad vigentes.'),

    /** Metadatos de procedencia para observabilidad y análisis de conversión. */
    acquisitionSourceIdentifier: z
      .string()
      .default('PORTAL_FOOTER')
      .describe('Identificador del punto de entrada donde se originó la suscripción.'),
  })
  .readonly();

export type INewsletterSubscription = z.infer<typeof NewsletterSubscriptionSchema>;
