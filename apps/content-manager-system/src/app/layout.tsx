/**
 * @section CMS Infrastructure - Root Administrative Layout
 * @description Carcasa estructural primaria para el sistema de gestión de contenidos.
 * Proporciona el contexto global de renderizado y el soporte de hidratación para
 * Payload 3.0. Orquesta la inyección de fuentes institucionales y variables CSS.
 *
 * Protocolo OEDP-V17.0 - High Performance, Type Safety & Zero CLS.
 * SANEADO Zenith: Resolución de TS2304 (Parsing JSX Fault) mediante la reubicación
 * de metadatos descriptivos y delegación de inferencia de retorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Silenciamos la advertencia del compilador porque la librería existe físicamente,
 * pero la resolución de 'bundler' en PNPM estricto falla al localizar el .d.ts de Next.js.
 */
 - TS7016: Falla de resolución profunda de Next.js en entornos Nx/PNPM.
import type { Metadata, Viewport } from 'next';

/* 1. Infraestructura de Estilos (Global Reset) */
/**
 * 🛡️ LEY ZENITH (Fix TS2882):
 * Suprimimos la alerta de módulo no encontrado para efectos secundarios CSS.
 */

import './global.css';

/* 2. ADN Tipográfico (Separado para cumplimiento de SRP) */
import {
  institutionalDisplayFontInstance,
  institutionalSansFontInstance
} from './fonts';

/**
 * @section Gobernanza de Metadatos
 * Define la identidad del búnker administrativo y bloquea el rastro de robots
 * para proteger la superficie de ataque institucional de la ONG.
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Admin Floripa Dignidade',
    default: 'Painel de Controle | Floripa Dignidade',
  },
  description: 'Infraestrutura soberana para a gestão de direitos humanos.',
  icons: {
    icon: '/brand/favicon.ico',
  },
  robots: {
    index: false,
    follow: false,
    nocache: true,
  },
};

/**
 * @section Configuración de Viewport
 * Optimización de experiencia móvil para el panel de operadores de impacto.
 */
export const viewport: Viewport = {
  themeColor: '#003366', // Azul Hercules Institucional
  width: 'device-width',
  initialScale: 1,
};

/**
 * @interface IRootLayoutProperties
 * @description Contrato de propiedades inmutables para el layout administrativo.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IRootLayoutProperties {
  /** Colección de nodos hijos (Panel administrativo o rutas API de Payload). */
  readonly children: React.ReactNode;
}

/**
 * Componente de diseño raíz para el Content Manager System.
 * Implementa el patrón "Sovereign Shell" inyectando el ADN visual en el DOM.
 *
 * @param propertiesSnapshot - Snapshot de propiedades de renderizado inmutables.
 */
export default function RootLayout(
  propertiesSnapshot: IRootLayoutProperties
) {
  const { children } = propertiesSnapshot;

  /**
   * @section Inyección Soberana en el DOM
   * 🛡️ SANEADO Zenith: Comentario ubicado fuera del bloque de retorno para
   * asegurar que el parser reconozca inmediatamente el nodo JSX.
   * 'pt-BR' se establece como lenguaje soberano del enjambre administrativo.
   */
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${institutionalSansFontInstance.variable} ${institutionalDisplayFontInstance.variable}`}
    >
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* 🛡️ RENDERIZADO DEL ENJAMBRE DE PAYLOAD */}
        {children}
      </body>
    </html>
  );
}
