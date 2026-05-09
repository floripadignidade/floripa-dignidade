// @ts-check

/**
 * @section Next.js Configuration - Zenith Infrastructure Shell
 * @description Manifiesto de configuración soberano para el portal ciudadano.
 * Orquesta la seguridad de cabeceras, la transpilación de búnkeres del monorepo
 * y la integración con el motor de Nx.
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Standard Naming.
 * SANEADO Zenith: Resolución de Asfixia de Identidad (Fix TS7016) mediante
 * inyección de tipo explícito y erradicación de rastro relativo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * 🛡️ LEY DE IDENTIDAD (Fix TS7016):
 * Forzamos la carga de tipos de Next.js para que el orquestador reconozca
 * el contrato 'NextConfig' sin ambigüedades en entornos de PNPM estricto.
 * @typedef {import('next').NextConfig} NextConfig
 */

import { composePlugins, withNx } from '@nx/next';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @interface ISecurityHeader
 * @description Definición local para evitar la importación de archivos .ts
 * fuera del rootDir de la aplicación durante la fase de validación de config.
 */
/** @typedef {{ key: string, value: string }} ISecurityHeader */

/**
 * @section Ingesta de Artefactos de Seguridad (Silo JSON)
 */
const securityHeadersSiloPathLiteral = join(
  currentConfigurationDirectoryLiteral,
  '../../libs/shared/utility/src/headers/GlobalSecurityHeaders.json'
);

/** @type {ISecurityHeader[]} */
const globalSecurityHeadersCollection = JSON.parse(
  readFileSync(securityHeadersSiloPathLiteral, 'utf8')
);

/**
 * @name portalNextConfigurationFoundation
 * @description ADN base del portal con soporte para ruteo tipado y seguridad ISO.
 * @type {NextConfig}
 */
const portalNextConfigurationFoundation = {
  /**
   * Colección de búnkeres autorizados para transpilación.
   * 🛡️ SANEADO Zenith: Alineación con la nueva topología de búnkeres Shared.
   */
  transpilePackages: [
    '@floripa-dignidade/shared-utility',
    '@floripa-dignidade/shared-state-store',
    '@floripa-dignidade/shared-ui-foundry',
    '@floripa-dignidade/telemetry',
    '@floripa-dignidade/routing',
    '@floripa-dignidade/exceptions',
    '@floripa-dignidade/identity',
    '@floripa-dignidade/newsletter',
    '@floripa-dignidade/analytics',
    '@floripa-dignidade/health-monitor',
    '@floripa-dignidade/search-engine',
    '@floripa-dignidade/resend-provider'
  ],

  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * Optimización de ruteo tipado de grado Enterprise.
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
   * Configuración específica de Nx.
   */
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
 * @type {NextConfig}
 */
const exportedConfigurationSnapshot = composePlugins(...applicationPluginsCollection)(
  portalNextConfigurationFoundation
);

export default exportedConfigurationSnapshot;
