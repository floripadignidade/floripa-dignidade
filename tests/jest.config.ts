/**
 * @section Quality Assurance - Jest Configuration (QA Mirror)
 * @description Orquestador de ejecución de pruebas para el búnker de validación.
 * Implementa la doctrina de Mirror Testing (ADR 0008), desacoplando las aserciones
 * de la lógica de producción para optimizar el despliegue en Vercel.
 *
 * Protocolo OEDP-V17.0 - High Performance QA & Atomic Visual DNA.
 * SANEADO Zenith: Alineación con la Maniobra de Redirección de ADN.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { Config } from 'jest';

/**
 * @name jestConfigurationSnapshot
 * @description Manifiesto de configuración técnica para el motor de aserciones.
 * Utiliza @swc/jest para garantizar una transpilación de alta velocidad.
 */
const jestConfigurationSnapshot: Config = {
  /** Identificador nominal para el enjambre de Nx. */
  displayName: 'qa-mirror',

  /** Pre-ajustes institucionales definidos en la raíz del monorepo. */
  preset: '../jest.preset.js',

  /**
   * @section Motor de Transformación (SWC Pipeline)
   * Configuración de transpilación asíncrona para TypeScript y React 19.
   * Optimizado para ejecutar pruebas unitarias en < 100ms.
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
            },
          },
        },
      },
    ],
  },

  /** Extensiones de archivo autorizadas para el escaneo de auditoría de calidad. */
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],

  /**
   * Trazabilidad Forense de Cobertura.
   * Centraliza los reportes fuera del área de código para evitar contaminación.
   */
  coverageDirectory: '../coverage/tests',

  /**
   * Entorno de ejecución: JSDOM.
   * Simula las APIs de hardware de navegador necesarias para componentes Shared UI.
   */
  testEnvironment: 'jsdom',

  /**
   * @section Sincronización de Soberanía (Alias Mapping)
   * Permite que los tests importen de libs/ usando el alias oficial @floripa-dignidade/*.
   * 🛡️ LEY ZENITH: Durante la fase de desarrollo, apunta a los fuentes para HMR,
   * pero el CI/CD puede sobreescribir esto para apuntar a 'dist/out-tsc'.
   */
  moduleNameMapper: {
    '^@floripa-dignidade/(.*)$': '<rootDir>/../libs/$1/src/index.ts',
  },

  /** Protocolo de reporte para integración continua. */
  passWithNoTests: true,

  /** 🛡️ SANEADO Zenith: Erradicación de rastro muerto de setups. */
  setupFilesAfterEnv: [],
};

export default jestConfigurationSnapshot;
