/**
 * @section Messaging Logic - Single Record Fetcher Atom
 * @description Átomo encargado exclusivamente de la extracción física de un único
 * registro desde el Ledger Cloud. Optimizado para consultas de estado puntual.
 *
 * Protocolo OEDP-V16.0 - High Performance SRE & Stateless I/O.
 * Vision: Fast State Verification with Zero Overhead.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Ejecuta una consulta física para obtener un registro único.
 *
 * @template TRecordType - ADN esperado del objeto de retorno.
 * @param tableName - Tabla del Ledger (ej: 'group_memberships_ledger').
 * @param queryFilterLiteral - Filtro de búsqueda (ej: 'citizen_id=eq.uuid').
 * @param cloudUrl - Endpoint REST de Supabase.
 * @param cloudKey - Llave de seguridad institucional.
 * @returns {Promise<TRecordType | null>} El registro hallado o null si no existe.
 */
export const FetchSingleLedgerRecord = async <TRecordType>(
  tableName: string,
  queryFilterLiteral: string,
  cloudUrl: string,
  cloudKey: string,
): Promise<TRecordType | null> => {
  /**
   * @section Optimización de Red SRE
   * Forzamos 'limit=1' en la URL para que el motor de base de datos aborte
   * el escaneo tras el primer hallazgo, ahorrando cómputo en la nube.
   */
  const outgoingResponse = await fetch(
    `${cloudUrl}/rest/v1/${tableName}?${queryFilterLiteral}&limit=1`,
    {
      method: 'GET',
      headers: {
        apikey: cloudKey,
        Authorization: `Bearer ${cloudKey}`,
        Accept: 'application/json',
      },
    },
  );

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_LECTURA_PUNTUAL_LEDGER', {
      targetTable: tableName,
      httpStatus: outgoingResponse.status,
    });
  }

  const resultCollection = (await outgoingResponse.json()) as TRecordType[];

  /**
   * Garantizamos que el retorno sea atómico: el objeto o la ausencia del mismo.
   */
  return resultCollection[0] ?? null;
};
