// @ts-check

/**
 * @section Next.js Configuration - Enterprise Portal Infrastructure Shell
 * @description Manifiesto de configuración institucional para el portal ciudadano.
 * Orquesta la seguridad de cabeceras HTTP, la transpilación unificada del monorepo
 * y el ruteo tipado de grado Enterprise en Next.js 16 con Turbopack.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 * SANEADO Turbopack: Promoción de 'typedRoutes' a nivel raíz y blindaje de transpilePackages.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 🛡️ LEY DE IDENTIDAD:
 * Garantiza la tipificación estricta de NextConfig en entornos de compilación pnpm.
 * @typedef {import('next').NextConfig} NextConfig
 */

import { composePlugins, withNx } from '@nx/next';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @typedef {{ key: string, value: string }} ISecurityHeader
 */

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
 * @description ADN base del portal con soporte para ruteo tipado nativo y seguridad perimetral.
 * @type {NextConfig}
 */
const portalNextConfigurationFoundation = {
  /**
   * @section Búnkeres del Monorepo Autorizados para Transpilación
   * Turbopack requiere la declaración explícita de librerías del workspace.
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
   * Promovido fuera del bloque 'experimental' conforme a las especificaciones v16+.
   */
  typedRoutes: true,

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
 * @description Swarm de plugins para la composición final del entorno de compilación.
 */
const applicationPluginsCollection = [withNx];

/**
 * Exportación del ensamble procesado para el despliegue en Vercel.
 * @type {NextConfig}
 */
const exportedConfigurationSnapshot = composePlugins(...applicationPluginsCollection)(
  portalNextConfigurationFoundation,
);

export default exportedConfigurationSnapshot;
