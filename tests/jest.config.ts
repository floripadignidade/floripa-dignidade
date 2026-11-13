/**
 * @section Quality Assurance - Jest Configuration (QA Mirror)
 * @description Orquestador de ejecución de pruebas unitarias y de integración para
 * el módulo de validación espejo (`@floripa-dignidade/qa-mirror`). Aísla la
 * transpilación de `@swc/jest` respecto al `.swcrc` de producción, acota el
 * descubrimiento de suites a `tests/` y sincroniza el `moduleNameMapper` 1:1 con
 * los `paths` Source-First de `tsconfig.base.json`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Mirror Testing).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad y Eficiencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * Configuración inmutable de Jest ejecutada en contexto CommonJS para compatibilidad
 * estricta con `verbatimModuleSyntax: true` y el cargador nativo de Jest 30.
 *
 * @type {import('jest').Config}
 */
const jestConfigurationSnapshot = {
  displayName: 'qa-mirror',
  rootDir: '../',
  roots: ['<rootDir>/tests'],
  preset: './jest.preset.js',

  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
        swcrc: false,
        configFile: false,
        jsc: {
          parser: {
            syntax: 'typescript',
            tsx: true,
            decorators: true,
          },
          transform: {
            react: {
              runtime: 'automatic',
              refresh: false,
            },
          },
          externalHelpers: true,
          target: 'es2022',
        },
        module: {
          type: 'commonjs',
        },
      },
    ],
  },

  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  coverageDirectory: './coverage/tests',
  collectCoverageFrom: [
    'libs/**/*.ts',
    'libs/**/*.tsx',
    '!libs/**/index.ts',
    '!libs/**/*.spec.ts',
    '!libs/**/*.test.ts',
    '!libs/**/node_modules/**',
  ],

  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  testEnvironment: 'jsdom',

  moduleNameMapper: {
    '^@floripa-dignidade/adversarial-simulation-engine$':
      '<rootDir>/libs/engines/adversarial-simulation-engine/src/index.ts',
    '^@floripa-dignidade/analytics$': '<rootDir>/libs/core/analytics/src/index.ts',
    '^@floripa-dignidade/contracts$': '<rootDir>/libs/contracts/src/index.ts',
    '^@floripa-dignidade/data-ingestion-engine$':
      '<rootDir>/libs/engines/data-ingestion-engine/src/index.ts',
    '^@floripa-dignidade/environment-validator$':
      '<rootDir>/libs/core/environment-validator/src/index.ts',
    '^@floripa-dignidade/exceptions$': '<rootDir>/libs/core/exceptions/src/index.ts',
    '^@floripa-dignidade/financial-ingestion-engine$':
      '<rootDir>/libs/engines/financial-ingestion-engine/src/index.ts',
    '^@floripa-dignidade/health-analysis-engine$':
      '<rootDir>/libs/engines/health-analysis/src/index.ts',
    '^@floripa-dignidade/health-monitor$': '<rootDir>/libs/engines/health-monitor/src/index.ts',
    '^@floripa-dignidade/identity$': '<rootDir>/libs/modules/identity/src/index.ts',
    '^@floripa-dignidade/impact-analytics-engine$':
      '<rootDir>/libs/engines/impact-analytics-engine/src/index.ts',
    '^@floripa-dignidade/interaction-engine$':
      '<rootDir>/libs/modules/interaction-engine/src/index.ts',
    '^@floripa-dignidade/messaging-engine$': '<rootDir>/libs/modules/messaging-engine/src/index.ts',
    '^@floripa-dignidade/newsletter$': '<rootDir>/libs/modules/newsletter/src/index.ts',
    '^@floripa-dignidade/pmf-open-data-engine$':
      '<rootDir>/libs/engines/data-ingestion-engine/src/index.ts',
    '^@floripa-dignidade/reputation-engine$':
      '<rootDir>/libs/modules/reputation-engine/src/index.ts',
    '^@floripa-dignidade/resend-provider$':
      '<rootDir>/libs/core/communication-providers/resend/src/index.ts',
    '^@floripa-dignidade/routing$': '<rootDir>/libs/core/routing/src/index.ts',
    '^@floripa-dignidade/search-engine$': '<rootDir>/libs/engines/search-engine/src/index.ts',
    '^@floripa-dignidade/shared-design-system$': '<rootDir>/libs/shared/design-system/src/index.ts',
    '^@floripa-dignidade/shared-state-store$': '<rootDir>/libs/shared/state-store/src/index.ts',
    '^@floripa-dignidade/shared-ui-contracts$': '<rootDir>/libs/shared/ui-contracts/src/index.ts',
    '^@floripa-dignidade/shared-ui-foundry$': '<rootDir>/libs/shared/ui-foundry/src/index.ts',
    '^@floripa-dignidade/shared-utility$': '<rootDir>/libs/shared/utility/src/index.ts',
    '^@floripa-dignidade/social-media$': '<rootDir>/libs/modules/social-media/src/index.ts',
    '^@floripa-dignidade/telemetry$': '<rootDir>/libs/core/telemetry/src/index.ts',
    '^@floripa-dignidade/territorial-engine$':
      '<rootDir>/libs/modules/territorial-engine/src/index.ts',
    '^@floripa-dignidade/tools$': '<rootDir>/libs/tools/src/index.ts',
    '^@floripa-dignidade/whatsapp-communication-service$':
      '<rootDir>/libs/modules/whatsapp/communication-service/src/index.ts',
    '^(\\.{1,2}/.*)\\.js$': '$1',
    '\\.css$': 'identity-obj-proxy',
  },

  passWithNoTests: true,
  cacheDirectory: '<rootDir>/.cache/jest',
  setupFilesAfterEnv: ['@testing-library/jest-dom'],
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out-tsc/', '/.next/'],
};

module.exports = jestConfigurationSnapshot;
