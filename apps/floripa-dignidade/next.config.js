// @ts-check

/**
 * @file apps/floripa-dignidade/next.config.js
 * @section Next.js Configuration - Enterprise Portal Infrastructure Shell
 * @description Manifiesto de configuración institucional para el portal ciudadano.
 * Orquesta cabeceras de seguridad HTTP, transpilación Source-First del monorepo,
 * optimización multimedia AVIF/WebP con lista blanca estricta de orígenes remotos
 * (Supabase Storage y Payload CMS bajo TLS), ruteo tipado nativo en Next.js 16 e
 * integración con Nx.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0034 / ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import { composePlugins, withNx } from '@nx/next';

/**
 * @typedef {import('next').NextConfig & { nx?: { svgr?: boolean } }} PortalNextConfig
 * @typedef {{ key: string, value: string }} ISecurityHeader
 * @typedef {{ protocol: 'http' | 'https', hostname: string, port?: string, pathname: string }} IRemoteImagePattern
 */

const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

const securityHeadersSiloPathLiteral = join(
  currentConfigurationDirectoryLiteral,
  '../../libs/shared/utility/src/headers/GlobalSecurityHeaders.json',
);

/** @type {ISecurityHeader[]} */
const globalSecurityHeadersCollection = JSON.parse(
  readFileSync(securityHeadersSiloPathLiteral, 'utf8'),
);

/** @type {ReadonlySet<string>} */
const ALLOWED_LOCAL_DEVELOPMENT_HOSTNAMES_SET = new Set(['localhost', '127.0.0.1']);

/**
 * Parsea de forma segura una cadena de URL proveniente de entorno. Complejidad: 4.
 *
 * @param {string | undefined} rawUrlLiteral - Cadena cruda de URL configurada en entorno.
 * @returns {URL | null} Instancia URL válida o null si está vacía o malformada.
 */
const parseSafeRemoteUrl = (rawUrlLiteral) => {
  const trimmedUrlLiteral = typeof rawUrlLiteral === 'string' ? rawUrlLiteral.trim() : '';
  if (trimmedUrlLiteral === '') {
    return null;
  }

  try {
    return new URL(trimmedUrlLiteral);
  } catch {
    return null;
  }
};

/**
 * Determina si el protocolo de la URL está autorizado según el entorno activo. Complejidad: 5.
 *
 * @param {URL} parsedUrl - Instancia URL previamente validada.
 * @param {boolean} isNonProductionEnvironmentBoolean - Permite localhost HTTP solo fuera de producción.
 * @returns {'http' | 'https' | null} Protocolo permitido o null si viola la política TLS.
 */
const resolveAllowedImageProtocolLiteral = (parsedUrl, isNonProductionEnvironmentBoolean) => {
  if (parsedUrl.protocol === 'https:') {
    return 'https';
  }

  const isDevelopmentHttpHostBoolean =
    isNonProductionEnvironmentBoolean &&
    parsedUrl.protocol === 'http:' &&
    ALLOWED_LOCAL_DEVELOPMENT_HOSTNAMES_SET.has(parsedUrl.hostname);

  return isDevelopmentHttpHostBoolean ? 'http' : null;
};

/**
 * Convierte una URL de entorno en un patrón de imagen remoto seguro. Complejidad: 4.
 *
 * @param {string | undefined} rawUrlLiteral - URL base configurada en variables de entorno.
 * @param {string} allowedPathnamePatternLiteral - Prefijo glob de rutas permitidas en el host.
 * @param {boolean} isNonProductionEnvironmentBoolean - Habilita localhost HTTP solo fuera de producción.
 * @returns {IRemoteImagePattern | null} Patrón normalizado o null si la URL no es elegible.
 */
