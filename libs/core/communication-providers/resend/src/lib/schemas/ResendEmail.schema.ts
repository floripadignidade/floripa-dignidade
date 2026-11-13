/**
 * @section Resend Provider - Email Schema DNA
 * @description Contrato soberano para el envío de correos transaccionales.
 * Protocolo OEDP-V13.0 - Zero Abbreviations.
 */

import { z } from 'zod';

/** Esquema de configuración técnica del proveedor. */
export const ResendConfigurationSchema = z
  .object({
    securityApiKeySecret: z
      .string()
      .startsWith('re_')
      .describe('Token de autorización oficial de Resend.'),

    defaultFromAddressLiteral: z
      .string()
      .email()
      .describe('Dirección de remitente autorizada por el DNS de la ONG.'),
  })
  .readonly();

/** Esquema de carga útil para una transmisión de correo. */
export const TransactionalEmailPayloadSchema = z
  .object({
    targetRecipientAddressLiteral: z.string().email(),
    emailSubjectLiteral: z.string().min(5).max(100),
    emailHtmlContentLiteral: z.string().min(10),
    trackingCategoryIdentifier: z.string().default('GENERAL_NOTIFICATION'),
  })
  .readonly();

export type IResendConfiguration = z.infer<typeof ResendConfigurationSchema>;
export type ITransactionalEmailPayload = z.infer<typeof TransactionalEmailPayloadSchema>;
