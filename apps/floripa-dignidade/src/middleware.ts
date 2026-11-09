/**
 * @section Application Edge Middleware - Edge Routing Interceptor
 * @description Puerta de enlace primaria para el ecosistema Floripa Dignidade.
 * Intercepta el tráfico en el Edge Runtime de Vercel para coordinar la localización,
 * la seguridad perimetral y la trazabilidad forense inalterable (Correlation ID).
 *
 * Protocolo OEDP-V18.1 - High Performance SRE & Edge Routing Integrity.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Eficiencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/* 1. Orquestación de Ruteo e Infraestructura Perimetral */
import { GlobalRequestOrchestrator } from '@floripa-dignidade/routing';

/**
 * Manejador principal de intercepción de borda (Next.js Edge Middleware).
 * Actúa como sensor primario en la frontera de red antes del renderizado de páginas.
 *
 * @param incomingRequestSnapshot - Solicitud física entrante capturada por el Edge Runtime.
 * @returns {Promise<NextResponse>} Respuesta procesada, redirigida o autorizada para el App Router.
 */
export async function middleware(
  incomingRequestSnapshot: NextRequest,
): Promise<NextResponse> {
  /**
   * @section Delegación al Orquestador Perimetral
   * El orquestador aplica las políticas de soberanía lingüística, auditoría
   * de agentes automatizados y emisión de identificadores de correlación forense.
   */
  return await GlobalRequestOrchestrator(incomingRequestSnapshot);
}

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
