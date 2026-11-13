/**
 * @section Application Governance - Portal ESLint Configuration (Flat Config)
 * @description Carcasa de gobernanza perimetral para el portal ciudadano Floripa Dignidade.
 * Hereda canónicamente la constitución técnica del monorepo (baseConfig), integrando
 * las reglas oficiales de Next.js y React 19 bajo la doctrina Source-First (OEDP-V18.1).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Calidad) y ADR 0002.
 *
 * SANEADO Zenith:
 * 1. Herencia limpia de '../../eslint.config.mjs' sin duplicación de constitución raíz.
 * 2. Orden determinista: React/Next.js -> baseConfig -> overrides locales del portal.
 * 3. Cobertura dual ('*.config.*' y '**\/*.config.*') en 'portal-config-files-override'
 *    con 'projectService: false' para evitar errores de Project Service en archivos de build.
 * 4. Exención explícita de 'no-restricted-syntax' en 'src/**\/*' y configuradores locales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';
import baseConfig from '../../eslint.config.mjs';

export default [
  {
    ignores: ['.next/**/*', '**/out-tsc'],
  },
  {
    plugins: {
      '@next/next': nextEslintPluginNext,
    },
  },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  {
    name: 'floripa-dignidade/portal-environment-exceptions',
    files: [
      'src/**/*',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      'next.config.js',
      'postcss.config.js',
      'tailwind.config.js',
      'jest.config.ts',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    name: 'floripa-dignidade/portal-config-files-override',
    files: [
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      'jest.config.ts',
      'postcss.config.js',
      'tailwind.config.js',
      'next.config.js',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: false,
        program: null,
      },
    },
    rules: {
      '@typescript-eslint/naming-convention': 'off',
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      'max-lines': 'off',
    },
  },
];
