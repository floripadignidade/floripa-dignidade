/**
 * @section Application Shell - Root Structural Layout
 * @description Carcasa HTML5 raíz del portal ciudadano Floripa Dignidade.
 * Inyecta estilos globales, variables tipográficas institucionales (`Inter` / `Lexend`),
 * metadatos PWA/SEO y el guardián de conectividad de cliente (`PersistenceGuardian`),
 * delegando la navegación localizada en `[locale]/layout.tsx` para evitar cabeceras duplicadas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0025 / ADR 0029 / ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Rendimiento y Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import type { Metadata, Viewport } from 'next';

import {
  ACTIVE_LOCALES_ENTRIES_COLLECTION,
  DEFAULT_LOCALE_IDENTIFIER,
} from '@floripa-dignidade/contracts';
import { PersistenceGuardian } from '@floripa-dignidade/shared-state-store';

import './global.css';
import { institutionalDisplayFontInstance, institutionalSansFontInstance } from './fonts';

export const metadata: Metadata = {
  title: {
    template: '%s | Floripa Dignidade',
    default: 'Floripa Dignidade | Defesa dos Direitos Humanos e Cidadania',
  },
  description:
    'Plataforma cidadã de transparência orçamentária e direitos humanos em Florianópolis.',
  icons: {
    icon: '/brand/favicon.ico',
    apple: '/brand/pwa/apple-touch-icon.png',
  },
  manifest: '/manifest.webmanifest',
};

export const viewport: Viewport = {
  themeColor: '#003366',
  width: 'device-width',
  initialScale: 1,
};

interface IRootLayoutProperties {
  readonly children: React.ReactNode;
}

const defaultLocaleMetadataEntry = ACTIVE_LOCALES_ENTRIES_COLLECTION.find(
  (localeEntrySnapshot) => localeEntrySnapshot.localeCodeLiteral === DEFAULT_LOCALE_IDENTIFIER,
);

const defaultTextDirectionLiteral = defaultLocaleMetadataEntry?.textDirectionLiteral ?? 'ltr';

/**
 * Envuelve el árbol completo del portal con la estructura HTML5 base e hidratación resiliente.
 *
 * @param propertiesSnapshot - Nodos hijos inyectados por Next.js App Router.
 * @returns {React.JSX.Element} Documento HTML5 raíz libre de bloqueos y duplicidad de header.
 */
export default function RootLayout(propertiesSnapshot: IRootLayoutProperties): React.JSX.Element {
  const { children } = propertiesSnapshot;

  return (
    <html
      lang={DEFAULT_LOCALE_IDENTIFIER}
      dir={defaultTextDirectionLiteral}
      suppressHydrationWarning
      className={`${institutionalSansFontInstance.variable} ${institutionalDisplayFontInstance.variable}`}
    >
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
        <PersistenceGuardian>
          <div className="flex-grow flex flex-col">{children}</div>
        </PersistenceGuardian>
      </body>
    </html>
  );
}
