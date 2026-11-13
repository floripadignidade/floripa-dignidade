/**
 * @section Messaging Logic - Presence Data Mapper
 * @description Átomo de lógica pura encargado de transformar el ADN de dominio
 * de presencia al esquema físico de columnas del Ledger soberano (Supabase).
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 * @author Raz Podestá - MetaShark Tech
 */

import type { IUserPresence } from '../../schemas/UserPresence.schema';

/**
 * @interface IPresenceLedgerSnapshot
 * @description Representación física inmutable de las columnas en la tabla 'user_presence_ledger'.
 * Sincronizado con: database/migration_master_schema.sql
 */
export interface IPresenceLedgerSnapshot {
  readonly citizen_id: string;
  readonly availability_status: string;
  readonly custom_status_text: string | undefined;
  readonly platform_type: string | undefined;
  readonly push_token: string | undefined;
  readonly last_heartbeat_at: string;
  readonly correlation_id: string;
}

/**
 * Transforma los datos de presencia validados en un snapshot listo para la persistencia.
 *
 * @param domainDataSnapshot - Datos de la identidad ciudadana purificados.
 * @param correlationIdentifier - ID de trazabilidad forense del proceso.
 * @returns {IPresenceLedgerSnapshot} Registro mapeado bajo el estándar físico PostgREST.
 */
export const MapPresenceToLedgerSnapshot = (
  domainDataSnapshot: IUserPresence,
  correlationIdentifier: string,
): IPresenceLedgerSnapshot => {
  return Object.freeze({
    citizen_id: domainDataSnapshot.citizenIdentifier,
    availability_status: domainDataSnapshot.currentAvailabilityStatus,
    custom_status_text: domainDataSnapshot.customStatusMessageLiteral,
    platform_type: domainDataSnapshot.lastActivePlatformLiteral,
    push_token: domainDataSnapshot.activePushSubscriptionTokenSecret,
    last_heartbeat_at: domainDataSnapshot.lastHeartbeatTimestampISO,
    correlation_id: correlationIdentifier,
  });
};
