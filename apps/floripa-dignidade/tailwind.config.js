// @ts-check
/**
 * @section Style Architecture - Tailwind CSS Configuration
 * @description Manifiesto institucional de diseño para el portal ciudadano Floripa Dignidade.
 * Define las rutas de escaneo para tree-shaking, preserva íntegramente las escalas cromáticas
 * base de Tailwind CSS e inyecta los tokens oficiales del Design System (ADR 0029) y tipografías
 * administradas por Next.js Fonts.
 *
 * Protocolo OEDP-V18.1 - ESM-First Architecture & ISO/IEC 11179 Technical Naming.
 * Normas: ISO/IEC 25010 (Mantenibilidad y Eficiencia), W3C WCAG 2.2 AAA y ADR 0029.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import tailwindTypographyPlugin from '@tailwindcss/typography';
import tailwindAnimatePlugin from 'tailwindcss-animate';
import tailwindcssColors from 'tailwindcss/colors';

/**
 * @section Resolución de Contexto Isomórfico (ESM)
 * Calculamos la ruta física del directorio de la aplicación para construir globs deterministas.
 */
const currentFileConfigurationPathLiteral = fileURLToPath(import.meta.url);
const currentConfigurationDirectoryLiteral = dirname(currentFileConfigurationPathLiteral);

/**
 * Construye una ruta glob normalizada con separadores POSIX ('/') para garantizar
 * compatibilidad determinista de fast-glob entre Windows (local) y Linux (Vercel CI).
 *
 * @param {string} baseDirectoryLiteral - Ruta absoluta de partida.
 * @param {string} relativeGlobPatternLiteral - Patrón glob relativo al directorio de la app.
 * @returns {string} Patrón glob normalizado.
 */
const buildNormalizedScanPatternLiteral = (baseDirectoryLiteral, relativeGlobPatternLiteral) =>
  join(baseDirectoryLiteral, relativeGlobPatternLiteral).replace(/\\/g, '/');

/**
 * @name tailwindConfigurationMaster
 * @description Configuración maestra del motor de utilidades CSS del portal ciudadano.
 * @type {import('tailwindcss').Config}
 */
const tailwindConfigurationMaster = {
  /**
   * @section Fronteras de Escaneo de Contenido
   * Incluye explícitamente todos los paquetes visuales compartidos, módulos de negocio y motores
   * evitando escanear especificaciones de prueba o directorios de dependencias.
   */
  content: [
    // 1. Aplicación Principal (Portal Ciudadano)
    buildNormalizedScanPatternLiteral(
      currentConfigurationDirectoryLiteral,
      'src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),

    // 2. Capa Compartida (UI Foundry, State Store, Utility, Design System)
    buildNormalizedScanPatternLiteral(
      currentConfigurationDirectoryLiteral,
      '../../libs/shared/*/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),

    // 3. Módulos de Dominio (Incluye sub-módulos anidados como whatsapp/communication-service)
    buildNormalizedScanPatternLiteral(
      currentConfigurationDirectoryLiteral,
      '../../libs/modules/**/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),

    // 4. Motores Analíticos y Cognitivos (Componentes visuales auxiliares)
    buildNormalizedScanPatternLiteral(
      currentConfigurationDirectoryLiteral,
      '../../libs/engines/**/src/**/!(*.spec|*.test).{ts,tsx,html}',
    ),
  ],

  theme: {
    extend: {
      /**
       * @section Sincronización Cromática (ADR 0029 & Design System Tokens)
       * Se preservan las escalas completas de Tailwind CSS para 'amber' y 'slate'
       * sobreescribiendo únicamente los pasos institucionales calibrados.
       */
      colors: {
        // Primario de Autoridad (Azul Hércules Institucional)
        navy: {
          50: '#EFF4FA',
          100: '#DCE6F2',
          700: '#001E3D',
          800: '#002852',
          900: '#003366',
          950: '#002244',
        },
        // Secundario de Vitalidad Marítima (Azul Bahía)
        ocean: {
          600: '#005C99',
        },
        // Conectividad y Datos Abiertos (Azul Cielo Hercílio)
        bridge: {
          500: '#4A90E2',
          blue: '#4A90E2',
        },
        // Acento de Conversión Cívica (Ámbar Impacto Social + escala completa Tailwind)
        amber: {
          ...tailwindcssColors.amber,
          400: '#F7B84B',
          500: '#F5A623',
          600: '#D48806',
        },
        // Escala de Neutros y Superficies de Lectura (Pizarra + escala completa Tailwind)
        slate: {
          ...tailwindcssColors.slate,
          50: '#F8FAFC',
          600: '#64748B',
          900: '#1E293B',
          950: '#0F172A',
        },
        // Señales de Estado SRE y Alerta Ciudadana (ADR 0029)
        status: {
          error: '#E11D48',
          success: '#10B981',
          warning: '#FBBF24',
        },
      },

      /**
       * @section Tipografía Institucional
       * Variables CSS inyectadas en el DOM por 'apps/floripa-dignidade/src/app/fonts.ts'.
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
