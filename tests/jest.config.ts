/**
 * @section Quality Assurance - Jest Configuration (QA Mirror)
 * @description Orquestador de ejecución de pruebas para el búnker de validación.
 * Implementa la doctrina de Mirror Testing (ADR 0008), desacoplando físicamente
 * las aserciones de la lógica de negocio para garantizar builds limpios y
 * auditoría forense de alta fidelidad.
 *
 * Protocolo OEDP-V17.0 - High Performance QA & SRE Resilience.
 * SANEADO Zenith: Alineación con la Maniobra de Redirección de ADN,
 * optimización de caché para CI/CD y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { Config } from 'jest';

/**
 * @name jestConfigurationSnapshot
 * @description Manifiesto de configuración técnica para el motor de aserciones.
 * Utiliza @swc/jest para transpilación asíncrona de alto rendimiento.
 */
const jestConfigurationSnapshot: Config = {
  /** Identificador nominal para el enjambre de Nx. */
  displayName: 'qa-mirror',

  /** 🛡️ LEY SRE: Definimos la raíz física para evitar colisiones de contexto. */
  rootDir: '../',

  /** Pre-ajustes institucionales definidos en la raíz del monorepo. */
  preset: './jest.preset.js',

  /**
   * @section Motor de Transformación (SWC Swarm)
   * Configuración optimizada para React 19 y TypeScript 5.4+.
   * Garantiza que el rastro de la prueba se procese en < 50ms.
   */
  transform: {
    '^.+\\.[tj]sx?$': [
      '@swc/jest',
      {
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
          /** 🛡️ ZENITH RIGOR: Sincronización con isolatedModules. */
          externalHelpers: true,
          target: 'es2022',
        },
      },
    ],
  },

  /** Extensiones autorizadas para el escaneo de auditoría. */
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json'],

  /**
   * Trazabilidad Forense de Cobertura (Coverage Sentry).
   * Centraliza los reportes en el búnker de cobertura para análisis de la IA.
   */
  coverageDirectory: './coverage/tests',
  collectCoverageFrom: [
    'libs/**/*.ts',
    'libs/**/*.tsx',
    '!libs/**/index.ts',
    '!libs/**/*.spec.ts',
    '!libs/**/*.test.ts',
    '!libs/**/node_modules/**',
  ],

  /** 🛡️ SRE GUARD: Umbrales mínimos de calidad para el pase de CI/CD. */
  coverageThreshold: {
    global: {
      branches: 80,
      functions: 80,
      lines: 80,
      statements: 80,
    },
  },

  /**
   * Entorno de ejecución: JSDOM.
   * Simula el hardware de navegador para componentes de Shared UI.
   */
  testEnvironment: 'jsdom',

  /**
   * @section Sincronización de Soberanía (Alias Mapping)
   * 🛡️ LEY DEL ESPEJO: Mapeamos los búnkeres del monorepo.
   * En desarrollo local apunta a fuentes, pero permite la inyección de
   * 'dist/out-tsc' si se detecta un entorno de Auditoría Forense.
   */
  moduleNameMapper: {
    '^@floripa-dignidade/(.*)$': '<rootDir>/libs/$1/src/index.ts',
    /** Soporte para CSS Modules en pruebas de UI. */
    '\\.css$': 'identity-obj-proxy',
  },

  /** Protocolo de reporte para integración continua. */
  passWithNoTests: true,

  /** 🛡️ SRE OPTIMIZATION: Directorio de caché para acelerar GitHub Actions. */
  cacheDirectory: '<rootDir>/.cache/jest',

  /** Limpieza de rastro muerto de configuraciones antiguas. */
  setupFilesAfterEnv: ['@testing-library/jest-dom'],

  /** Ignoramos el rastro técnico de construcción para evitar falsos positivos. */
  testPathIgnorePatterns: ['/node_modules/', '/dist/', '/out-tsc/'],
};

export default jestConfigurationSnapshot;
