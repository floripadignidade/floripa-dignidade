/**
 * @section WhatsApp Contracts - Webhook Payload Schema (SSOT)
 * @description Contrato Zod inmutable para validar y tipar eventos entrantes de la
 * API oficial de Meta WhatsApp Cloud API (`whatsapp_business_account`). Soporta mensajes
 * de texto, multimedia (incluyendo stickers y notas de voz), geolocalización acotada,
 * reacciones, respuestas interactivas, botones y actualizaciones de entrega.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name WhatsAppMessageTypeSchema
 * @description Catálogo oficial de tipos de mensaje admitidos por Meta WhatsApp Cloud API.
 */
export const WhatsAppMessageTypeSchema = z
  .enum([
    'text',
    'image',
    'video',
    'audio',
    'voice',
    'location',
    'document',
    'reaction',
    'interactive',
    'button',
    'sticker',
    'contacts',
    'order',
    'system',
    'unsupported',
    'unknown',
  ])
  .describe('Categoría técnica oficial del mensaje recibido desde Meta WhatsApp Cloud API.');

export type TWhatsAppMessageType = z.infer<typeof WhatsAppMessageTypeSchema>;

const WhatsAppTextMessageContentSchema = z
  .object({
    body: z.string().min(1).describe('Cuerpo del mensaje de texto enviado por el ciudadano.'),
  })
  .readonly();

const WhatsAppLocationMessageContentSchema = z
  .object({
    latitude: z
      .number()
      .min(-90)
      .max(90)
      .describe('Latitud decimal acotada del punto reportado (-90 a 90).'),
    longitude: z
      .number()
      .min(-180)
      .max(180)
      .describe('Longitud decimal acotada del punto reportado (-180 a 180).'),
    name: z
      .string()
      .optional()
      .describe('Nombre del lugar o punto de referencia si está disponible.'),
    address: z
      .string()
      .optional()
      .describe('Dirección física aproximada calculada por el dispositivo del ciudadano.'),
  })
  .readonly();

const WhatsAppMediaMessageContentSchema = z
  .object({
    id: z.string().trim().min(1).describe('Identificador del activo multimedia en Meta.'),
    mime_type: z.string().trim().min(1).describe('Tipo MIME declarado para el archivo.'),
    sha256: z
      .string()
      .optional()
      .describe('Resumen SHA-256 enviado por Meta para verificación de integridad.'),
    caption: z.string().optional().describe('Texto adjunto opcional enviado junto al archivo.'),
    filename: z.string().optional().describe('Nombre de archivo original en mensajes document.'),
    animated: z.boolean().optional().describe('Indica si un sticker recibido es animado.'),
  })
  .readonly();

const WhatsAppReactionMessageContentSchema = z
  .object({
    message_id: z
      .string()
      .trim()
      .min(1)
      .describe('WAMID del mensaje al cual reaccionó el usuario.'),
    emoji: z
      .string()
      .optional()
      .describe('Emoji Unicode de la reacción; vacío cuando el usuario retira una reacción.'),
  })
  .readonly();

const WhatsAppInteractiveReplyItemSchema = z
  .object({
    id: z.string().trim().min(1).describe('Identificador del botón o fila seleccionada.'),
    title: z.string().trim().min(1).describe('Título visible seleccionado por el ciudadano.'),
    description: z.string().optional().describe('Descripción opcional en respuestas de lista.'),
  })
  .readonly();

const WhatsAppInteractiveMessageContentSchema = z
  .object({
    type: z
      .string()
      .trim()
      .min(1)
      .describe('Subtipo interactivo (button_reply, list_reply, etc.).'),
    button_reply: WhatsAppInteractiveReplyItemSchema.optional(),
    list_reply: WhatsAppInteractiveReplyItemSchema.optional(),
    nfm_reply: z
      .object({
        response_json: z.string(),
        body: z.string().optional(),
        name: z.string().optional(),
      })
      .readonly()
      .optional(),
  })
  .readonly();

const WhatsAppButtonMessageContentSchema = z
  .object({
    payload: z.string().describe('Carga útil configurada en el botón rápido de plantilla.'),
    text: z.string().describe('Texto visible del botón pulsado por el ciudadano.'),
  })
  .readonly();

const WhatsAppMessageContextSchema = z
  .object({
    from: z.string().optional().describe('Remitente del mensaje original citado.'),
    id: z.string().optional().describe('WAMID del mensaje original respondido o reenviado.'),
  })
  .readonly();

/**
 * @name WhatsAppMessageSchema
 * @description Contrato estructural inmutable para un mensaje individual en el webhook de Meta.
 */
export const WhatsAppMessageSchema = z
  .object({
    from: z.string().trim().min(1).describe('Identificador del remitente en formato E.164.'),
    id: z.string().trim().min(1).describe('Identificador WAMID único del mensaje en Meta.'),
    timestamp: z.string().trim().min(1).describe('Marca temporal Unix Epoch en segundos.'),
    type: WhatsAppMessageTypeSchema,
    context: WhatsAppMessageContextSchema.optional(),
    text: WhatsAppTextMessageContentSchema.optional(),
    location: WhatsAppLocationMessageContentSchema.optional(),
    image: WhatsAppMediaMessageContentSchema.optional(),
    voice: WhatsAppMediaMessageContentSchema.optional(),
    audio: WhatsAppMediaMessageContentSchema.optional(),
    video: WhatsAppMediaMessageContentSchema.optional(),
    document: WhatsAppMediaMessageContentSchema.optional(),
    sticker: WhatsAppMediaMessageContentSchema.optional(),
    reaction: WhatsAppReactionMessageContentSchema.optional(),
    interactive: WhatsAppInteractiveMessageContentSchema.optional(),
    button: WhatsAppButtonMessageContentSchema.optional(),
  })
  .readonly();

/**
 * @name WhatsAppWebhookPayloadSchema
 * @description Contrato raíz inmutable para la carga útil completa enviada por Meta Webhooks.
 */
export const WhatsAppWebhookPayloadSchema = z
  .object({
    object: z
      .literal('whatsapp_business_account')
      .describe('Identificador de origen de suscripción WABA.'),
    entry: z
      .array(
        z
          .object({
            id: z.string().trim().min(1).describe('Identificador de cuenta WhatsApp Business.'),
            changes: z
              .array(
                z
                  .object({
                    value: z
                      .object({
                        messaging_product: z.literal('whatsapp'),
                        metadata: z
                          .object({
                            display_phone_number: z.string().trim().min(1),
                            phone_number_id: z.string().trim().min(1),
                          })
                          .readonly(),
                        messages: z
                          .array(WhatsAppMessageSchema)
                          .readonly()
                          .optional()
                          .describe('Colección de mensajes entrantes recibidos.'),
                        statuses: z
                          .array(z.unknown())
                          .readonly()
                          .optional()
                          .describe('Eventos de actualización de estado validados por átomo.'),
                      })
                      .readonly(),
                    field: z.literal('messages'),
                  })
                  .readonly(),
              )
              .readonly(),
          })
          .readonly(),
      )
      .readonly(),
  })
  .readonly();

/** Representa un mensaje individual procesable validado por `WhatsAppMessageSchema`. */
export type IWhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

/** Representa el sobre completo del webhook validado por `WhatsAppWebhookPayloadSchema`. */
export type IWhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayloadSchema>;
