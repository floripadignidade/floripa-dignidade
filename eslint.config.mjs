/**
 * @section Technical Constitution - Global Infrastructure Governance
 * @description Orquestador soberano de integridad de código y límites modulares.
 * Implementa la Estrategia de Servicio Dinámico y la Matriz de Fronteras (ADR 0003)
 * para garantizar la estabilidad y soberanía del ecosistema.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Structural Integrity.
 * SANEADO Zenith: Resolución de paradoja de nomenclatura booleana (Fix PascalCase residue)
 * e inyección de soporte para estados pasados (was).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import nxEslintPlugin from '@nx/eslint-plugin';
import typescriptParser from '@typescript-eslint/parser';

export default [
  {
    /**
     * @section Purgado de Entropía Visual
     * Bloqueamos directorios de salida y rastro de caché para optimizar el motor.
     */
    ignores: [
      '**/dist/**',
      '**/out-tsc/**',
      '**/test-output/**',
      '**/tmp/**',
      '**/coverage/**',
      '**/.nx/**',
      '**/.swc/**', // 🛡️ SANEADO: Ignoramos caché binaria de SWC para evitar bloqueos
      '**/.cache/**',
      '.next/**/*',
      'pnpm-lock.yaml',
      'node_modules/**',
      '**/payload-types.ts',
      '**/next-env.d.ts',
    ],
  },

  // 1. INTEGRACIÓN DE CONFIGURACIONES BASE (Swarm Architecture)
  ...nxEslintPlugin.configs['flat/base'],
  ...nxEslintPlugin.configs['flat/typescript'],
  ...nxEslintPlugin.configs['flat/javascript'],

  {
    name: 'floripa-dignidade/governance-logic',
    // 🛡️ SANEADO Zenith: Escaneo exclusivo de código fuente real.
    files: ['**/*.ts', '**/*.tsx', '**/*.js', '**/*.jsx'],
    // 🛡️ SANEADO Zenith: Ignoramos firmas para evitar colisiones de servicio.
    ignores: ['**/*.d.ts'],
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        /**
         * 🛡️ CIRUGÍA ZENITH: Resolución de Latencia de Análisis.
         * Carga bajo demanda de tsconfigs vía Project Service para evitar colapso de RAM.
         */
        projectService: true,
        tsconfigRootDir: import.meta.dirname,
      },
    },
    rules: {
      /**
       * @section Matriz de Fronteras (Module Boundaries - ADR 0003)
       * Ley de Hierro: Jerarquía inalterable del ecosistema Floripa.
       */
      '@nx/enforce-module-boundaries': [
        'error',
        {
          enforceBuildableLibDependency: true,
          allow: [
            '^.*/eslint(\\.base)?\\.config\\.[cm]?[jt]s$',
            '^.*/next.config\\.[cm]?js$',
            '^.*/postcss.config\\.[cm]?js$',
            '^.*/tailwind.config\\.[cm]?js$',
          ],
          depConstraints: [
            /** Cimientos: No conocen capas superiores. */
            { sourceTag: 'scope:core', onlyDependOnLibsWithTags: ['scope:core'] },

            /** Shared: Solo consume infraestructura base. */
            { sourceTag: 'scope:shared', onlyDependOnLibsWithTags: ['scope:core', 'scope:shared'] },

            /** Motores: Pueden usar utilidades compartidas. */
            {
              sourceTag: 'scope:engines',
              onlyDependOnLibsWithTags: ['scope:core', 'scope:shared', 'scope:engines'],
            },

            /** Módulos: Ensamblan lógica de motores. */
            {
              sourceTag: 'scope:modules',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:engines',
                'scope:modules',
              ],
            },

            /** QA: Mirror testing total. */
            {
              sourceTag: 'scope:qa',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:engines',
                'scope:modules',
              ],
            },

            /** Herramientas: Las herramientas CLI invocan lógica para ingesta o auditoría. */
            {
              sourceTag: 'scope:tools',
              onlyDependOnLibsWithTags: [
                'scope:core',
                'scope:shared',
                'scope:engines',
                'scope:modules',
                'scope:tools',
              ],
            },

            /** Aplicaciones: Orquestadores finales. */
            { sourceTag: 'scope:app', onlyDependOnLibsWithTags: ['scope:*'] },

            /* --- Restricciones de Tipo (Fronteras Funcionales) --- */

            /** Data: Nunca importa UI para evitar fugas de renderizado en el servidor. */
            { sourceTag: 'type:data', notDependOnLibsWithTags: ['type:ui'] },

            /**
             * UI: Flexibilizado para soporte de componentes complejos (Composite UI)
             * y átomos de persistencia reactiva.
             */
            {
              sourceTag: 'type:ui',
              onlyDependOnLibsWithTags: [
                'type:ui',
                'type:schema',
                'type:core',
                'type:shared',
                'type:logic',
                'type:data',
              ],
            },

            /** Esquemas: Hojas del grafo. No dependen de nada. */
            { sourceTag: 'type:schema', onlyDependOnLibsWithTags: [] },
          ],
        },
      ],

      /**
       * @section Rigor SRE y Performance (ADR 0007)
       */
      'no-console': ['error', { allow: ['warn', 'error'] }],
      'eqeqeq': ['error', 'always'],
      'complexity': ['error', 10],
      'max-lines': ['error', { max: 150, skipBlankLines: true, skipComments: true }],

      /** Prevención de fallos asíncronos y tipado 'any' */
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/await-thenable': 'error',
      '@typescript-eslint/no-explicit-any': 'error',

      /**
       * @section Bloqueo de Hardware (Cloud-Sovereign - ADR 0015)
       */
      'no-restricted-syntax': [
        'error',
        {
          selector: "MemberExpression[object.name='process'][property.name='env']",
          message:
            "⚠️ Acceso prohibido a 'process.env'. Use '@floripa-dignidade/environment-validator'.",
        },
      ],

      /**
       * @section Convención de Nomenclatura ISO (ISO 11179 / ADR 0002)
       */
      '@typescript-eslint/naming-convention': [
        'error',
        // 1. Interfaces y Tipos
        { selector: 'interface', format: ['PascalCase'], prefix: ['I'] },
        { selector: 'typeLike', format: ['PascalCase'] },

        // 2. 🛡️ INYECCIÓN ZENITH: Prosa Booleana Obligatoria
        {
          selector: 'variable',
          types: ['boolean'],
          /**
           * SANEADO: Usamos PascalCase porque al recortar el prefijo (ej: 'is'),
           * el residuo (ej: 'ClientEnvironmentBoolean') comienza con mayúscula.
           */
          format: ['PascalCase'],
          prefix: ['is', 'has', 'should', 'can', 'did', 'will', 'was'],
          suffix: ['Boolean'],
        },

        // 3. Variables y Parámetros Estándar
        {
          selector: 'variable',
          format: ['camelCase', 'UPPER_CASE', 'PascalCase'],
          leadingUnderscore: 'allow',
        },
        { selector: 'parameter', format: ['camelCase'], leadingUnderscore: 'allow' },
      ],

      /** Ordenamiento para mitigar Entropía Visual */
      'sort-imports': [
        'error',
        { ignoreCase: true, ignoreDeclarationSort: true, allowSeparatedGroups: true },
      ],
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrorsIgnorePattern: '^_' },
      ],
    },
  },

  /**
   * @section Jurisdicción de Excepción (Infrastructure Gates)
   * Áreas autorizadas para interactuar directamente con el hardware (process.env).
   */
  {
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
