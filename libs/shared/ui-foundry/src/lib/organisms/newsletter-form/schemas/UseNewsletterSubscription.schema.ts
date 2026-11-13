/**
 * @section Shared UI Foundry - Newsletter Subscription Hook Contracts (Atom)
 * @description Define los contratos Zod inmutables y valores por defecto para parametrizar
 * e integrar el flujo de suscripción en múltiples aplicaciones (Portal, CMS o sitios aliados).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { z } from 'zod';

/**
 * @name NEWSLETTER_SUBSCRIPTION_DEFAULTS
 * @description Valores por defecto inmutables para transporte HTTP y canal de verificación.
 */
export const NEWSLETTER_SUBSCRIPTION_DEFAULTS = Object.freeze({
  VERIFICATION_CHANNEL_LITERAL: 'ELECTRONIC_MAIL' as const,
  REQUEST_TIMEOUT_IN_MILLISECONDS_QUANTITY: 10000,
  CORRELATION_HEADER_NAME_LITERAL: 'X-Floripa-Correlation-ID',
  ACQUISITION_SOURCE_LITERAL: 'WEB_PORTAL_NEWSLETTER_FORM',
});

/**
 * @name SubscriptionVerificationChannelSchema
 * @description Canales de verificación admitidos por el gateway de suscripción.
 */
export const SubscriptionVerificationChannelSchema = z
  .enum(['ELECTRONIC_MAIL', 'WHATSAPP_MESSAGE', 'SHORT_MESSAGE_SERVICE'])
  .describe('Canal físico de verificación Double Opt-In para la suscripción ciudadana.');

export type TSubscriptionVerificationChannel = z.infer<
  typeof SubscriptionVerificationChannelSchema
>;

/**
 * @name NewsletterSubscriptionHookParametersSchema
 * @description Validador de frontera para parámetros de configuración del hook en cualquier app.
 */
export const NewsletterSubscriptionHookParametersSchema = z
  .object({
    errorGenericLiteral: z
      .string()
      .min(1, { message: 'ERROR_GENERIC_LITERAL_REQUIRED' })
      .describe('Mensaje localizado presentado al usuario ante un fallo de transporte o gateway.'),
    targetApiEndpointPathLiteral: z
      .string()
      .trim()
      .refine(
        (endpointLiteral: string): boolean =>
          endpointLiteral.startsWith('/') || /^https?:\/\//.test(endpointLiteral),
        { message: 'TARGET_API_ENDPOINT_MUST_BE_RELATIVE_OR_HTTP_URL' },
      )
      .describe('Ruta relativa o URL absoluta del gateway de suscripción.'),
    preferredLinguisticLocaleIdentifier: SupportedLocaleSchema.optional().describe(
      'Idioma BCP 47 explícito; si se omite se detecta dinámicamente del documento/ruta/navegador.',
    ),
    verificationChannelPreference: SubscriptionVerificationChannelSchema.default(
      NEWSLETTER_SUBSCRIPTION_DEFAULTS.VERIFICATION_CHANNEL_LITERAL,
    ),
    acquisitionSourceIdentifier: z
      .string()
      .min(2)
      .default(NEWSLETTER_SUBSCRIPTION_DEFAULTS.ACQUISITION_SOURCE_LITERAL)
      .describe('Identificador de la aplicación o zona donde se originó la suscripción.'),
    requestTimeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(1000)
      .max(30000)
      .default(NEWSLETTER_SUBSCRIPTION_DEFAULTS.REQUEST_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    correlationHeaderNameLiteral: z
      .string()
      .min(3)
      .default(NEWSLETTER_SUBSCRIPTION_DEFAULTS.CORRELATION_HEADER_NAME_LITERAL),
    customHeadersMapping: z.record(z.string(), z.string()).optional(),
  })
  .readonly();

/**
 * @name SubscriptionGatewayResponseSchema
 * @description Contrato esperado del cuerpo JSON retornado por el gateway de suscripción.
 */
export const SubscriptionGatewayResponseSchema = z
  .object({
    isOperationSuccessfulBoolean: z.boolean().optional(),
    trackingIdentifier: z.string().optional(),
    errorIdentifierLiteral: z.string().optional(),
  })
  .passthrough()
  .readonly();

export type ISubscriptionGatewayResponse = z.infer<typeof SubscriptionGatewayResponseSchema>;
