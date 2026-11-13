/**
 * @section Messaging Engine - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el búnker de comunicación.
 * Orquesta la visibilidad de esquemas, lógica y almas lingüísticas.
 *
 * Protocolo OEDP-V16.0 - Single Source Resolution & Encapsulation.
 * SANEADO Zenith: Resolución de error de resolución TS2307 y TS2305.
 *
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * @version 1.7.1
 * Estatus: Sincronización de exportaciones nominales verificada.
 */
export const MODULE_MESSAGING_ENGINE_VERSION = '1.7.1';

/**
 * @section ADN Estructural (Schemas & Types)
 */
export * from './lib/schemas/SystemNotification.schema';
export * from './lib/schemas/DirectMessage.schema';
export * from './lib/schemas/CommunicationGroup.schema';
export * from './lib/schemas/CommunicationGroupMembership.schema';
export * from './lib/schemas/UserPresence.schema';
export * from './lib/schemas/PushPayload.schema';

/**
 * @section Almas Lingüísticas (Internationalization)
 */
export * from './lib/i18n/MessagingEngineI18n.schema';

/**
 * @section Motores de Transmisión (Dispatchers)
 */
export { DispatchSystemNotification } from './lib/logic/dispatchers/DispatchSystemNotification';
export { SendDirectMessage } from './lib/logic/dispatchers/SendDirectMessage';
export { DispatchPushNotification } from './lib/logic/dispatchers/DispatchPushNotification';
export { TransmitPushSignal } from './lib/logic/dispatchers/TransmitPushSignal';
export { PersistDirectMessageTransaction } from './lib/logic/dispatchers/PersistDirectMessageTransaction';

/**
 * @section Motores de Mutación (Mutators)
 */
export { ArchiveMessageThread } from './lib/logic/mutators/ArchiveMessageThread';
export { CreateCommunicationGroup } from './lib/logic/mutators/CreateCommunicationGroup';
export { MarkNotificationAsRead } from './lib/logic/mutators/MarkNotificationAsRead';
export { UpdateUserPresence } from './lib/logic/mutators/UpdateUserPresence';
export { ManageSovereignMembership } from './lib/logic/mutators/ManageSovereignMembership';
export { ManageGroupMembership } from './lib/logic/mutators/ManageGroupMembership';
export { DelegateVotingAuthority } from './lib/logic/mutators/DelegateVotingAuthority';

/**
 * @section Motores de Descubrimiento (Queries & Sensors)
 */
export { GetUnreadNotificationsCount } from './lib/logic/queries/GetUnreadNotificationsCount';
export { GetUnifiedCitizenInbox } from './lib/logic/queries/GetUnifiedCitizenInbox';
export { GetCitizenPushToken } from './lib/logic/queries/GetCitizenPushToken'; // 🛡️ SANEADO: Exportado desde su archivo real
export { FetchMessagingLedgerData } from './lib/logic/queries/FetchMessagingLedgerData';
export { FetchSingleLedgerRecord } from './lib/logic/queries/FetchSingleLedgerRecord';

/**
 * @section Transformadores de Datos (Mappers)
 */
export { MapDirectMessageToPersistence } from './lib/logic/mappers/MapDirectMessageToPersistence';
export { ConsolidateUnifiedInboxEvents } from './lib/logic/mappers/ConsolidateUnifiedInboxEvents';
export {
  MapNotificationToUnifiedEvent,
  MapMessageToUnifiedEvent,
} from './lib/logic/mappers/MapToUnifiedCommunicationEvent';

/**
 * @section Interfaces de Orquestación (Types)
 */
export type { IUnifiedInboxSnapshot } from './lib/logic/queries/GetUnifiedCitizenInbox';
export type { IPushPayload } from './lib/schemas/PushPayload.schema';
export type { IUserPresence, TAvailabilityStatus } from './lib/schemas/UserPresence.schema';
export type { IUnifiedCommunicationEvent } from './lib/logic/mappers/MapToUnifiedCommunicationEvent';
