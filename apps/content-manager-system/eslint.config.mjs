/**
 * @section Application Governance - CMS ESLint Configuration (Flat Config)
 * @description Configuración de gobernanza perimetral para el sistema de gestión de contenidos
 * basado en Payload CMS 3.84 y Next.js 16. Hereda la constitución técnica raíz del monorepo
 * y garantiza paridad operativa con el portal ciudadano bajo la doctrina Source-First (OEDP-V18.1).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Calidad).
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
    ignores: ['.next/**/*', '**/out-tsc', '**/dist/**', '**/payload-types.ts', '**/next-env.d.ts'],
  },
  {
    plugins: {
      '@next/next': nextEslintPluginNext,
    },
  },
  ...nx.configs['flat/react-typescript'],
  ...baseConfig,
  {
    name: 'floripa-dignidade/cms-environment-exceptions',
    files: [
      'src/**/*',
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
      'next.config.js',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
  {
    name: 'floripa-dignidade/cms-config-files-override',
    files: [
      '*.config.js',
      '*.config.mjs',
      '*.config.ts',
      '**/*.config.js',
      '**/*.config.mjs',
      '**/*.config.ts',
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
