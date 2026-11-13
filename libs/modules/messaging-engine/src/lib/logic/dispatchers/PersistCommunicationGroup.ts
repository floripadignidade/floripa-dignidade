/**
 * @section Messaging Logic - Group Persistence Dispatcher
 * @description Átomo encargado exclusivamente de la inyección física del grupo
 * en el Ledger Cloud. Implementa el protocolo Stateless para el Edge.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { ICommunicationGroupPersistence } from '../mappers/MapCommunicationGroupToPersistence';

/**
 * Ejecuta la transacción física de creación de un Action Hub.
 * ⚡ OPTIMIZACIÓN: Despacho asíncrono con blindaje de cabeceras soberanas.
 *
 * @param cloudUrl - Punto de enlace del búnker de datos.
 * @param cloudKey - Llave de acceso de alta autoridad (Service Role).
 * @param payload - Datos mapeados y listos para persistencia.
 */
export const PersistCommunicationGroup = async (
  cloudUrl: string,
  cloudKey: string,
  payload: ICommunicationGroupPersistence,
): Promise<void> => {
  try {
    const response = await fetch(`${cloudUrl}/rest/v1/communication_groups_ledger`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        apikey: cloudKey,
        Authorization: `Bearer ${cloudKey}`,
        /**
         * 🛡️ ESTRATEGIA: return=minimal reduce el payload de respuesta,
         * optimizando el uso de ancho de banda en operaciones de escritura.
         */
        Prefer: 'return=minimal, resolution=merge-duplicates',
      },
      body: JSON.stringify(payload),
    });

    if (!response.ok) {
      throw new Error(`LEDGER_CONNECTION_FAULT_HTTP_${response.status}`);
    }
  } catch (caughtError: unknown) {
    /**
     * Gestión forense enriquecida para el Neural Sentinel.
     */
    const errorLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);

    throw new InternalSystemException('COMMUNICATION_GROUP_PERSISTENCE_COLLAPSE', {
      intent: 'PERSIST_ACTION_HUB',
      targetResource: 'communication_groups_ledger',
      groupIdentifier: payload.group_id,
      correlationIdentifier: payload.correlation_id,
      originalError: errorLiteral,
    });
  }
};
