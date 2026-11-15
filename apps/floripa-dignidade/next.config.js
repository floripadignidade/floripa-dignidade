// @ts-check

/**
 * @section Next.js Configuration - Enterprise Portal Infrastructure Shell
 * @description Manifiesto de configuración institucional para el portal ciudadano.
 * Orquesta la seguridad de cabeceras HTTP, la transpilación unificada del monorepo,
 * optimización multimedia AVIF/WebP y el ruteo tipado nativo en Next.js 16 con Turbopack.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { composePlugins, withNx } from '@nx/next';

/**
 * Contrato compuesto que extiende `NextConfig` con las opciones soportadas por `@nx/next`.
 * @typedef {import('next').NextConfig & { nx?: { svgr?: boolean } }} PortalNextConfig
 */

/**
 * @typedef {{ key: string, value: string }} ISecurityHeader
 */

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @section Ingesta de Cabeceras de Seguridad ISO (Silo JSON)
 */
const securityHeadersSiloPathLiteral = join(
  currentConfigurationDirectoryLiteral,
  '../../libs/shared/utility/src/headers/GlobalSecurityHeaders.json',
);

/** @type {ISecurityHeader[]} */
const globalSecurityHeadersCollection = JSON.parse(
  readFileSync(securityHeadersSiloPathLiteral, 'utf8'),
);

/**
 * @name portalNextConfigurationFoundation
 * @description Configuración base del portal con soporte para ruteo tipado nativo y seguridad perimetral.
 * @type {PortalNextConfig}
 */
const portalNextConfigurationFoundation = {
  /**
   * @section Módulos del Monorepo Autorizados para Transpilación Source-First
   * Turbopack compila directamente las fuentes TypeScript de las librerías internas declaradas.
   */
  transpilePackages: [
    '@floripa-dignidade/contracts',
    '@floripa-dignidade/data-ingestion-engine',
    '@floripa-dignidade/environment-validator',
    '@floripa-dignidade/exceptions',
    '@floripa-dignidade/health-monitor',
    '@floripa-dignidade/identity',
    '@floripa-dignidade/newsletter',
    '@floripa-dignidade/resend-provider',
    '@floripa-dignidade/routing',
    '@floripa-dignidade/search-engine',
    '@floripa-dignidade/shared-design-system',
    '@floripa-dignidade/shared-state-store',
    '@floripa-dignidade/shared-ui-contracts',
    '@floripa-dignidade/shared-ui-foundry',
    '@floripa-dignidade/shared-utility',
    '@floripa-dignidade/telemetry',
    '@floripa-dignidade/territorial-engine',
    '@floripa-dignidade/whatsapp-communication-service',
  ],

  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * @section Ruteo Tipado Nativo Next.js 16 (Estándar Turbopack)
   * Configurado a nivel raíz conforme a las especificaciones Next.js 16+.
   */
  typedRoutes: true,

  /**
   * @section Optimización Multimedia (Core Web Vitals - LCP)
   */
  images: {
    formats: /** @type {const} */ (['image/avif', 'image/webp']),
  },

  /**
   * @section Inyección de Seguridad ISO (Headers Perimetrales)
   */
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: globalSecurityHeadersCollection,
      },
    ];
  },

  /**
   * Configuración de integración específica de Nx.
   */
  nx: {
    svgr: false,
  },
};

/**
 * @name applicationPluginsCollection
 * @description Colección ordenada de plugins para la composición final del entorno de compilación.
 */
const applicationPluginsCollection = [withNx];

/**
 * Exportación del ensamble procesado (`NextConfigFn`) generado por `composePlugins`
 * para el despliegue en Vercel y ejecución en Nx.
 */
const exportedConfigurationSnapshot = composePlugins(...applicationPluginsCollection)(
  portalNextConfigurationFoundation,
);

export default exportedConfigurationSnapshot;
