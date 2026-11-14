/**
 * @section Newsletter Contracts - Verification Dispatch Schema (Atom)
 * @description Contrato Zod inmutable para validar los parámetros de despacho de
 * verificación Double Opt-In, incluyendo canal, token criptográfico, diccionario
 * localizado, identificador de correlación y credenciales de Resend.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { NewsletterI18nSchema } from '../../../i18n/NewsletterI18n.schema';
import { SubscriptionVerificationChannelSchema } from '../../../schemas/NewsletterSubscriptionRequest.schema';

/**
 * @name DispatchVerificationParametersSchema
 * @description Aduana Zod inmutable para el átomo de despacho de verificación ciudadana.
 */
export const DispatchVerificationParametersSchema = z
  .object({
    targetIdentifierLiteral: z
      .string()
      .trim()
      .min(5, { message: 'INVALID_TARGET_COMMUNICATION_IDENTIFIER' })
      .describe('Identificador destino (correo electrónico o teléfono E.164) del ciudadano.'),
    targetChannelLiteral: SubscriptionVerificationChannelSchema,
    securityTokenLiteral: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_SECURITY_VERIFICATION_TOKEN_UUID' })
      .describe('Token UUID v4 de verificación enviado al ciudadano.'),
    linguisticDictionary: NewsletterI18nSchema,
    correlationIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_CORRELATION_IDENTIFIER_UUID' })
      .describe('Identificador UUID v4 para trazabilidad distribuida de la transacción.'),
    infrastructureSecrets: z
      .object({
        resendApiKeySecret: z
          .string()
          .trim()
          .startsWith('re_', { message: 'INVALID_RESEND_API_KEY_PREFIX' }),
        resendFromEmailLiteral: z
          .string()
          .trim()
          .email({ message: 'INVALID_RESEND_FROM_EMAIL_FORMAT' }),
      })
      .readonly(),
  })
  .readonly();

export type IDispatchVerificationParameters = z.input<typeof DispatchVerificationParametersSchema>;
