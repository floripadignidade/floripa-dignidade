// @ts-check
/**
 * @section Style Infrastructure - PostCSS Orchestrator
 * @description Manifiesto de configuración para el motor de procesamiento de estilos.
 * Orquesta la inyección de Tailwind CSS y el prefijado automático para
 * compatibilidad cross-browser (ISO/IEC 40500).
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Standard Naming.
 * SANEADO Zenith: Resolución de visibilidad mediante registro en Gatekeeper y
 * simplificación de rastro de hardware para evitar colapsos de resolución.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 * Determinamos la ubicación física del búnker de estilos para la resolución
 * determinista de la configuración de Tailwind.
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @name postcssConfigurationMaster
 * @description ADN de configuración para el preprocesador de CSS.
 * SANEADO Zenith: Se utiliza el puente de ADN definido en 'index.d.ts'.
 *
 * @type {import('postcss-load-config').Config}
 */
const postcssConfigurationMaster = {
  plugins: {
    /**
     * @section Motor Tailwind CSS
     * Vinculamos físicamente el manifiesto de diseño para que el compilador
     * procese únicamente los tokens definidos en el Design System.
     */
    tailwindcss: {
      config: join(currentConfigurationDirectoryLiteral, 'tailwind.config.js'),
    },

    /**
     * @section Autoprefixer (A11y & Compatibility)
     * Garantiza que el CSS generado sea navegable en versiones antiguas de
     * navegadores móviles, alineado con el Manifiesto Mobile-First.
     */
    autoprefixer: {
      flexbox: 'no-2009',
    },
  },
};

export default postcssConfigurationMaster;
