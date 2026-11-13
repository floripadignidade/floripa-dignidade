/**
 * @section Messaging Logic - Notification Cloud Persistence
 * @description Átomo encargado exclusivamente de la comunicación física I/O
 * para el registro de alertas en el Ledger.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & SRE Resilience.
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import type { ISovereignHeadersResult } from '../CreateSovereignDatabaseHeaders';
import type { INotificationLedgerRecord } from '../../mappers/MapNotificationToLedgerRecord';

/**
 * Ejecuta el POST físico hacia la infraestructura de datos.
 *
 * @param cloudUrlLiteral - Endpoint base del Tier de Datos.
 * @param securityHeaders - Cabeceras soberanas autorizadas.
 * @param ledgerRecord - Datos mapeados en snake_case.
 * @throws {GlobalBaseException} Si la nube rechaza la transacción.
 */
export const PersistNotificationToCloud = async (
  cloudUrlLiteral: string,
  securityHeaders: ISovereignHeadersResult,
  ledgerRecord: INotificationLedgerRecord,
): Promise<void> => {
  const networkResponse = await fetch(`${cloudUrlLiteral}/rest/v1/system_notifications_ledger`, {
    method: 'POST',
    headers: { ...securityHeaders },
    body: JSON.stringify(ledgerRecord),
    signal: AbortSignal.timeout(10000), // SRE: Timeout preventivo
  });

  if (!networkResponse.ok) {
    throw MapHttpErrorToException(networkResponse.status, 'DATABASE_PERSISTENCE_REJECTED');
  }
};
