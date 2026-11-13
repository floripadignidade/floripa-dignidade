/**
 * @section Routing Logic - Context Initialization Atom
 * @description Genera el ADN inicial de la solicitud. Captura la identidad
 * técnica del dispositivo y el idioma detectado para el enjambre.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Forensic Capture.
 */

import type { NextRequest } from 'next/server';
import type { IRoutingContext } from '../../schemas/RoutingContext.schema';
import { DetermineDeviceLocale } from './DetermineDeviceLocale';
import { AnalyzeRequestMetadata } from './AnalyzeRequestMetadata';

/**
 * Crea una instancia inmutable del contexto de ruteo para la transacción actual.
 *
 * @param incomingRequest - Solicitud física capturada por el Edge.
 * @param correlationIdentifier - ID de seguimiento forense generado para el hilo.
 * @returns {IRoutingContext} Contexto soberano hidratado.
 */
export const InitializeRoutingContext = (
  incomingRequest: NextRequest,
  correlationIdentifier: string,
): IRoutingContext => {
  const initialContext: IRoutingContext = {
    correlationIdentifier,
    detectedLocale: DetermineDeviceLocale(incomingRequest.headers.get('accept-language')),
    clientMetadata: {
      ipAddressLiteral: 'unknown',
      userAgentLiteral: 'unknown',
    },
    isRequestAuthorizedBoolean: true,
  };

  /**
   * Enriquecemos el contexto mediante el analizador de metadatos (IP/UA).
   */
  return AnalyzeRequestMetadata(incomingRequest.headers, initialContext);
};
