/**
 * @section Messaging Logic - Infrastructure Counter Atom
 * @description Átomo encargado exclusivamente de la extracción física de la
 * cantidad de registros en un Ledger mediante el parseo de la cabecera 'Content-Range'.
 *
 * Protocolo OEDP-V16.0 - High Performance SRE & Stateless I/O.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/**
 * Ejecuta una consulta de conteo exacto en el Tier de Datos.
 *
 * @param tableName - Nombre de la tabla en Supabase.
 * @param queryFilterLiteral - Filtros de búsqueda (ej: 'id=eq.uuid').
 * @param cloudUrl - Endpoint REST institucional.
 * @param cloudKey - Llave de seguridad validada.
 * @returns {Promise<number>} Cantidad total de registros que cumplen el filtro.
 */
export const FetchLedgerCount = async (
  tableName: string,
  queryFilterLiteral: string,
  cloudUrl: string,
  cloudKey: string,
): Promise<number> => {
  /**
   * @section Optimización SRE
   * Usamos 'limit=0' y 'count=exact' para recibir el total en las cabeceras
   * sin descargar ni un solo registro del cuerpo de la respuesta.
   */
  const outgoingResponse = await fetch(
    `${cloudUrl}/rest/v1/${tableName}?${queryFilterLiteral}&limit=0`,
    {
      method: 'GET',
      headers: {
        apikey: cloudKey,
        Authorization: `Bearer ${cloudKey}`,
        Prefer: 'count=exact',
      },
    },
  );

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_CONTEO_FISICO_LEDGER', {
      targetTable: tableName,
      httpStatus: outgoingResponse.status,
    });
  }

  /**
   * Parseo de cabecera 'Content-Range' (Formato ISO: "0-0/42")
   */
  const contentRangeHeaderLiteral = outgoingResponse.headers.get('Content-Range');

  if (!contentRangeHeaderLiteral) {
    return 0;
  }

  const totalPartLiteral = contentRangeHeaderLiteral.split('/')[1];
  return totalPartLiteral ? parseInt(totalPartLiteral, 10) : 0;
};
