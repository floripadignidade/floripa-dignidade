/**
 * @section Messaging Contracts - Linguistic Integrity Schema (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del módulo
 * de mensajería institucional y presencia (`@floripa-dignidade/messaging-engine`). Garantiza
 * paridad estructural para la bandeja unificada, estados de presencia ciudadana, registros
 * operativos y mensajes de error en todos los idiomas habilitados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales lingüísticos obligatorios sin espacios residuales.
 *
 * @param semanticDescriptionLiteral - Descripción técnica para inspección automatizada de contratos.
 * @returns Esquema Zod de cadena purificada con longitud mínima de 1 carácter.
 */
const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'MESSAGING_ENGINE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name MessagingEngineI18nSchema
 * @description Contrato maestro inmutable para los diccionarios de mensajería y presencia.
 */
export const MessagingEngineI18nSchema = z
  .object({
    /** Textos visibles en la interfaz de buzón unificado y presencia ciudadana. */
    interface: z
      .object({
        emptyInboxTitleLiteral: createRequiredTranslationLiteralSchema(
          'Título mostrado en el buzón cuando no existen mensajes ni notificaciones pendientes.',
        ),
        emptyInboxDescriptionLiteral: createRequiredTranslationLiteralSchema(
          'Explicación contextual mostrada al ciudadano cuando la bandeja está vacía.',
        ),
        markAllAsReadActionLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta para la acción de marcar todas las notificaciones como leídas.',
        ),
        unreadMessagesCountLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta textual que acompaña al contador de notificaciones pendientes.',
        ),
        replyActionLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta de acción para responder directamente en una conversación.',
        ),
        presenceStates: z
          .object({
            ONLINE: createRequiredTranslationLiteralSchema(
              'Etiqueta para estado de disponibilidad conectado y activo.',
            ),
            AWAY: createRequiredTranslationLiteralSchema(
              'Etiqueta para estado de disponibilidad ausente o en segundo plano.',
            ),
            DO_NOT_DISTURB: createRequiredTranslationLiteralSchema(
              'Etiqueta para estado de disponibilidad sin interrupciones.',
            ),
            OFFLINE: createRequiredTranslationLiteralSchema(
              'Etiqueta para estado desconectado de la red.',
            ),
          })
          .readonly()
          .describe('Etiquetas localizadas sincronizadas con `AvailabilityStatusSchema`.'),
      })
      .readonly()
      .describe('Literales de interfaz de usuario para mensajería y presencia.'),

    /** Mensajes de trazabilidad operativa para monitoreo y auditoría técnica. */
    logs: z
      .object({
        NOTIFICATION_BROADCAST_SUCCESS: createRequiredTranslationLiteralSchema(
          'Confirmación operativa de difusión exitosa de alerta institucional.',
        ),
        DIRECT_MESSAGE_DISPATCHED: createRequiredTranslationLiteralSchema(
          'Confirmación operativa de envío cifrado de mensaje directo.',
        ),
        THREAD_ARCHIVED_NOMINAL: createRequiredTranslationLiteralSchema(
          'Confirmación operativa de archivado lógico de hilo de conversación.',
        ),
        HEARTBEAT_NOMINAL: createRequiredTranslationLiteralSchema(
          'Confirmación de recepción de pulso de presencia ciudadana en tiempo real.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de registro operativo del módulo de mensajería.'),

    /** Mensajes de error estructurado presentados ante fallos de validación o acceso. */
    errors: z
      .object({
        MAXIMUM_ATTACHMENTS_EXCEEDED: createRequiredTranslationLiteralSchema(
          'Error emitido al superar el límite máximo de 10 evidencias adjuntas.',
        ),
        MESSAGE_EXCEEDS_MAXIMUM_LENGTH: createRequiredTranslationLiteralSchema(
          'Error emitido cuando un mensaje supera el límite técnico de 5000 caracteres.',
        ),
        UNAUTHORIZED_THREAD_ACCESS: createRequiredTranslationLiteralSchema(
          'Error emitido ante intento de acceso sin autorización a un hilo privado.',
        ),
        MESSAGE_ADN_CORRUPTED: createRequiredTranslationLiteralSchema(
          'Error emitido cuando la estructura del payload de mensaje es inválida.',
        ),
      })
      .readonly()
      .describe('Catálogo de errores funcionales y de validación del módulo de mensajería.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del módulo de mensajería y presencia.');

/**
 * @name IMessagingEngineI18n
 * @description Tipo inmutable inferido del diccionario validado de mensajería.
 */
export type IMessagingEngineI18n = z.infer<typeof MessagingEngineI18nSchema>;
