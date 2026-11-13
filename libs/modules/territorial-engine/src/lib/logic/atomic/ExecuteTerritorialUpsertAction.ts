/**
 * @section Territorial Logic - Cloud I/O Atom
 * @description Átomo encargado exclusivamente de la comunicación física con
 * el Tier de Datos. Implementa políticas de resolución de duplicados.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Network Resilience.
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';

/**
 * Ejecuta el POST físico hacia el Ledger territorial.
 */
export const ExecuteTerritorialUpsertAction = async (
  cloudUrlLiteral: string,
  cloudKeySecret: string,
  payloadCollection: Record<string, unknown>[],
): Promise<void> => {
  const networkResponse = await fetch(`${cloudUrlLiteral}/rest/v1/territorial_master_data`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      apikey: cloudKeySecret,
      Authorization: `Bearer ${cloudKeySecret}`,
      Prefer: 'resolution=merge-duplicates',
    },
    body: JSON.stringify(payloadCollection),
    /** SRE: Límite de 10 segundos para persistencia territorial */
    signal: AbortSignal.timeout(10000),
  });

  if (!networkResponse.ok) {
    throw MapHttpErrorToException(networkResponse.status, 'TERRITORIAL_UPSERT_FAULT', {
      statusTextLiteral: networkResponse.statusText,
    });
  }
};
