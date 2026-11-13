/**
 * @section WhatsApp Logic - Payload Parser Atom
 * @description Átomo encargado de la transformación de texto a ADN de datos.
 *
 * Protocolo OEDP-V17.0 - Data Integrity & Resilience.
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';

/**
 * Parsea el cuerpo de la petición garantizando la integridad del formato JSON.
 *
 * @param rawBodyLiteral - Texto plano del cuerpo de la solicitud.
 * @returns {unknown} Objeto JSON para el triaje del enjambre.
 * @throws {GlobalBaseException} Si el JSON está malformado.
 */
export const ParseWhatsAppEventPayload = (rawBodyLiteral: string): unknown => {
  try {
    return JSON.parse(rawBodyLiteral);
  } catch (_caughtError: unknown) {
    throw MapHttpErrorToException(400, 'PAYLOAD_JSON_WHATSAPP_MALFORMADO');
  }
};
