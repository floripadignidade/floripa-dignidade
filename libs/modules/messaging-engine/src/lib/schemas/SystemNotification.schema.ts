/**
 * @section Messaging DNA - System Notification Schema
 * @description Contrato soberano para las Alertas de Sistema institucionales ("Campanita").
 * Diseñado para soportar mensajería P2P y Broadcasting masivo (Fan-out on Read) con latencia cero.
 *
 * Protocolo OEDP-V16.0 - High Performance SRE & Data Sovereignty.
 * Vision: Zero-Spam, Forensic Traceability & Immutable Broadcasts.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Tipado Nominal
 * Impide la inyección accidental de UUIDs de otras entidades.
 */
export const NotificationIdentifierSchema = z.string().uuid().brand<'NotificationIdentifier'>();
export type NotificationIdentifier = z.infer<typeof NotificationIdentifierSchema>;

/**
 * Jerarquía de Severidad de Notificación.
 * Determina el tratamiento visual en la UI y las reglas de envío Push/Email.
 */
export const NotificationPrioritySchema = z
  .enum([
    'ROUTINE_INFO', // Información general, sin interrupción.
    'MODERATE_WARNING', // Cambios de estado en reportes o recordatorios.
    'CRITICAL_ALERT', // Violaciones detectadas en la zona del ciudadano.
    'EMERGENCY_BROADCAST', // Alerta roja máxima. Ignora configuraciones de silencio.
  ])
  .describe('Nivel de prioridad operativa de la alerta.');

/**
 * Categorías Semánticas.
 * Vital para permitir al ciudadano filtrar qué tipo de comunicaciones desea recibir.
 */
export const NotificationCategorySchema = z
  .enum([
    'HUMAN_RIGHTS_UPDATE', // Actualizaciones sobre denuncias o auditorías.
    'TERRITORIAL_ALERT', // Avisos basados en la geolocalización (IBGE).
    'INSTITUTIONAL_MESSAGE', // Mensajes del CMS o la Directiva de la ONG.
    'SYSTEM_MAINTENANCE', // Avisos de SRE, caídas o actualizaciones de app.
  ])
  .describe('Clasificación taxonómica del mensaje.');

/**
 * Máquina de Estados de Interacción (Soft Deletion Protocol).
 * Garantiza que la información crítica jamás se elimine físicamente de Postgres.
 */
export const NotificationInteractionStatusSchema = z
  .enum([
    'DELIVERED_UNREAD', // Entregada, esperando atención del ciudadano.
    'ACKNOWLEDGED_READ', // Leída y procesada.
    'ARCHIVED_SILENT', // Guardada en el historial personal.
    'TRASHED_DELETED', // Eliminada lógicamente de la vista principal.
  ])
  .describe('Estado del ciclo de vida de la interacción ciudadana.');

/**
 * @name SystemNotificationSchema
 * @description Aduana maestra para la ingesta y salida de alertas.
 */
export const SystemNotificationSchema = z
  .object({
    /** Identificador inalterable del mensaje en el ecosistema. */
    notificationIdentifier: NotificationIdentifierSchema,

    /**
     * Identidad Destino.
     * Puede ser un UUID de un ciudadano (P2P), o la constante "GLOBAL_BROADCAST"
     * para alertas masivas con Fan-out on Read.
     */
    targetRecipientIdentifierLiteral: z
      .string()
      .describe('UUID del ciudadano destino o identificador de segmento territorial/global.'),

    notificationPriorityLiteral: NotificationPrioritySchema,

    notificationCategoryLiteral: NotificationCategorySchema,

    /** Título optimizado para notificaciones Push (Breve y directo). */
    headlineTitleLiteral: z.string().min(3).max(100).describe('Título corto de la notificación.'),

    /** Cuerpo del mensaje. */
    contentBodyLiteral: z
      .string()
      .min(5)
      .max(500)
      .describe('Descripción o cuerpo argumentativo de la alerta.'),

    /**
     * Ruta de Redirección (Call To Action).
     * ISO Standard Path: Ej. "/es-ES/denuncias/1234-5678".
     */
    targetActionRouteLiteral: z
      .string()
      .nullable()
      .optional()
      .describe('Ruta interna ISO para redirigir al ciudadano al interactuar.'),

    interactionStatusLiteral: NotificationInteractionStatusSchema.default('DELIVERED_UNREAD'),

    /** Trazabilidad Forense de Emisión y Lectura. */
    dispatchTimestampISO: z
      .string()
      .datetime()
      .describe('Marca temporal de emisión en el servidor.'),

    acknowledgedTimestampISO: z
      .string()
      .datetime()
      .nullable()
      .optional()
      .describe('Marca temporal del momento en que el ciudadano la marcó como leída.'),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interfaces inmutables para el enjambre de orquestadores de mensajería.
 */
export type ISystemNotification = z.infer<typeof SystemNotificationSchema>;
export type INotificationPriority = z.infer<typeof NotificationPrioritySchema>;
export type INotificationInteractionStatus = z.infer<typeof NotificationInteractionStatusSchema>;
