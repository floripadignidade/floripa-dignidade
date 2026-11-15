/**
 * @file apps/content-manager-system/src/app/(app)/layout.tsx
 * @section CMS Application Group - Institutional Welcome Layout
 * @description Carcasa estructural aislada para las vistas de bienvenida y puerta de acceso
 * del CMS (`/`) separada del grupo `(payload)` para prevenir colisiones de `<html>` y CSS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029 / ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { Metadata, Viewport } from 'next';
import React from 'react';

import { institutionalDisplayFontInstance, institutionalSansFontInstance } from '../fonts';
import '../global.css';

export const metadata: Metadata = {
  title: {
    template: '%s | Admin Floripa Dignidade',
    default: 'Painel de Controle | Floripa Dignidade',
  },
  description: 'Infraestrutura institucional protegida para gestão de conteúdos e auditoria.',
  icons: {
    icon: '/brand/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

export const viewport: Viewport = {
  themeColor: '#003366',
  width: 'device-width',
  initialScale: 1,
};

interface ICmsApplicationLayoutProperties {
  readonly children: React.ReactNode;
}

/**
 * Renderiza el documento HTML5 base del grupo `(app)` inyectando tipografía institucional.
 *
 * @param propertiesSnapshot - Vistas hijas del grupo `(app)`.
 * @returns {React.ReactElement} Estructura HTML5 aislada para la bienvenida autenticada.
 */
const CmsApplicationLayout = ({
  children,
}: ICmsApplicationLayoutProperties): React.ReactElement => (
  <html
    lang="pt-BR"
    dir="ltr"
    suppressHydrationWarning
    className={`${institutionalSansFontInstance.variable} ${institutionalDisplayFontInstance.variable}`}
  >
    <body className="cms-shell-body">{children}</body>
  </html>
);

export default CmsApplicationLayout;
