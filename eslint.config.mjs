/**
 * @section Technical Constitution - Global Infrastructure Governance
 * @description Orquestador soberano de integridad de código y límites modulares.
 * Implementa la Estrategia de Servicio Dinámico y la Matriz de Fronteras (ADR 0003)
 * para garantizar la estabilidad y soberanía del ecosistema.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Structural Integrity.
 * SANEADO Zenith: Optimización de Project Service, blindaje contra colisiones de
 * tipos implícitos y normalización de la jerarquía de inspección.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import nextEslintPluginNext from '@next/eslint-plugin-next';
import nx from '@nx/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default[
  {
    /**
     * @section Purgado de Entropía Visual
     * Bloqueamos directorios de salida y rastro de caché para optimizar el motor.
     */
    ignores:[
      '**/dist/**',
      '**/out-tsc/**',
      '**/test-output/**',
      '**/tmp/**',
      '**/coverage/**',
      '**/.nx/**',
      '**/.swc/**',
      '**/.cache/**',
      '.next/**/*',
      'pnpm-lock.yaml',
      'node_modules/**',
      '**/payload-types.ts',
      '**/next-env.d.ts',
      '**/*.d.ts'
    ],
  },

  // 1. INTEGRACIÓN DE CONFIGURACIONES BASE
  ...nx.configs['flat/base'],
  ...nx.configs['flat/typescript'],
  ...nx.configs['flat/javascript'],

  {
    plugins: {
      '@next/next': nextEslintPluginNext
    }
  },

  {
    name: 'floripa-dignidade/governance-logic',
    files:['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        projectService: {
          allowDefaultProject: ['*.config.mjs', '*.config.js']
        },
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /**
       * @section Matriz de Fronteras (Module Boundaries - ADR 0003)
       */
      '@nx/enforce-module-boundaries':[
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/next.config\\.[cm]?js$',
            '^.*/postcss.config\\.[cm]?js$',
            '^.*/tailwind.config\\.[cm]?js$',
          ],
          depConstraints:[
            { sourceTag: 'scope:core', onlyDependOnLibsWithTags: ['scope:core'] },
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:core', 'scope:shared'] },
            {
              sourceTag: 'scope:engines',
              onlyDependOnLibsWithTags:['scope:core', 'scope:shared', 'scope:engines']
            },
            {
              sourceTag: 'scope:modules',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:engines', 'scope:modules']
            },
            { sourceTag: 'scope:qa', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'scope:tools', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['scope:*'] },
            { sourceTag: 'type:data', notDependOnLibsWithTags: ['type:ui'] },
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags:['type:ui', 'type:schema', 'type:core', 'type:shared', 'type:logic', 'type:data']
            },
            { sourceTag: 'type:schema', onlyDependOnLibsWithTags:[] },
          ],
        },
      ],

      /**
       * @section Rigor SRE y Performance
       */
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'complexity': ['error', 10],
      'max-lines':['error', { max: 150, skipBlankLines: true, skipComments: true }],

      /** Prevención de fallos asíncronos y tipado 'any' */
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      /** Bloqueo de Hardware Cloud-Sovereign */
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message: "⚠️ Acceso prohibido a 'process.env'. Use '@floripa-dignidade/environment-validator'.",
        },
      ],

      /** Nomenclatura ISO */
      '@typescript-eslint/naming-convention':[
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
          format:['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      'sort-imports':['error', { ignoreCase: true, ignoreDeclarationSort: true, allowSeparatedGroups: true }],
      '@typescript-eslint/no-unused-vars':['error', { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' }],
    },
  },

  {
    files:[
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
