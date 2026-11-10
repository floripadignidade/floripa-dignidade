// commitlint.config.mjs

/**
 * @section Quality Assurance - Conventional Commits Governance
 * @description Configuración central de Commitlint para la validación del historial de Git.
 * Fuerza el cumplimiento de la especificación Conventional Commits v1.0.0, garantizando
 * trazabilidad inmutable y generación determinista de changelogs en el monorepo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** @type {import('@commitlint/types').UserConfig} */
export default {
  extends: ['@commitlint/config-conventional'],
  rules: {
    /**
     * @section Tipos de Commit Autorizados
     * Taxonomía estricta de intenciones de cambio en el monorepo.
     */
    'type-enum': [
      2,
      'always',
      [
        'feat',     // Nueva funcionalidad para el usuario o sistema
        'fix',      // Corrección de un fallo o error en producción/staging
        'docs',     // Modificaciones exclusivamente en documentación y manifiestos
        'style',    // Cambios de formato que no afectan la lógica del código
        'refactor', // Reestructuración de código sin alterar su comportamiento externo
        'perf',     // Mejoras directas de rendimiento físico o SRE (latencia/memoria)
        'test',     // Adición o corrección de pruebas unitarias o de integración
        'build',    // Cambios que afectan el sistema de compilación o dependencias
        'ci',       // Modificaciones en flujos de integración continua o Vercel
        'chore',    // Tareas rutinarias de mantenimiento o tooling
        'revert',   // Reversión de un commit previo en el árbol de Git
      ],
    ],

    /**
     * @section Gobernanza de Ámbitos (Monorepo Scopes)
     * Catálogo institucional sincronizado con las aplicaciones y búnkeres de libs/.
     */
    'scope-enum': [
      1,
      'always',
      [
        // Aplicaciones finales (Shells)
        'portal',
        'cms',
        // Búnkeres y librerías de dominio
        'contracts',
        'core',
        'telemetry',
        'exceptions',
        'environment',
        'routing',
        'analytics',
        'engines',
        'identity',
        'interaction',
        'messaging',
        'newsletter',
        'reputation',
        'territorial',
        'whatsapp',
        'design-system',
        'ui-foundry',
        'state-store',
        'utility',
        // Infraestructura y soporte
        'tools',
        'scripts',
        'database',
        'deps',
        'release',
        'infra',
      ],
    ],

    /**
     * @section Reglas de Formato y Rigor
     */
    'type-case': [2, 'always', 'lower-case'],
    'type-empty': [2, 'never'],
    'scope-case': [2, 'always', 'lower-case'],
    'subject-case': [
      2,
      'never',
      ['sentence-case', 'start-case', 'pascal-case', 'upper-case'],
    ],
    'subject-empty': [2, 'never'],
    'subject-full-stop': [2, 'never', '.'],
    'header-max-length': [2, 'always', 100],
    'body-leading-blank': [1, 'always'],
    'footer-leading-blank': [1, 'always'],
  },
};