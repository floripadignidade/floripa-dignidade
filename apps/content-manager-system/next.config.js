// @ts-check

/**
 * @section Next.js Configuration - CMS Enterprise Administration Foundation (Payload 3.84)
 * @description Manifiesto de configuración institucional para el sistema de gestión
 * de contenidos (CMS). Orquesta la integración con Payload CMS 3.84, la transpilación
 * Source-First de los paquetes del monorepo y el grafo de Nx, garantizando optimización
 * de activos multimedia, endurecimiento básico y estabilidad en Vercel Serverless.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { composePlugins, withNx } from '@nx/next';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * @typedef {import('next').NextConfig & { nx?: { svgr?: boolean } }} CmsNextConfig
 */

/**
 * @name cmsNextConfigurationFoundation
 * @description Configuración base de Next.js con transpilación de librerías internas,
 * optimización AVIF/WebP y mitigación de fingerprinting para el panel administrativo.
 * @type {CmsNextConfig}
 */
const cmsNextConfigurationFoundation = {
  /**
   * @section Librerías del Monorepo Autorizadas para Transpilación Source-First
   * Garantiza que Next.js compile el código fuente TypeScript directo de los paquetes
   * consumidos directa o transitivamente por el CMS y sus colecciones.
   */
  transpilePackages: [
    '@floripa-dignidade/contracts',
    '@floripa-dignidade/environment-validator',
    '@floripa-dignidade/exceptions',
    '@floripa-dignidade/identity',
    '@floripa-dignidade/shared-utility',
    '@floripa-dignidade/telemetry',
  ],

  reactStrictMode: true,

  /**
   * Desactivación de la cabecera X-Powered-By para mitigar la identificación
   * de tecnologías de servidor (fingerprinting).
   */
  poweredByHeader: false,

  /**
   * @section Integración de Infraestructura Nx
   */
  nx: {
    svgr: false,
  },

  /**
   * @section Gobernanza de Optimización de Imágenes
   * Formatos de compresión de alta fidelidad autorizados para la interfaz administrativa.
   * La aserción const garantiza conformidad estricta con la unión ImageFormat de Next.js.
   */
  images: {
    formats: /** @type {const} */ (['image/avif', 'image/webp']),
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**', // Autorización delegada al Gateway S3 de Supabase Storage
      },
    ],
  },

  /**
   * @section Resiliencia del Servidor de Compilación
   */
  experimental: {
    /** Optimización de mapas de fuente para Payload 3.84 en compilaciones de producción */
    serverSourceMaps: false,
  },
};

/**
 * @name applicationPluginsCollection
 * @description Colección ordenada de orquestadores de compilación.
 * withNx precede a withPayload para asegurar la disponibilidad del sistema virtual de rutas.
 */
const applicationPluginsCollection = [withNx, withPayload];

/**
 * Exportación del ensamble procesado (`NextConfigFn` asíncrono generado por `composePlugins`)
 * para el despliegue a producción en Vercel y ejecución en Nx.
 */
const exportedConfigurationSnapshot = composePlugins(...applicationPluginsCollection)(
  cmsNextConfigurationFoundation,
);

export default exportedConfigurationSnapshot;
