/**
 * @file apps/content-manager-system/src/app/(app)/page.tsx
 * @section CMS Application Group - Protected Welcome Entry Page
 * @description Punto de entrada `/` del sistema de gestión de contenidos. Evalúa en tiempo
 * de ejecución en el servidor (`force-dynamic`) la cookie `HttpOnly` de sesión mediante
 * `ResolveCmsSessionSnapshot` y aplica control de acceso Fail-Closed antes de mostrar
 * la bienvenida operativa.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

import { ResolveCmsSessionSnapshot } from '../../infrastructure/auth/ResolveCmsSessionSnapshot';
import { CmsAuthenticatedDashboard } from './components/CmsAuthenticatedDashboard';
import { CmsRestrictedAccessGate } from './components/CmsRestrictedAccessGate';

/** Fuerza ejecución dinámica en cada solicitud para evitar caché de sesiones entre usuarios. */
export const dynamic = 'force-dynamic';

/**
 * Orquestador de la página de bienvenida protegida del CMS.
 *
 * @returns {Promise<React.ReactElement>} Tablero autenticado o puerta de acceso restringido.
 */
export default async function CmsWelcomeEntryPage(): Promise<React.ReactElement> {
  const sessionSnapshot = await ResolveCmsSessionSnapshot();

  if (sessionSnapshot.sessionStatusLiteral === 'AUTHENTICATED_OPERATOR') {
    return <CmsAuthenticatedDashboard sessionSnapshot={sessionSnapshot} />;
  }

  return <CmsRestrictedAccessGate sessionSnapshot={sessionSnapshot} />;
}
