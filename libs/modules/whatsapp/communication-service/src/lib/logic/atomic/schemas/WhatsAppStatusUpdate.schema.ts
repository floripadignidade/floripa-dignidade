/**
 * @section WhatsApp Contracts - Message Status Update Schema (Atom)
 * @description Contrato Zod inmutable para validar eventos de actualización de entrega
 * y lectura (`statuses[]`) provenientes del Webhook oficial de Meta WhatsApp Cloud API.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Robustez).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

export const MetaDeliveryStatusLiteralSchema = z
  .enum(['sent', 'delivered', 'read', 'failed', 'deleted'])
  .describe('Estado oficial del ciclo de vida del mensaje emitido por Meta.');

export type TMetaDeliveryStatusLiteral = z.infer<typeof MetaDeliveryStatusLiteralSchema>;

/**
 * Esquema de error asíncrono enviado por Meta cuando el estado es 'failed'.
 */
export const MetaStatusErrorSchema = z
  .object({
    code: z.number().int().describe('Código numérico oficial de error de Meta.'),
    title: z.string().optional(),
    message: z.string().optional(),
    error_data: z
      .object({
        details: z.string().optional(),
      })
      .optional(),
    href: z.string().optional(),
  })
  .readonly();

export type IMetaStatusError = z.infer<typeof MetaStatusErrorSchema>;

/**
 * @name WhatsAppStatusUpdateSchema
 * @description Validador estructural para una entrada individual de actualización de estado.
 */
export const WhatsAppStatusUpdateSchema = z
  .object({
    id: z.string().trim().min(1).describe('Identificador WAMID del mensaje en Meta.'),
    status: MetaDeliveryStatusLiteralSchema,
    timestamp: z
      .string()
      .trim()
      .min(1)
      .describe('Marca temporal en segundos Unix Epoch enviada por Meta.'),
    recipient_id: z
      .string()
      .trim()
      .min(1)
      .optional()
      .describe('Identificador telefónico E.164 del destinatario si está disponible.'),
    recipient_user_id: z
      .string()
      .trim()
      .optional()
      .describe('Identificador de usuario con ámbito de negocio (BSUID) si aplica.'),
    errors: z.array(MetaStatusErrorSchema).optional(),
    conversation: z
      .object({
        id: z.string().optional(),
        category: z.string().optional(),
        expiration_timestamp: z.string().optional(),
      })
      .optional(),
    pricing: z
      .object({
        pricing_model: z.string().optional(),
        category: z.string().optional(),
      })
      .optional(),
  })
  .readonly();

export type IWhatsAppStatusUpdate = z.infer<typeof WhatsAppStatusUpdateSchema>;
