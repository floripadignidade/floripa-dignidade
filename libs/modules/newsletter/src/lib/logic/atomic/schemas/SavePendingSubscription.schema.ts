/**
 * @section Newsletter Contracts - Pending Subscription Persistence Schema (Atom)
 * @description Contrato Zod inmutable para validar y normalizar los datos requeridos
 * al registrar una suscripción ciudadana pendiente de verificación Double Opt-In en Supabase.
 * Consume `SupportedLocaleSchema` desde `@floripa-dignidade/contracts` (ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { z } from 'zod';

/**
 * @name SavePendingSubscriptionParametersSchema
 * @description Aduana Zod inmutable para la carga útil de persistencia pendiente.
 */
export const SavePendingSubscriptionParametersSchema = z
  .object({
    emailAddressLiteral: z
      .string()
      .trim()
      .email({ message: 'INVALID_SUBSCRIBER_EMAIL_FORMAT' })
      .transform((emailInputLiteral: string) => emailInputLiteral.toLowerCase())
      .describe('Dirección de correo electrónico normalizada del ciudadano solicitante.'),
    verificationTokenLiteral: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_VERIFICATION_TOKEN_UUID' })
      .describe('Token UUID v4 de un solo uso para confirmación Double Opt-In.'),
    localeIdentifier: SupportedLocaleSchema.describe(
      'Código BCP 47 habilitado preferido por el ciudadano.',
    ),
    correlationIdentifier: z
      .string()
      .trim()
      .uuid({ message: 'INVALID_CORRELATION_IDENTIFIER_UUID' })
      .describe('Identificador UUID v4 de trazabilidad distribuida de la transacción.'),
  })
  .readonly();

export type ISavePendingSubscriptionParameters = z.input<
  typeof SavePendingSubscriptionParametersSchema
>;

export type IValidatedPendingSubscriptionParameters = z.output<
  typeof SavePendingSubscriptionParametersSchema
>;
