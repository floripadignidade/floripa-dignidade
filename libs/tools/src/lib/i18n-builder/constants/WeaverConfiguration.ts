/**
 * @section Tools & Infrastructure - Weaver Configuration & System Constants
 * @description Única Fuente de Verdad (SSOT) para las constantes físicas de configuración,
 * rutas de directorios del monorepo, catálogo de idiomas admitidos y contratos estructurales
 * para el pipeline de compilación lingüística del Weaver.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Tipado nominal de 'ModuleIdentifier', inmutabilidad estricta en colecciones forenses
 * e inyección de contratos Zod para validación en tiempo de ejecución.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { join, resolve } from 'node:path';
import { z } from 'zod';

/* 1. Infraestructura Core de Telemetría */
import type { ModuleIdentifier } from '@floripa-dignidade/telemetry';

/**
 * @constant WORKSPACE_ROOT_DIRECTORY_LITERAL
 * Ruta absoluta resuelta desde la raíz de trabajo física del monorepo.
 */
const WORKSPACE_ROOT_DIRECTORY_LITERAL = resolve(process.cwd());

/**
 * @name WEAVER_CONFIGURATION
 * @description Manifiesto central inmutable de configuración física del Weaver.
 */
export const WEAVER_CONFIGURATION = {
  /** Directorio raíz donde residen todas las librerías del monorepo sujetas a escaneo. */
  LIBRARIES_SOURCE_DIRECTORY_LITERAL: join(
    WORKSPACE_ROOT_DIRECTORY_LITERAL,
    'libs',
  ),

  /** Directorio físico donde se generan los diccionarios unificados consumidos por Next.js. */
  TARGET_OUTPUT_DIRECTORY_LITERAL: join(
    WORKSPACE_ROOT_DIRECTORY_LITERAL,
    'apps',
    'floripa-dignidade',
    'src',
    'app',
    'i18n',
    'dictionaries',
  ),

  /** Subdirectorio institucional para el depósito de informes forenses de compilación. */
  FORENSIC_REPORTS_DIRECTORY_LITERAL: join(
    WORKSPACE_ROOT_DIRECTORY_LITERAL,
    'reports',
  ),

  /** Catálogo oficial de idiomas admitidos por la plataforma institucional. */
  SUPPORTED_LOCALES_COLLECTION: ['pt-BR', 'es-ES', 'en-US'] as const,

  /** Identificador técnico sellado para trazabilidad de telemetría forense. */
  WEAVER_ENGINE_IDENTIFIER_LITERAL:
    'INTERNATIONALIZATION_WEAVER_ENGINE' as ModuleIdentifier,
} as const;

/**
 * @name ForensicAuditEntrySchema
 * @description Esquema inmutable de validación para las entradas individuales de auditoría de módulos.
 */
export const ForensicAuditEntrySchema = z
  .object({
    /** Identificador de ruta del módulo analizado (ej: 'core/telemetry'). */
    moduleIdentifierLiteral: z.string().min(1),

    /** Ruta física normalizada del directorio de origen del silo. */
    filesystemPathLiteral: z.string().min(1),

    /** Colección inmutable de idiomas encontrados y procesados en el módulo. */
    processedLocalesCollection: z.array(z.string()).readonly(),
  })
  .readonly();

export type IForensicAuditEntry = z.infer<typeof ForensicAuditEntrySchema>;

/**
 * @name LinguisticModulePayloadSchema
 * @description Estructura de diccionario agrupado por módulo para la generación de archivos JSON.
 */
export const LinguisticModulePayloadSchema = z
  .record(z.string(), z.record(z.string(), z.unknown()))
  .readonly();

export type ILinguisticModulePayload = z.infer<
  typeof LinguisticModulePayloadSchema
>;