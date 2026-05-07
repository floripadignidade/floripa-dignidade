// @ts-check
/**
 * @section Next.js Configuration - CMS Shell (Payload 3.0)
 * @description Manifiesto de configuración soberano para el sistema de gestión
 * de contenidos. Orquesta la integración con Nx y la inyección del motor Payload.
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Standard Naming.
 * SANEADO Zenith: Resolución de visibilidad de Project Service y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { composePlugins, withNx } from '@nx/next';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * @name cmsNextConfigurationFoundation
 * @description ADN base de la aplicación con optimización de medios y seguridad.
 * @type {import('next').NextConfig}
 */
const cmsNextConfigurationFoundation = {
  reactStrictMode: true,
  poweredByHeader: false,

  /**
   * 🛡️ SANEADO Zenith: TS2353
   * Utilizamos supresión de error controlada ya que esta propiedad es un
   * requerimiento físico del motor de Nx que no existe en el tipo estándar de Next.
   */
  // @ts-expect-error - Propiedad inyectada para el orquestador '@nx/next'
  nx: {
    svgr: false,
  },

  /**
   * @section Gobernanza de Imágenes
   * Optimización de Core Web Vitals mediante soporte nativo de AVIF y WebP.
   */
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**'
      },
    ],
  },
};

/**
 * @name applicationPluginsCollection
 * @description Colección ordenada de orquestadores de compilación (Swarm Plugins).
 * Garantiza que el búnker de Nx y el motor de Payload se fusionen sin colisiones.
 */
const applicationPluginsCollection = [
  withNx,
  /**
   * 🛡️ SANEADO Zenith: TS7006 (Erradicación de 'any' implícito).
   * @param {import('next').NextConfig} nextConfigReference
   * @returns {import('next').NextConfig}
   */
  (nextConfigReference) => withPayload(nextConfigReference),
];

/**
 * Exportación del ensamble final procesado por el motor de composición de plugins.
 */
export default composePlugins(...applicationPluginsCollection)(cmsNextConfigurationFoundation);
