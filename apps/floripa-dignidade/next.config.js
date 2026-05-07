// @ts-check
/**
 * @section Next.js Configuration - Zenith Infrastructure Shell
 * @description Manifiesto de configuración soberano para el portal ciudadano de
 * Floripa Dignidade. Orquesta la seguridad de cabeceras, la transpilación de
 * búnkeres del monorepo y la integración con el motor de Nx.
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Standard Naming.
 * SANEADO Zenith: Resolución de visibilidad, Prosa ISO y optimización de carga de silos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { composePlugins, withNx } from '@nx/next';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @section Ingesta de Artefactos de Seguridad (Silo JSON)
 * SANEADO: Ruta absoluta calculada para garantizar la interoperabilidad en Vercel.
 */
const securityHeadersSiloPathLiteral = join(
  currentConfigurationDirectoryLiteral,
  '../../libs/shared/src/lib/utility/GlobalSecurityHeaders.json'
);

/** @type {import('../../libs/shared/src/lib/utility/GlobalSecurityHeaders').ISecurityHeader[]} */
const globalSecurityHeadersCollection = JSON.parse(
  readFileSync(securityHeadersSiloPathLiteral, 'utf8')
);

/**
 * @name portalNextConfigurationFoundation
 * @description ADN base del portal con soporte para ruteo tipado y seguridad ISO.
 * @type {import('next').NextConfig}
 */
const portalNextConfigurationFoundation = {
  /**
   * Colección de búnkeres autorizados para transpilación.
   * Garantiza que el código fuente de las librerías sea procesado por el motor de Next.js 16+.
   */
  transpilePackages: [
    '@floripa-dignidade/shared',
    '@floripa-dignidade/telemetry',
    '@floripa-dignidade/routing',
    '@floripa-dignidade/exceptions',
    '@floripa-dignidade/identity',
    '@floripa-dignidade/newsletter',
    '@floripa-dignidade/analytics',
    '@floripa-dignidade/health-monitor',
    '@floripa-dignidade/search-engine',
    '@floripa-dignidade/resend-provider',
    '@floripa-dignidade/tools',
    '@floripa-dignidade/scripts'
  ],

  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Optimización de ruteo tipado de grado Enterprise.
   * Habilita el autocompletado de URLs internas basado en el sistema de archivos.
   */
  experimental: {
    typedRoutes: true,
  },

  /**
   * @section Inyección de Seguridad ISO (Headers)
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
   * 🛡️ SANEADO Zenith: TS2353
   * Propiedad inyectada procesada exclusivamente por el orquestador '@nx/next'.
   */
  // @ts-expect-error - Requerimiento físico del motor de Nx
  nx: {
    svgr: false,
  },
};

/**
 * @name applicationPluginsCollection
 * @description Swarm de plugins para la composición final del entorno.
 */
const applicationPluginsCollection = [withNx];

/**
 * Exportación del ensamble procesado para el despliegue.
 */
export default composePlugins(...applicationPluginsCollection)(portalNextConfigurationFoundation);
