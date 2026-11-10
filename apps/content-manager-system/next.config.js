// apps/content-manager-system/next.config.js

// @ts-check

/**
 * @section Next.js Configuration - CMS Enterprise Administration Foundation (Payload 3.84)
 * @description Manifiesto de configuración institucional para el sistema de gestión
 * de contenidos (CMS). Orquesta la integración con el motor de Payload CMS y el grafo de Nx,
 * garantizando la optimización de activos multimedia, la seguridad de cabeceras y la
 * estabilidad en entornos Vercel Serverless.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 * SANEADO Zenith: Erradicación del error TS2353 tipando explícitamente la extensión
 * de opciones de Nx sobre NextConfig y preservando la aserción const en formatos de imagen.
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
 * @description Configuración base de Next.js con endurecimiento de seguridad y
 * optimización de Core Web Vitals (LCP/CLS) para el panel administrativo.
 * @type {CmsNextConfig}
 */
const cmsNextConfigurationFoundation = {
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
const applicationPluginsCollection = [
  withNx,
  withPayload,
];

/**
 * Exportación del ensamble procesado para el despliegue a producción.
 */
export default composePlugins(...applicationPluginsCollection)(cmsNextConfigurationFoundation);