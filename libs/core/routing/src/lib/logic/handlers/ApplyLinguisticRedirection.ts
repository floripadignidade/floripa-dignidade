/**
 * @section Routing Sensors - Linguistic Redirection
 * @description Sensor encargado de validar y forzar la soberanía del idioma en la URL.
 *
 * Protocolo OEDP-V15.0 - Atomic Sensor.
 */

import { NextResponse } from 'next/server';
// import type { NextRequest } from 'next/server';
import type { IMiddlewareHandler } from './MiddlewareHandler.schema';
import { CalculateRouteRedirection } from '../atomic/CalculateRouteRedirection';

export const ApplyLinguisticRedirection: IMiddlewareHandler = async (
  incomingRequest,
  routingContext,
) => {
  const { pathname } = incomingRequest.nextUrl;

  const decision = CalculateRouteRedirection(
    pathname,
    routingContext.detectedLocale,
    incomingRequest.url,
  );

  if (decision.isRedirectionRequiredBoolean && decision.localizedTargetUrl) {
    const redirectResponse = NextResponse.redirect(decision.localizedTargetUrl);

    // Inyectamos trazabilidad antes de abortar
    redirectResponse.headers.set('X-Floripa-Correlation-ID', routingContext.correlationIdentifier);
    redirectResponse.headers.set('X-Floripa-Redirect-Reason', 'LINGUISTIC_SOVEREIGNTY');

    return redirectResponse;
  }

  return; // Continuar al siguiente sensor
};
