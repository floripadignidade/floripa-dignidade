/**
 * @section Messaging Logic - Ledger Data Fetcher
 * @description Átomo encargado exclusivamente de la extracción física de registros
 * desde las tablas de mensajería en Supabase.
 *
 * Protocolo OEDP-V16.0 - Stateless I/O Isolation.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Ejecuta una consulta física contra una tabla del Ledger de comunicación.
 */
export const FetchMessagingLedgerData = async <TRecordType>(
  tableName: string,
  queryFilterLiteral: string,
  cloudUrl: string,
  cloudKey: string,
  limitQuantity: number,
): Promise<TRecordType[]> => {
  const outgoingResponse = await fetch(
    `${cloudUrl}/rest/v1/${tableName}?${queryFilterLiteral}&limit=${limitQuantity}`,
    { headers: { apikey: cloudKey, Authorization: `Bearer ${cloudKey}` } },
  );

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_LECTURA_LEDGER_COMUNICACION', {
      targetTable: tableName,
      httpStatus: outgoingResponse.status,
    });
  }

  return await outgoingResponse.json();
};
