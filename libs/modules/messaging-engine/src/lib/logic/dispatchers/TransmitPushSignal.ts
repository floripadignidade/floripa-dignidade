/**
 * @section Messaging Logic - Hardware Communication Atom
 * @description Átomo encargado exclusivamente de la transmisión física de la
 * señal al Web Push Gateway. Implementa el protocolo Stateless para el Edge.
 *
 * Protocolo OEDP-V16.0 - I/O Isolation & Network Resilience.
 * SANEADO Zenith: Inyección de cabeceras soberanas (DRY Enforcement).
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import type { ISovereignHeadersResult } from './CreateSovereignDatabaseHeaders';
import type { IPushPayload } from '../../schemas/PushPayload.schema';

/**
 * Ejecuta el envío físico hacia el motor de entrega de notificaciones.
 *
 * @param cloudUrl - Endpoint de la infraestructura cloud.
 * @param securityHeaders - Cabeceras de seguridad institucionales.
 * @param targetToken - Token secreto del dispositivo ciudadano.
 * @param payload - ADN visual de la notificación.
 * @param correlationId - ID de trazabilidad forense.
 */
export const TransmitPushSignal = async (
  cloudUrl: string,
  securityHeaders: ISovereignHeadersResult,
  targetToken: string,
  payload: IPushPayload,
  correlationId: string,
): Promise<void> => {
  const outgoingResponse = await fetch(`${cloudUrl}/functions/v1/deliver-push-signal`, {
    method: 'POST',
    headers: { ...securityHeaders },
    body: JSON.stringify({
      targetTokenSecret: targetToken,
      notificationData: payload,
      correlationIdentifier: correlationId,
    }),
  });

  if (!outgoingResponse.ok) {
    throw new InternalSystemException('FALLO_TRANSMISION_PUSH_GATEWAY', {
      httpStatus: outgoingResponse.status,
      statusText: outgoingResponse.statusText,
    });
  }
};
