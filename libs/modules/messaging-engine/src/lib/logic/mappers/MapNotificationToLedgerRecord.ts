/**
 * @section Messaging Logic - Notification Data Mapper
 * @description Átomo de lógica pura encargado de transformar el ADN de la notificación
 * al esquema físico de columnas del Ledger soberano (Supabase).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

import type { ISystemNotification } from '../../schemas/SystemNotification.schema';

/**
 * @interface INotificationLedgerRecord
 * @description Representación física inmutable de las columnas en la tabla
 * 'system_notifications_ledger' definida en el migration_master_schema.sql.
 */
export interface INotificationLedgerRecord {
  readonly notification_id: string;
  readonly recipient_id: string;
  readonly priority_level: string;
  readonly category_tag: string;
  readonly headline_text: string;
  readonly body_content: string;
  readonly action_route: string | null | undefined;
  readonly interaction_status: string;
  readonly dispatched_at: string;
  readonly correlation_id: string;
}

/**
 * Transforma una notificación validada en un registro listo para la persistencia cloud.
 *
 * @param notificationSnapshot - ADN de la notificación purificada.
 * @param correlationIdentifier - ID de trazabilidad forense.
 * @returns {INotificationLedgerRecord} Registro mapeado bajo estándar PostgREST.
 */
export const MapNotificationToLedgerRecord = (
  notificationSnapshot: ISystemNotification,
  correlationIdentifier: string,
): INotificationLedgerRecord => {
  return Object.freeze({
    notification_id: notificationSnapshot.notificationIdentifier,
    recipient_id: notificationSnapshot.targetRecipientIdentifierLiteral,
    priority_level: notificationSnapshot.notificationPriorityLiteral,
    category_tag: notificationSnapshot.notificationCategoryLiteral,
    headline_text: notificationSnapshot.headlineTitleLiteral,
    body_content: notificationSnapshot.contentBodyLiteral,
    action_route: notificationSnapshot.targetActionRouteLiteral,
    interaction_status: notificationSnapshot.interactionStatusLiteral,
    dispatched_at: notificationSnapshot.dispatchTimestampISO,
    correlation_id: correlationIdentifier,
  });
};