const createRemoteImagePatternFromUrlLiteral = (
  rawUrlLiteral,
  allowedPathnamePatternLiteral,
  isNonProductionEnvironmentBoolean,
) => {
  const parsedUrl = parseSafeRemoteUrl(rawUrlLiteral);
  if (parsedUrl === null) {
    return null;
  }

  const protocolLiteral = resolveAllowedImageProtocolLiteral(
    parsedUrl,
    isNonProductionEnvironmentBoolean,
  );
  if (protocolLiteral === null) {
    return null;
  }

  return Object.freeze({
    protocol: protocolLiteral,
    hostname: parsedUrl.hostname,
    ...(parsedUrl.port !== '' ? { port: parsedUrl.port } : {}),
    pathname: allowedPathnamePatternLiteral,
  });
};

/**
 * Construye y deduplica la lista blanca inmutable de patrones remotos para `next/image`. Complejidad: 4.
 *
 * @returns {IRemoteImagePattern[]} Colección de patrones HTTPS permitidos para Supabase y CMS.
 */
const buildAuthorizedRemoteImagePatternsCollection = () => {
  const isNonProductionEnvironmentBoolean = process.env['NODE_ENV'] !== 'production';

  /** @type {(IRemoteImagePattern | null)[]} */
  const candidatePatternsCollection = [
    {
      protocol: 'https',
      hostname: '*.supabase.co',
      pathname: '/storage/v1/**',
    },
    {
      protocol: 'https',
      hostname: '*.storage.supabase.co',
      pathname: '/**',
    },
    {
      protocol: 'https',
      hostname: '*.vercel.app',
      pathname: '/api/media-vault/**',
    },
    createRemoteImagePatternFromUrlLiteral(
      process.env['SUPABASE_URL'],
      '/storage/v1/**',
      isNonProductionEnvironmentBoolean,
    ),
    createRemoteImagePatternFromUrlLiteral(
      process.env['S3_ENDPOINT'],
      '/**',
      isNonProductionEnvironmentBoolean,
    ),
    createRemoteImagePatternFromUrlLiteral(
      process.env['CMS_PUBLIC_BASE_URL'],
      '/api/media-vault/**',
      isNonProductionEnvironmentBoolean,
    ),
    createRemoteImagePatternFromUrlLiteral(
      process.env['NEXT_PUBLIC_CMS_URL'],
      '/api/media-vault/**',
      isNonProductionEnvironmentBoolean,
    ),
    createRemoteImagePatternFromUrlLiteral(
      process.env['PAYLOAD_PUBLIC_SERVER_URL'],
      '/api/media-vault/**',
      isNonProductionEnvironmentBoolean,
    ),
  ];

  /** @type {Map<string, IRemoteImagePattern>} */
  const deduplicatedPatternsMap = new Map();

  for (const candidatePattern of candidatePatternsCollection) {
    if (candidatePattern === null) {
      continue;
    }

    const patternKeyLiteral = `${candidatePattern.protocol}://${candidatePattern.hostname}:${candidatePattern.port ?? ''}${candidatePattern.pathname}`;
    deduplicatedPatternsMap.set(patternKeyLiteral, candidatePattern);
  }

  return Array.from(deduplicatedPatternsMap.values());
};

/**
 * @name portalNextConfigurationFoundation
 * @description Configuración base del portal con ruteo tipado, imágenes remotas seguras y cabeceras ISO.
 * @type {PortalNextConfig}
 */
const portalNextConfigurationFoundation = {
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
  typedRoutes: true,

  images: {
    formats: /** @type {const} */ (['image/avif', 'image/webp']),
    qualities: [75, 85],
    deviceSizes: [640, 768, 1024, 1280, 1536, 1920],
    minimumCacheTTL: 3600,
    remotePatterns: buildAuthorizedRemoteImagePatternsCollection(),
  },

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: globalSecurityHeadersCollection,
      },
    ];
  },

  nx: {
    svgr: false,
  },
};

const applicationPluginsCollection = [withNx];

const exportedConfigurationSnapshot = composePlugins(...applicationPluginsCollection)(
  portalNextConfigurationFoundation,
);

export default exportedConfigurationSnapshot;
