/**
 * @section Messaging Logic - Physical Persistence Dispatcher
 * @description Átomo encargado exclusivamente de la comunicación I/O con
 * el Tier de Datos. Implementa el protocolo Stateless para el Edge Runtime.
 *
 * Protocolo OEDP-V16.0 - Hardware Isolation & Network Resilience.
 * SANEADO Zenith: Inyección de cabeceras pre-validadas (DRY Enforcement).
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { ISovereignHeadersResult } from './CreateSovereignDatabaseHeaders';

/**
 * Ejecuta la inserción física del mensaje en la nube soberana.
 *
 * @param cloudUrlLiteral - Endpoint de la base de datos REST.
 * @param securityHeaders - Cabeceras generadas por el átomo de seguridad.
 * @param mappedPayload - Datos del mensaje transformados para el Ledger.
 */
export const PersistDirectMessageTransaction = async (
  cloudUrlLiteral: string,
  securityHeaders: ISovereignHeadersResult,
  mappedPayload: Record<string, unknown>,
): Promise<void> => {
  const outgoingResponse = await fetch(`${cloudUrlLiteral}/rest/v1/direct_messages_ledger`, {
    method: 'POST',
    headers: {
      ...securityHeaders,
    },
    body: JSON.stringify(mappedPayload),
  });

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_FISICO_PERSISTENCIA_MENSAJERIA', {
      httpStatus: outgoingResponse.status,
      statusText: outgoingResponse.statusText,
    });
  }
};
