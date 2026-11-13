/**
 * @section WhatsApp DNA - Signature Validation Contract
 * @description Define los requisitos para el desafío de integridad de Meta.
 * Protocolo OEDP-V17.0 - Sovereign Data.
 */

import { z } from 'zod';

export const ValidateMetaSignatureSchema = z
  .object({
    /** Cuerpo de la petición en formato texto plano para el cálculo del hash. */
    rawRequestBodyLiteral: z.string().min(1),

    /** Cabecera X-Hub-Signature-256 enviada por los servidores de Meta. */
    xHubSignatureHeaderLiteral: z.string().startsWith('sha256='),
  })
  .readonly();

export type IValidateMetaSignatureParameters = z.infer<typeof ValidateMetaSignatureSchema>;
