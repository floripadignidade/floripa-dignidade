/**
 * @section Newsletter Logic - Success Response Builder Atom
 * @description Átomo de lógica pura que construye el objeto de respuesta nominal
 * para el inicio del embudo de suscripción.
 *
 * Protocolo OEDP-V17.0 - Pure Logic & Contract Integrity.
 */

/**
 * @interface ISubscriptionSuccessPayload
 * @description Contrato de salida para el cliente (Frontend).
 */
export interface ISubscriptionSuccessPayload {
  readonly isOperationSuccessfulBoolean: boolean;
  readonly messageIdentifierLiteral: string;
  readonly trackingIdentifier: string;
  readonly occurrenceTimestampISO: string;
}

/**
 * Ensambla el snapshot de respuesta exitosa.
 *
 * @param correlationIdentifier - ID de seguimiento forense de la transacción.
 * @returns {ISubscriptionSuccessPayload} Objeto inmutable de respuesta.
 */
export const BuildSubscriptionSuccessResponse = (
  correlationIdentifier: string,
): ISubscriptionSuccessPayload => {
  return {
    isOperationSuccessfulBoolean: true,
    messageIdentifierLiteral: 'SUBSCRIPTION_REQUEST_PENDING_VERIFICATION',
    trackingIdentifier: correlationIdentifier,
    occurrenceTimestampISO: new Date().toISOString(),
  };
};
