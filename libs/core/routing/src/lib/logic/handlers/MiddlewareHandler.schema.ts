/**
 * @section Routing DNA - Middleware Swarm Handler
 * @description Define el contrato para los sensores cognitivos de frontera.
 *
 * Protocolo OEDP-V15.0 - Swarm Intelligence.
 */

import type { NextRequest, NextResponse } from 'next/server';
import type { IRoutingContext } from '../../schemas/RoutingContext.schema';

/**
 * Firma de un Sensor del Enjambre.
 * Cada handler puede retornar una respuesta (abortando el flujo) o nada (continuando).
 */
export type IMiddlewareHandler = (
  incomingRequest: NextRequest,
  routingContext: IRoutingContext,
) => Promise<NextResponse | void>;
