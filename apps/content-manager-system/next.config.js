// @ts-check

/**
 * @section Next.js Configuration - CMS Governance Matrix (Payload 3.0)
 * @description Manifiesto de configuración soberano para el sistema de gestión
 * de contenidos. Orquesta la integración con el motor Payload y el grafo de Nx,
 * garantizando la optimización de activos y seguridad de cabeceras.
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Technical Naming.
 * SANEADO Zenith: Erradicación de TS8021 (JSDoc Ghost Tag) y consolidación de
 * inferencia estructural nativa.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { composePlugins, withNx } from '@nx/next';
import { withPayload } from '@payloadcms/next/withPayload';

/**
 * @name cmsNextConfigurationFoundation
 * @description ADN base de la aplicación con endurecimiento de seguridad y
 * optimización de Core Web Vitals (LCP/CLS).
 *
 * 🛡️ LEY ZENITH: Se omite la declaración explicita de tipos JSDoc. El objeto es
 * inferido estructuralmente por el motor 'composePlugins', evitando colapsos de resolución.
 */
const cmsNextConfigurationFoundation = {
  reactStrictMode: true,

  /**
   * Desactivamos la cabecera de tecnología por seguridad forense
   * (Previene fingerprinting de infraestructura).
   */
  poweredByHeader: false,

  /**
   * @section Integración de Infraestructura Nx
   * 🛡️ SANEADO: La propiedad 'nx' es reconocida nativamente por el plugin 'withNx'.
   * Se erradican las directivas de supresión de errores.
   */
  nx: {
    svgr: false,
  },

  /**
   * @section Gobernanza de Imágenes (Cloud Sovereign)
   * Configuración de optimización para activos de marca y evidencias ciudadanas.
   * Soporta AVIF para máxima compresión con fidelidad forense.
   */
  images: {
    formats:['image/avif', 'image/webp'],
    remotePatterns:[
      {
        protocol: 'https',
        hostname: '**', // Autorización delegada al S3 Gateway de Supabase
      },
    ],
  },

  /**
   * @section Resiliencia de Servidor
   * Configuración para prevenir el agotamiento de memoria durante
   * compilaciones masivas en el Edge Runtime.
   */
  experimental: {
    /** Optimización de caché de compilación para Payload 3.0 */
    serverSourceMaps: false,
  }
};

/**
 * @name applicationPluginsSwarm
 * @description Colección ordenada de orquestadores de compilación.
 * El orden es crítico: withNx debe preceder a withPayload para asegurar
 * que el sistema de archivos virtual y los alias estén listos.
 */
const applicationPluginsSwarm =[
  withNx,
  withPayload
];

/**
 * Exportación del ensamble final procesado para el despliegue perfecto.
 */
export default composePlugins(...applicationPluginsSwarm)(cmsNextConfigurationFoundation);
