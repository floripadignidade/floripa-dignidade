/**
 * @section WhatsApp DNA - Webhook Payload Schema
 * @description Contrato soberano para el parseo y validación de eventos ciudadanos
 * provenientes de la API de Meta. Soporta flujos de texto, geolocalización,
 * evidencia multimedia y estados de trazabilidad.
 *
 * Protocolo OEDP-V16.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @section Sub-Esquemas de Contenido Atómico
 * @description Define la estructura interna de los diferentes medios de comunicación.
 */

/**
 * ADN de Mensaje de Texto.
 */
const WhatsAppTextMessageContentSchema = z
  .object({
    body: z.string().min(1).describe('Cuerpo del mensaje de texto enviado por el ciudadano.'),
  })
  .readonly();

/**
 * ADN de Geolocalización.
 */
const WhatsAppLocationMessageContentSchema = z
  .object({
    latitude: z.number().describe('Coordenada de latitud del punto de vulnerabilidad detectado.'),
    longitude: z.number().describe('Coordenada de longitud para mapeo geográfico institucional.'),
    name: z
      .string()
      .optional()
      .describe('Nombre del lugar o punto de referencia si está disponible.'),
    address: z
      .string()
      .optional()
      .describe('Dirección física calculada por el dispositivo del ciudadano.'),
  })
  .readonly();

/**
 * ADN de Archivos Multimedia (Imágenes, Videos, Audios).
 */
const WhatsAppMediaMessageContentSchema = z
  .object({
    id: z.string().describe('Identificador único del activo en los servidores de Meta.'),
    mime_type: z.string().describe('Formato técnico del archivo para triaje de procesamiento.'),
    sha256: z
      .string()
      .optional()
      .describe('Hash de integridad para verificación de no-alteración de evidencia.'),
  })
  .readonly();

/**
 * @name WhatsAppMessageSchema
 * @description Definición de un mensaje individual capturado en el enjambre.
 */
export const WhatsAppMessageSchema = z
  .object({
    from: z.string().describe('Identificador telefónico del remitente en formato E.164.'),
    id: z.string().describe('ID único de mensaje generado por Meta para seguimiento.'),
    timestamp: z.string().describe('Marca temporal de recepción en segundos (Unix Epoch).'),
    type: z
      .enum(['text', 'image', 'video', 'audio', 'location', 'document', 'voice', 'unknown'])
      .describe('Categoría técnica del medio recibido.'),

    /** Campos opcionales condicionados por el tipo de mensaje */
    text: WhatsAppTextMessageContentSchema.optional(),
    location: WhatsAppLocationMessageContentSchema.optional(),
    image: WhatsAppMediaMessageContentSchema.optional(),
    voice: WhatsAppMediaMessageContentSchema.optional(),
    audio: WhatsAppMediaMessageContentSchema.optional(),
    video: WhatsAppMediaMessageContentSchema.optional(),
    document: WhatsAppMediaMessageContentSchema.optional(),
  })
  .readonly();

/**
 * @name WhatsAppWebhookPayloadSchema
 * @description ADN Maestro del paquete de datos de Meta.
 * Orquesta la jerarquía de Entries y Changes según el estándar de Webhooks de Meta.
 */
export const WhatsAppWebhookPayloadSchema = z
  .object({
    object: z
      .literal('whatsapp_business_account')
      .describe('Identificador del origen de la señal (WABA).'),

    entry: z.array(
      z.object({
        id: z.string().describe('ID de la cuenta de WhatsApp Business.'),

        changes: z.array(
          z.object({
            value: z.object({
              messaging_product: z.literal('whatsapp'),
              metadata: z.object({
                display_phone_number: z.string(),
                phone_number_id: z.string(),
              }),
              messages: z
                .array(WhatsAppMessageSchema)
                .optional()
                .describe('Colección de nuevos mensajes ciudadanos detectados.'),
              statuses: z
                .array(z.unknown())
                .optional()
                .describe('Actualizaciones de estado de entrega y lectura.'),
            }),
            field: z.literal('messages'),
          }),
        ),
      }),
    ),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 */

/** Representa un mensaje individual procesable. */
export type IWhatsAppMessage = z.infer<typeof WhatsAppMessageSchema>;

/** Representa el paquete completo recibido en el Webhook. */
export type IWhatsAppWebhookPayload = z.infer<typeof WhatsAppWebhookPayloadSchema>;
