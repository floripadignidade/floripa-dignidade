/**
 * @section Newsletter Logic - Request Extraction Atom
 * @description Átomo encargado de la captura física del cuerpo de la petición.
 * Implementa una guardia de seguridad para prevenir payloads nulos.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & I/O Guard.
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';

/**
 * Extrae el contenido JSON de la solicitud entrante.
 *
 * @param incomingRequest - Objeto de solicitud nativo de Next.js.
 * @returns {Promise<unknown>} Payload crudo para ser procesado por la aduana Zod.
 * @throws {GlobalBaseException} Si el cuerpo está vacío o es ilegible.
 */
export const ExtractIncomingSubscriptionPayload = async (
  incomingRequest: Request,
): Promise<unknown> => {
  try {
    const payloadSnapshot = await incomingRequest.json();

    if (!payloadSnapshot || Object.keys(payloadSnapshot).length === 0) {
      throw new Error('EMPTY_PAYLOAD');
    }

    return payloadSnapshot;
  } catch (_caughtError: unknown) {
    throw MapHttpErrorToException(400, 'PAYLOAD_VACIO_O_MALFORMADO');
  }
};
