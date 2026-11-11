/**
 * @section Application Edge Proxy - Network Perimeter Routing Interceptor
 * @description Puerta de enlace primaria y proxy perimetral para el ecosistema Floripa Dignidade.
 * Intercepta el tráfico de red antes del renderizado de páginas para coordinar la soberanía
 * lingüística (i18n), la seguridad contra interferencias automatizadas y la emisión del
 * identificador inalterable de correlación forense (Correlation ID).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Next.js 16 Proxy Specification).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad, Confiabilidad y Eficiencia).
 * SANEADO Next.js 16: Migración de la convención obsoleta 'middleware' a 'proxy' (RFC Next.js 16).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Orquestación de Ruteo e Infraestructura Perimetral */
import { GlobalRequestOrchestrator } from '@floripa-dignidade/routing';

/**
 * Manejador perimetral de red (Next.js 16 Edge Proxy).
 * Actúa como sensor primario en la frontera de red antes de que la petición alcance el App Router.
 *
 * @param incomingRequestSnapshot - Solicitud física entrante capturada por el Edge Runtime de Vercel.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada con cabeceras forenses.
 */
export async function proxy(incomingRequestSnapshot: NextRequest): Promise<NextResponse> {
  /**
   * @section Delegación al Orquestador Perimetral
   * El orquestador aplica las políticas de soberanía lingüística, auditoría
   * de agentes automatizados y emisión de identificadores de correlación forense.
   */
  return await GlobalRequestOrchestrator(incomingRequestSnapshot);
}

/**
 * Exportación por defecto para compatibilidad total con empaquetadores y Turbopack.
 */
export default proxy;

/**
 * @section Gobernanza de Radio de Acción (Routing Matcher Configuration)
 * Define las fronteras de red donde el interceptor no debe ejecutarse,
 * optimizando el consumo de cómputo en el Edge y preservando activos estáticos.
 */
export const config = {
  /**
   * Filtro de exclusión perimetral:
   * - /api/*: Rutas de comunicación de datos internos (Data Lake / Webhooks).
   * - /_next/*: Rastro técnico de compilación, chunks y optimización de imágenes.
   * - /brand/*: Activos estáticos de identidad institucional.
   * - Extensiones binarias: Activos multimedia (.svg, .png, .jpg, .jpeg, .webp).
   * - /robots.txt: Manifiesto institucional para rastreadores de búsqueda.
   */
  matcher: [
    '/((?!api|_next/static|_next/image|brand|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|webp)$|robots.txt).*)',
  ],
};
