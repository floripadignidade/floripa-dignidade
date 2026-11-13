/**
 * @section Messaging Logic - Persistence Data Transformer
 * @description Átomo puro encargado de mapear el ADN del mensaje directo al
 * esquema físico de columnas de la base de datos soberana (Supabase Ledger).
 * Garantiza la integridad del rastro forense y la trazabilidad multimedia.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Pure Logic.
 * SANEADO Zenith: Purga de identificadores duplicados (TS2300/TS2451).
 *
 * @author Raz Podestá - MetaShark Tech
 */

import type { IDirectMessage } from '../../schemas/DirectMessage.schema';

/**
 * Transforma un objeto de mensaje validado en un payload para PostgREST.
 * Implementa una función pura sin efectos secundarios para máxima testabilidad.
 *
 * @param validatedMessageData - ADN purificado del mensaje tras pasar la aduana Zod.
 * @param correlationIdentifier - Identificador único de trazabilidad forense del hilo.
 * @returns {Record<string, unknown>} Objeto plano optimizado para inserción en la nube.
 */
export const MapDirectMessageToPersistence = (
  validatedMessageData: IDirectMessage,
  correlationIdentifier: string,
): Record<string, unknown> => {
  return {
    /**
     * @section Mapeo Físico de Columnas
     * Sincronización absoluta con el Ledger de mensajería en Supabase.
     */
    message_id: validatedMessageData.messageIdentifier,
    thread_id: validatedMessageData.conversationThreadIdentifier,
    sender_id: validatedMessageData.senderIdentityIdentifier,
    recipient_id: validatedMessageData.recipientIdentityIdentifier,
    content_type: validatedMessageData.messageContentTypeLiteral,
    body_text: validatedMessageData.textContentBodyLiteral,

    /**
     * Colección de UUIDs de evidencia multimedia (Fotos/Videos/Documentos).
     * Se persiste como un array nativo de Postgres.
     */
    attachments_array: validatedMessageData.attachedMediaIdentifiersCollection,

    is_sensitive: validatedMessageData.containsSensitiveInformationBoolean,
    current_status: validatedMessageData.currentMessageStatusLiteral,
    dispatched_at: validatedMessageData.transmissionTimestampISO,
    correlation_id: correlationIdentifier,
  };
};
