/**
 * @section CMS Infrastructure - Root Administrative Layout
 * @description Carcasa estructural primaria para el sistema de gestión de contenidos (CMS).
 * Proporciona el contexto global de renderizado y el soporte de hidratación para
 * Payload 3.84. Orquesta la inyección de fuentes institucionales y variables CSS nativas.
 *
 * Protocolo OEDP-V18.1 - High Performance, Type Safety & Zero CLS.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Eficiencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import type { Metadata, Viewport } from 'next';

/* 1. Infraestructura de Estilos y Reseteo Global */
import './global.css';

/* 2. Fundación Tipográfica Institucional */
import { institutionalDisplayFontInstance, institutionalSansFontInstance } from './fonts';

/**
 * @section Gobernanza de Metadatos
 * Define la identidad del panel administrativo y bloquea el rastro de motores de búsqueda
 * para proteger la superficie de exposición institucional.
 */
export const metadata: Metadata = {
  title: {
    template: '%s | Admin Floripa Dignidade',
    default: 'Painel de Controle | Floripa Dignidade',
  },
  description: 'Infraestrutura institucional para a gestão de direitos humanos.',
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
 * Optimización de experiencia móvil para operadores y auditores institucionales.
 */
export const viewport: Viewport = {
  themeColor: '#003366', // Azul Hercules Institucional
  width: 'device-width',
  initialScale: 1,
};

/**
 * @interface IRootLayoutProperties
 * @description Contrato inmutable de propiedades para el layout administrativo.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IRootLayoutProperties {
  /** Colección de nodos hijos (Vistas del panel administrativo o rutas de API de Payload). */
  readonly children: React.ReactNode;
}

/**
 * Componente de diseño raíz para el Content Manager System.
 * Implementa la carcasa institucional inyectando las fuentes y variables CSS en el DOM.
 *
 * @param propertiesSnapshot - Snapshot inmutable de propiedades de renderizado.
 * @returns {React.JSX.Element} Estructura HTML5 raíz del panel administrativo.
 */
export default function RootLayout(propertiesSnapshot: IRootLayoutProperties): React.JSX.Element {
  const { children } = propertiesSnapshot;

  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${institutionalSansFontInstance.variable} ${institutionalDisplayFontInstance.variable}`}
    >
      <body className="antialiased min-h-screen bg-slate-50 text-slate-900 font-sans">
        {/* Renderizado de vistas administrativas de Payload CMS */}
        {children}
      </body>
    </html>
  );
}
