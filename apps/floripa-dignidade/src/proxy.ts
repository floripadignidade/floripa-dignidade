/**
 * @section Application Edge Proxy - Network Perimeter Routing Interceptor
 * @description Puerta de enlace primaria y proxy perimetral del portal Floripa Dignidade.
 * Intercepta el tráfico de red antes del renderizado de páginas para coordinar la
 * localización BCP 47 (i18n), la protección contra interferencias automatizadas y la
 * emisión del identificador inalterable de correlación forense (Correlation ID).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Next.js 16 Proxy Specification).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Eficiencia) y ADR 0028.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { NextRequest, NextResponse } from 'next/server';

/* 1. Orquestación de Enrutamiento e Infraestructura Perimetral */
import { GlobalRequestOrchestrator } from '@floripa-dignidade/routing';

/**
 * Manejador perimetral de red (Next.js 16 Proxy).
 * Actúa como sensor primario en la frontera de red antes de alcanzar el App Router.
 *
 * @param incomingRequestSnapshot - Solicitud física entrante capturada por el runtime de Vercel.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada con cabeceras forenses.
 */
export async function proxy(incomingRequestSnapshot: NextRequest): Promise<NextResponse> {
  /**
   * Delegación al orquestador perimetral para evaluación anti-automatización,
   * detección BCP 47 e inyección de trazabilidad forense.
   */
  return await GlobalRequestOrchestrator(incomingRequestSnapshot);
}

/**
 * Exportación por defecto para compatibilidad con empaquetadores y Turbopack.
 */
export default proxy;

/**
 * @section Gobernanza de Radio de Acción (Routing Matcher Configuration)
 * Define mediante literal estático las rutas de red excluidas de la intercepción del proxy,
 * optimizando cómputo perimetral y preservando acceso directo a activos públicos y PWA.
 */
export const config = {
  /**
   * Exclusiones perimetrales:
   * - api: Gateways de API internos y webhooks.
   * - _next/static, _next/image: Chunks compilados y optimizador de imágenes.
   * - brand, meta: Bóvedas públicas de identidad visual y tarjetas OpenGraph/Twitter (ADR 0028).
   * - favicon.ico, manifest.webmanifest, robots.txt, sitemap.xml: Manifiestos raíz W3C/SEO.
   * - Extensiones estáticas: svg, png, jpg, jpeg, webp, avif, ico, webmanifest.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|brand|meta|favicon\\.ico|manifest\\.webmanifest|robots\\.txt|sitemap\\.xml|.*\\.(?:svg|png|jpg|jpeg|webp|avif|ico|webmanifest)$).*)',
  ],
};
