/**
 * @section Messaging Logic - Membership Persistence Atom
 * @description Átomo encargado exclusivamente de la comunicación I/O para
 * registrar o actualizar la membresía de un ciudadano en un Action Hub.
 *
 * Protocolo OEDP-V16.0 - Hardware Isolation & Network Resilience.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { ISovereignHeadersResult } from './CreateSovereignDatabaseHeaders';

/**
 * Ejecuta la transacción física de membresía utilizando el protocolo Upsert.
 */
export const PersistMembershipTransition = async (
  cloudUrl: string,
  securityHeaders: ISovereignHeadersResult,
  membershipPayload: Record<string, unknown>,
): Promise<void> => {
  const outgoingResponse = await fetch(`${cloudUrl}/rest/v1/group_memberships_ledger`, {
    method: 'POST',
    headers: { ...securityHeaders },
    body: JSON.stringify(membershipPayload),
  });

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_FISICO_PERSISTENCIA_MEMBRESIA', {
      httpStatus: outgoingResponse.status,
      statusText: outgoingResponse.statusText,
    });
  }
};
