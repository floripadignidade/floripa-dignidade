/**
 * @section Messaging Logic - Unified Event Mapper
 * @description Átomo polimórfico que unifica señales de diferentes orígenes
 * (Notificaciones y Mensajes) en un único contrato visual.
 *
 * Protocolo OEDP-V16.0 - High Performance UI & Polymorphic Mapping.
 * Vision: Seamless "Unified Inbox" rendering.
 */

import type { ISystemNotification } from '../../schemas/SystemNotification.schema';
import type { IDirectMessage } from '../../schemas/DirectMessage.schema';

/**
 * @interface IUnifiedCommunicationEvent
 * @description Contrato universal para el renderizado del portal ciudadano.
 */
export interface IUnifiedCommunicationEvent {
  readonly eventIdentifier: string;
  readonly eventType: 'SYSTEM_NOTIFICATION' | 'DIRECT_MESSAGE';
  readonly timestampISO: string;
  readonly headlineTitleLiteral: string;
  readonly previewSnippetLiteral: string;
  readonly interactionStatus: 'UNREAD' | 'READ' | 'ARCHIVED';
  readonly actionRouteLiteral: string;
  readonly isCriticalBoolean: boolean;
}

/**
 * Mapea una Notificación de Sistema al Contrato Unificado.
 */
export const MapNotificationToUnifiedEvent = (
  notification: ISystemNotification,
): IUnifiedCommunicationEvent => ({
  eventIdentifier: notification.notificationIdentifier,
  eventType: 'SYSTEM_NOTIFICATION',
  timestampISO: notification.dispatchTimestampISO,
  headlineTitleLiteral: notification.headlineTitleLiteral,
  previewSnippetLiteral: notification.contentBodyLiteral.substring(0, 80),
  interactionStatus:
    notification.interactionStatusLiteral === 'DELIVERED_UNREAD' ? 'UNREAD' : 'READ',
  actionRouteLiteral: notification.targetActionRouteLiteral ?? '/',
  isCriticalBoolean: notification.notificationPriorityLiteral === 'CRITICAL_ALERT',
});

/**
 * Mapea un Mensaje Directo al Contrato Unificado.
 */
export const MapMessageToUnifiedEvent = (message: IDirectMessage): IUnifiedCommunicationEvent => ({
  eventIdentifier: message.messageIdentifier,
  eventType: 'DIRECT_MESSAGE',
  timestampISO: message.transmissionTimestampISO,
  headlineTitleLiteral: 'Mensagem Direta', // TODO: Inyectar nombre del emisor (Identity Synergy)
  previewSnippetLiteral: message.textContentBodyLiteral.substring(0, 80),
  interactionStatus:
    message.currentMessageStatusLiteral === 'READ_BY_RECIPIENT' ? 'READ' : 'UNREAD',
  actionRouteLiteral: `/mensagens/${message.conversationThreadIdentifier}`,
  isCriticalBoolean: message.containsSensitiveInformationBoolean,
});
