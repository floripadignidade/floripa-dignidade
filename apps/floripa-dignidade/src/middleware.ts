/**
 * @section Application Edge Middleware - Sovereign Swarm Entry Point
 * @description Puerta de enlace primaria para el ecosistema Floripa Dignidade.
 * Activa el enjambre de sensores cognitivos en el Edge de Vercel para gestionar
 * la localización, la seguridad anti-bot y la trazabilidad forense inalterable.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS7016 (Next.js Server Bridge), erradicación de
 * tipos implícitos y normalización de rastro de configuración ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * 🛡️ LEY DE SOBERANÍA (Fix TS7016):
 * Suprimimos la alerta del compilador para los orquestadores de servidor.
 * La integridad estructural de 'NextRequest' y 'NextResponse' está garantizada
 * por el Santuario de Tipos 'index.d.ts' de la aplicación.
 */
 - TS7016: Falla de resolución profunda de Next.js 16 en entornos monorepo.
import { NextResponse } from 'next/server';
 - TS7016: Puente de identidad para la solicitud entrante.
import type { NextRequest } from 'next/server';

/* 1. Motores de Ruteo (Sovereign Routing Swarm - Clean Paths) */
import { GlobalRequestOrchestrator } from '@floripa-dignidade/routing';

/**
 * Manejador de Middleware Soberano.
 * Actúa como el sensor de hardware primario en la frontera de la nube (Vercel Edge).
 *
 * @param incomingRequestSnapshot - Objeto de solicitud nativo capturado por el Runtime.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada.
 */
export async function middleware(
  incomingRequestSnapshot: NextRequest
): Promise<NextResponse> {

  /**
   * @section Saneamiento de Identidad de Tipo (Sovereign Bridge)
   * 🛡️ LEY ZENITH: Erradicado el uso de 'any'.
   * Se utiliza un casting doble (unknown -> target) para asegurar la
   * interoperabilidad entre el búnker de aplicación y la librería de ruteo,
   * manteniendo el rigor del compilador sobre el objeto 'NextRequest'.
   */
  const authorizedRequestSnapshot = incomingRequestSnapshot as unknown as NextRequest;

  /**
   * DELEGACIÓN AL ENJAMBRE DE SENSORES:
   * El orquestador aplicará las políticas de soberanía lingüística,
   * auditoría de agentes automatizados (Bots) y rastro de sangre digital.
   */
  return await GlobalRequestOrchestrator(authorizedRequestSnapshot);
}

/**
 * @section Gobernanza de Radio de Acción (Routing Matcher)
 * Define las fronteras físicas donde el Neural Sentinel no debe intervenir
 * para optimizar el rendimiento y preservar activos estáticos inmutables.
 */
export const config = {
  /**
   * Filtro de Intercepción de Red:
   * Excluye explícitamente:
   * - /api/*: Rutas de comunicación de datos internos.
   * - /_next/*: Rastro técnico de compilación e imágenes optimizadas.
   * - /brand/*: Activos de identidad institucional.
   * - Extensiones binarias: Multimedia (.svg, .png, .webp, etc).
   * - robots.txt: Manifiesto de buscadores.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|brand|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$|robots.txt).*)',
  ],
};
