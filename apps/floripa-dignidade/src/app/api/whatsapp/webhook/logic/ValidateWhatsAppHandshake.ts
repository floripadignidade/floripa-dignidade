/**
 * @section WhatsApp Logic - Handshake Validator Atom
 * @description Átomo encargado de verificar la legitimidad de la solicitud
 * de suscripción enviada por los servidores de Meta.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Pure Logic.
 */

interface IHandshakeResult {
  readonly isAuthorizedBoolean: boolean;
  readonly challengeLiteral: string | null;
}

/**
 * Evalúa los parámetros del hub de Meta contra el secreto soberano.
 *
 * @param queryParameters - Parámetros de búsqueda de la URL.
 * @param systemVerifyTokenSecret - Token de verificación validado por la aduana de entorno.
 * @returns {IHandshakeResult} Resultado de la validación y el desafío a retornar.
 */
export const ValidateWhatsAppHandshake = (
  queryParameters: URLSearchParams,
  systemVerifyTokenSecret: string,
): IHandshakeResult => {
  const modeLiteral = queryParameters.get('hub.mode');
  const tokenLiteral = queryParameters.get('hub.verify_token');
  const challengeLiteral = queryParameters.get('hub.challenge');

  const isAuthorizedBoolean =
    modeLiteral === 'subscribe' && tokenLiteral === systemVerifyTokenSecret;

  return {
    isAuthorizedBoolean,
    challengeLiteral,
  };
};
