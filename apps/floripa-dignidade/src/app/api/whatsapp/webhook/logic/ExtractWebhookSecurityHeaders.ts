/**
 * @section WhatsApp Logic - Security Header Extractor Atom
 * @description Átomo encargado de extraer la firma de integridad X-Hub-Signature-256.
 *
 * Protocolo OEDP-V17.0 - I/O Guard & Error Normalization.
 */

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';

/**
 * Extrae la firma de Meta de las cabeceras de la petición.
 *
 * @param incomingRequestHeaders - Cabeceras de la solicitud HTTP.
 * @returns {string} Firma HMAC SHA256 cruda.
 * @throws {GlobalBaseException} Si la cabecera de integridad está ausente.
 */
export const ExtractWebhookSecurityHeaders = (incomingRequestHeaders: Headers): string => {
  const xHubSignatureHeaderLiteral = incomingRequestHeaders.get('x-hub-signature-256');

  if (!xHubSignatureHeaderLiteral) {
    throw MapHttpErrorToException(401, 'CABECERA_DE_INTEGRIDAD_WHATSAPP_FALTANTE');
  }

  return xHubSignatureHeaderLiteral;
};
