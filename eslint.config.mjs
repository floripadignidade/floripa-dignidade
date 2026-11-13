/**
 * @section Technical Constitution - Global Infrastructure Governance (Flat Config)
 * @description Orquestador central de integridad de código y límites modulares.
 * Implementa la Estrategia de Servicio Dinámico (typescript-eslint Project Service)
 * y la Matriz de Fronteras (ADR 0003) para garantizar la estabilidad del ecosistema.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Calidad) y ADR 0002.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import nx from '@nx/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    /**
     * @section Exclusión de Artefactos Generados y Cachés de Compilación
     */
    ignores: [
      '**/dist/**',
      '**/out-tsc/**',
      '**/test-output/**',
      '**/playwright-report/**',
      '**/tmp/**',
      '**/coverage/**',
      '**/.nx/**',
      '**/.swc/**',
      '**/.cache/**',
      '**/.next/**',
      '**/.vercel/**',
      'pnpm-lock.yaml',
      'node_modules/**',
      '**/payload-types.ts',
      '**/next-env.d.ts',
      '**/*.d.ts',
    ],
  },

  // 1. INTEGRACIÓN DE CONFIGURACIONES BASE DE NX
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  {
    name: 'floripa-dignidade/governance-logic',
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: {
          /**
           * Solo se admiten globs superficiales de un solo nivel (sin '**').
           * Los archivos de configuración en subdirectorios se delegan a 'config-files-override'.
           */
          allowDefaultProject: ['*.config.mjs', '*.config.js', '*.config.ts', 'jest.preset.js'],
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /**
       * @section Matriz de Fronteras (Module Boundaries - ADR 0003)
       */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: false,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/next.config\\.[cm]?js$',
            '^.*/postcss.config\\.[cm]?js$',
            '^.*/tailwind.config\\.[cm]?js$',
          ],
          depConstraints: [
            { sourceTag: 'scope:contracts', onlyDependOnLibsWithTags: [] },
            {
              sourceTag: 'scope:core',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:contracts'],
            },
            {
              sourceTag: 'scope:shared',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:contracts'],
            },
            {
              sourceTag: 'scope:engines',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:engines',
                'scope:contracts',
              ],
            },
            {
              sourceTag: 'scope:modules',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:engines',
                'scope:modules',
                'scope:contracts',
              ],
            },
            { sourceTag: 'scope:qa', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'scope:tools', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'type:data', notDependOnLibsWithTags: ['type:ui'] },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:schema',
                'type:core',
                'type:shared',
                'type:logic',
              ],
            },
            { sourceTag: 'type:schema', onlyDependOnLibsWithTags: [] },
          ],
        },
      ],

      /**
       * @section Rigor SRE y Performance
       */
      'no-console': ['error', { allow: ['warn', 'error'] }],
      eqeqeq: ['error', 'always'],
      complexity: ['error', 10],
      'max-lines': ['error', { max: 200, skipBlankLines: true, skipComments: true }],

      /** Prevención de fallos asíncronos y tipado 'any' */
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      /** Bloqueo de Hardware Cloud-Primary (ADR 0015) */
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "⚠️ Acceso prohibido a 'process.env'. Use '@floripa-dignidade/environment-validator'.",
        },
      ],

      /** Nomenclatura ISO/IEC 11179 */
      '@typescript-eslint/naming-convention': [
        'error',
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeLike', format: ['PascalCase'] },
        {
          selector: 'variable',
          types: ['boolean'],
          format: ['PascalCase'],
          prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          suffix: ['Boolean'],
        },
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      'sort-imports': [
        'error',
        { ignoreCase: true, ignoreDeclarationSort: true, allowSeparatedGroups: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        {
          argsIgnorePattern: '^_',
          varsIgnorePattern: '^_',
          caughtErrorsIgnorePattern: '^_',
        },
      ],
    },
  },

  {
    name: 'floripa-dignidade/config-files-override',
    files: [
      '*.config.js',
      '*.config.cjs',
      '*.config.mjs',
      '*.config.ts',
      '**/*.config.js',
      '**/*.config.cjs',
      '**/*.config.mjs',
      '**/*.config.ts',
      'jest.config.ts',
      '**/jest.config.ts',
      'jest.preset.js',
      '**/jest.preset.js',
      'postcss.config.js',
      '**/postcss.config.js',
      'tailwind.config.js',
      '**/tailwind.config.js',
      'next.config.js',
      '**/next.config.js',
    ],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        projectService: false,
        program: null,
      },
    },
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/await-thenable': 'off',
      '@typescript-eslint/naming-convention': 'off',
      'max-lines': 'off',
    },
  },

  {
    name: 'floripa-dignidade/hardware-environment-exceptions',
    files: [
      'apps/**/*',
      'libs/core/environment-validator/**/*',
      'scripts/**/*',
      'libs/tools/**/*',
      'libs/engines/adversarial-simulation-engine/**/*',
      'libs/engines/financial-ingestion-engine/**/*',
    ],
    rules: {
      'no-restricted-syntax': 'off',
    },
  },
];
