/**
 * @section Application Edge Middleware - Swarm Entry Point
 * @description Puerta de enlace soberana para la aplicación principal.
 * Activa el orquestador de sensores cognitivos en el Edge de Vercel para
 * gestionar la localización, seguridad perimetral y trazabilidad forense.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de 'any' mediante casting de soberanía e integridad de tipos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Motores de Ruteo (Sovereign Routing Swarm) */
import { GlobalRequestOrchestrator } from '@floripa-dignidade/routing';

/**
 * Manejador de middleware soberano.
 * Actúa como el primer sensor en la frontera de la nube.
 *
 * @param incomingRequestSnapshot - Objeto de solicitud nativo capturado por el Edge Runtime.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada.
 */
export async function middleware(
  incomingRequestSnapshot: NextRequest
): Promise<NextResponse> {

  /**
   * @section Saneamiento de Identidad de Tipo (Sovereign Bridge)
   * 🛡️ SANEADO Zenith: Erradicado el uso de 'any'.
   * Se utiliza un casting doble (unknown -> target) para asegurar la
   * interoperabilidad entre el búnker de aplicación y la librería de
   * ruteo, manteniendo el rigor del compilador.
   */
  const authorizedRequestSnapshot = incomingRequestSnapshot as unknown as NextRequest;

  /**
   * Delegación al Enjambre de Sensores.
   * El orquestador aplicará las políticas de anti-bot y soberanía lingüística.
   */
  return await GlobalRequestOrchestrator(authorizedRequestSnapshot);
}

/**
 * @section Gobernanza de Radio de Acción (Matcher)
 * Define las fronteras donde el Neural Sentinel no debe intervenir para
 * optimizar el rendimiento y preservar activos estáticos.
 */
export const config = {
  /**
   * Excluye explícitamente:
   * - Rutas de API internas.
   * - Rastro técnico de Next.js (_next/static, _next/image).
   * - Activos de marca y multimedia (.svg, .png, .jpg, etc).
   * - Manifiestos de robots y buscadores.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|brand|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$|robots.txt).*)',
  ],
};
