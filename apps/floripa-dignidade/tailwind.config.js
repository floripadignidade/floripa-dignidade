// @ts-check
/**
 * @section Style Architecture - Tailwind CSS Configuration
 * @description Manifiesto soberano de diseño para el portal ciudadano.
 * Define los límites de la identidad visual, el sistema de espaciado y la
 * purga de rastro muerto (Tree-shaking) para optimización de Core Web Vitals.
 *
 * Protocolo OEDP-V17.0 - ESM-First Architecture & ISO Standard Naming.
 * SANEADO Zenith: Sincronización con Design System y normalización de rutas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindTypographyPlugin from '@tailwindcss/typography';
import tailwindAnimatePlugin from 'tailwindcss-animate';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 * Calculamos las rutas físicas para el escaneo de contenido evitando rastro relativo.
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * @name tailwindConfigurationMaster
 * @description ADN de configuración del motor de utilidades CSS.
 * @type {import('tailwindcss').Config}
 */
const tailwindConfigurationMaster = {
  /**
   * @section Fronteras de Escaneo (Swarm Content)
   * Define dónde el motor busca clases para el empaquetado final.
   * Se incluyen todos los búnkeres de lógica que poseen representaciones visuales.
   */
  content: [
    // 1. Aplicación Principal
    join(currentConfigurationDirectoryLiteral, 'src/**/!(*.spec|*.test).{ts,tsx,html}'),

    // 2. Búnker de Fundición Visual (Shared)
    join(
      currentConfigurationDirectoryLiteral,
      '../../libs/shared/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),

    // 3. Dominios de Negocio (Modules)
    join(
      currentConfigurationDirectoryLiteral,
      '../../libs/modules/**/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),

    // 4. Motores Cognitivos (Engines - Visual Atoms)
    join(
      currentConfigurationDirectoryLiteral,
      '../../libs/engines/**/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),
  ],

  theme: {
    extend: {
      /**
       * @section Sincronización Cromática (ISO Design Tokens)
       * Refleja fielmente el catálogo de colores del GlobalDesignSystem.
       */
      colors: {
        // Color Hércules de Autoridad
        navy: {
          900: '#003366',
          800: '#002852',
          700: '#001E3D',
        },
        // Color de Conversión Social e Impacto
        amber: {
          500: '#F5A623',
          600: '#D48806',
          400: '#F7B84B',
        },
        // Color de Soporte Institucional
        bridge: {
          blue: '#4A90E2',
        },
        // Escala de Neutros y Superficies
        slate: {
          950: '#0F172A',
          900: '#1E293B',
          600: '#64748B',
          50: '#F8FAFC',
        },
      },

      /**
       * @section Tipografía Soberana
       * Inyección de variables CSS gestionadas por Next.js Fonts.
       */
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'ui-sans-serif', 'system-ui'],
        display: ['var(--font-lexend)', 'Lexend', 'sans-serif'],
      },

      /**
       * @section Sistema de Espaciado y Micro-Interacciones
       */
      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      animation: {
        'fade-in': 'fade-in 0.5s ease-out forwards',
        'slide-up': 'slide-up 0.4s ease-out forwards',
        'pulse-subtle': 'pulse-subtle 3s infinite ease-in-out',
      },

      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-subtle': {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.85' },
        },
      },
    },
  },

  plugins: [tailwindTypographyPlugin, tailwindAnimatePlugin],
};

export default tailwindConfigurationMaster;
