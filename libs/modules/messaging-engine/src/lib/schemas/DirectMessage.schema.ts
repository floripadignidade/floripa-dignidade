/**
 * @section Messaging DNA - Direct Message Schema
 * @description Contrato soberano para el Buzón de Mensajes (Direct Messaging).
 * Diseñado para la comunicación bidireccional, segura y enhebrada (Threads) entre
 * instituciones (ONG) y ciudadanos, garantizando privacidad en contextos críticos.
 *
 * Protocolo OEDP-V16.0 - High Performance SRE & Data Sovereignty.
 * Vision: Encrypted Conversations & Immutable Forensic Trails.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Tipado Nominal
 */
export const MessageIdentifierSchema = z.string().uuid().brand<'MessageIdentifier'>();
export type MessageIdentifier = z.infer<typeof MessageIdentifierSchema>;

export const ConversationThreadIdentifierSchema = z
  .string()
  .uuid()
  .brand<'ConversationThreadIdentifier'>();
export type ConversationThreadIdentifier = z.infer<typeof ConversationThreadIdentifierSchema>;

/**
 * Jerarquía de Estados de Mensaje (Read Receipts & Soft Delete).
 */
export const MessageStatusSchema = z
  .enum([
    'SENT_TO_SERVER', // Recibido por la infraestructura soberana.
    'DELIVERED_TO_DEVICE', // Entregado en el dispositivo destino.
    'READ_BY_RECIPIENT', // Confirmación de lectura (Doble tilde azul).
    'ARCHIVED_BY_USER', // Oculto de la bandeja principal pero conservado.
    'TRASHED_DELETED', // Eliminación lógica (Cadena de custodia intacta).
  ])
  .describe('Estado del ciclo de vida de un mensaje directo.');

/**
 * Categorías de Contenido Seguro.
 */
export const MessageContentTypeSchema = z
  .enum([
    'STANDARD_TEXT', // Texto plano purificado.
    'RICH_MEDIA_DOCUMENT', // Contiene referencias a la Bóveda Multimedia (Fotos/Videos).
    'SYSTEM_ACTION_CARD', // Mensajes interactivos (Ej: "Firma este petitorio").
  ])
  .describe('Naturaleza técnica del contenido del mensaje.');

/**
 * @name DirectMessageSchema
 * @description Aduana maestra para la ingesta y transmisión de mensajería privada.
 */
export const DirectMessageSchema = z
  .object({
    /** Identificador inalterable del mensaje. */
    messageIdentifier: MessageIdentifierSchema,

    /** Identificador del hilo de conversación. Permite agrupar respuestas. */
    conversationThreadIdentifier: ConversationThreadIdentifierSchema,

    /** Emisor: UUID del usuario o ente que origina el mensaje. */
    senderIdentityIdentifier: z
      .string()
      .uuid()
      .describe('ID del ciudadano u operador de impacto que redacta.'),

    /** Destinatario: UUID del usuario o entidad destino. */
    recipientIdentityIdentifier: z
      .string()
      .uuid()
      .describe('ID del ciudadano o canal institucional receptor.'),

    /** ADN del Contenido */
    messageContentTypeLiteral: MessageContentTypeSchema.default('STANDARD_TEXT'),

    /**
     * Contenido Textual.
     * Puede estar cifrado en tránsito si se implementa End-to-End Encryption (E2EE).
     */
    textContentBodyLiteral: z
      .string()
      .min(1)
      .max(5000, { message: 'MESSAGE_EXCEEDS_MAXIMUM_LENGTH' })
      .describe('Contenido del mensaje directo (Purificado o Cifrado).'),

    /**
     * Evidencia Multimedia Adjunta.
     * Colección de UUIDs que apuntan al 'MediaVaultCollection' del CMS.
     */
    attachedMediaIdentifiersCollection: z
      .array(z.string().uuid())
      .max(10, { message: 'MAXIMUM_ATTACHMENTS_EXCEEDED' })
      .default([])
      .describe('Referencias forenses a documentos o medios visuales.'),

    /**
     * Bandera de Información Crítica (PII / Derechos Humanos).
     * Alerta al sistema nervioso central para que no exponga este mensaje
     * en notificaciones Push o emails no seguros.
     */
    containsSensitiveInformationBoolean: z
      .boolean()
      .default(true) // Por diseño de seguridad, se asume sensible hasta probar lo contrario.
      .describe('Indica si el mensaje contiene datos críticos o denuncias.'),

    /** Estado actual de la transacción P2P. */
    currentMessageStatusLiteral: MessageStatusSchema.default('SENT_TO_SERVER'),

    /** Trazabilidad temporal absoluta. */
    transmissionTimestampISO: z
      .string()
      .datetime()
      .describe('Marca temporal inmutable de la recepción en la nube.'),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 */
export type IDirectMessage = z.infer<typeof DirectMessageSchema>;
export type IMessageStatus = z.infer<typeof MessageStatusSchema>;
export type IMessageContentType = z.infer<typeof MessageContentTypeSchema>;
