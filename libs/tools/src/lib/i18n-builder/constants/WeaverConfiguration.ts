/**
 * @section Tools & Infrastructure - Weaver Configuration & System Constants (SSOT)
 * @description Única Fuente de Verdad (SSOT) para las rutas físicas de escaneo (`libs/` y `apps/`),
 * exclusión de directorios de salida compilada, catálogo de idiomas activos derivado desde
 * `@floripa-dignidade/contracts` (ADR 0030) y re-exportación de contratos estructurales del Weaver.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179, ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { join } from 'node:path';
import { z } from 'zod';

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALE_CODES_COLLECTION,
  SupportedLocaleSchema,
  type TSupportedLocale,
} from '@floripa-dignidade/contracts';
import { type ModuleIdentifier, ModuleIdentifierSchema } from '@floripa-dignidade/telemetry';

import {
  ForensicAuditEntrySchema,
  type IForensicAuditEntry,
  type ILinguisticModulePayload,
  type ILinguisticParityViolation,
  type IWeaverAuditReport,
  LinguisticModulePayloadSchema,
  LinguisticParityViolationSchema,
  LinguisticSiloFormatSchema,
  type TLinguisticSiloFormat,
  WeaverAuditReportSchema,
} from '../schemas/WeaverContracts.schema';
import { ResolveWorkspaceRootDirectory } from './ResolveWorkspaceRootDirectory';

const WORKSPACE_ROOT_DIRECTORY_LITERAL = ResolveWorkspaceRootDirectory();
const LIBRARIES_SOURCE_DIRECTORY_LITERAL = join(WORKSPACE_ROOT_DIRECTORY_LITERAL, 'libs');
const APPS_SOURCE_DIRECTORY_LITERAL = join(WORKSPACE_ROOT_DIRECTORY_LITERAL, 'apps');
const COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL = join(
  APPS_SOURCE_DIRECTORY_LITERAL,
  'floripa-dignidade',
  'src',
  'app',
  'i18n',
);
const TARGET_OUTPUT_DIRECTORY_LITERAL = join(
  COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL,
  'dictionaries',
);

const ScanRootDirectoryConfigurationSchema = z
  .object({
    scopePrefixLiteral: z.enum(['libs', 'apps']),
    rootDirectoryPathLiteral: z.string().min(1),
  })
  .readonly();

/**
 * @name WeaverConfigurationSchema
 * @description Contrato Zod inmutable que certifica la integridad de rutas e identificadores del Weaver.
 */
export const WeaverConfigurationSchema = z
  .object({
    WORKSPACE_ROOT_DIRECTORY_LITERAL: z.string().min(1),
    LIBRARIES_SOURCE_DIRECTORY_LITERAL: z.string().min(1),
    APPS_SOURCE_DIRECTORY_LITERAL: z.string().min(1),
    SCAN_ROOT_DIRECTORIES_COLLECTION: z
      .array(ScanRootDirectoryConfigurationSchema)
      .min(1)
      .readonly(),
    COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL: z.string().min(1),
    EXCLUDED_DIRECTORY_PATHS_COLLECTION: z.array(z.string().min(1)).readonly(),
    EXCLUDED_DIRECTORY_NAMES_COLLECTION: z.array(z.string().min(1)).readonly(),
    TARGET_OUTPUT_DIRECTORY_LITERAL: z.string().min(1),
    FORENSIC_REPORTS_DIRECTORY_LITERAL: z.string().min(1),
    SOURCE_LOCALE_IDENTIFIER: SupportedLocaleSchema,
    SUPPORTED_LOCALES_COLLECTION: z.array(SupportedLocaleSchema).min(1).readonly(),
    WEAVER_ENGINE_IDENTIFIER_LITERAL: ModuleIdentifierSchema,
  })
  .readonly();

/**
 * @interface IWeaverConfiguration
 * @description Contrato inmutable de rutas, idiomas activos e identificadores del compilador Weaver.
 */
export interface IWeaverConfiguration {
  readonly WORKSPACE_ROOT_DIRECTORY_LITERAL: string;
  readonly LIBRARIES_SOURCE_DIRECTORY_LITERAL: string;
  readonly APPS_SOURCE_DIRECTORY_LITERAL: string;
  readonly SCAN_ROOT_DIRECTORIES_COLLECTION: readonly {
    readonly scopePrefixLiteral: 'libs' | 'apps';
    readonly rootDirectoryPathLiteral: string;
  }[];
  readonly COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL: string;
  readonly EXCLUDED_DIRECTORY_PATHS_COLLECTION: readonly string[];
  readonly EXCLUDED_DIRECTORY_NAMES_COLLECTION: readonly string[];
  readonly TARGET_OUTPUT_DIRECTORY_LITERAL: string;
  readonly FORENSIC_REPORTS_DIRECTORY_LITERAL: string;
  readonly SOURCE_LOCALE_IDENTIFIER: TSupportedLocale;
  readonly SUPPORTED_LOCALES_COLLECTION: readonly TSupportedLocale[];
  readonly WEAVER_ENGINE_IDENTIFIER_LITERAL: ModuleIdentifier;
}

const rawWeaverConfigurationSnapshot: IWeaverConfiguration = Object.freeze({
  WORKSPACE_ROOT_DIRECTORY_LITERAL,
  LIBRARIES_SOURCE_DIRECTORY_LITERAL,
  APPS_SOURCE_DIRECTORY_LITERAL,
  SCAN_ROOT_DIRECTORIES_COLLECTION: Object.freeze([
    Object.freeze({
      scopePrefixLiteral: 'libs' as const,
      rootDirectoryPathLiteral: LIBRARIES_SOURCE_DIRECTORY_LITERAL,
    }),
    Object.freeze({
      scopePrefixLiteral: 'apps' as const,
      rootDirectoryPathLiteral: APPS_SOURCE_DIRECTORY_LITERAL,
    }),
  ]),
  COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL,
  EXCLUDED_DIRECTORY_PATHS_COLLECTION: Object.freeze([
    COMPILED_DICTIONARIES_CONTAINER_DIRECTORY_LITERAL,
    TARGET_OUTPUT_DIRECTORY_LITERAL,
  ]),
  EXCLUDED_DIRECTORY_NAMES_COLLECTION: Object.freeze([
    'node_modules',
    'dist',
    'out-tsc',
    'coverage',
    'reports',
    'public',
    'tmp',
    'schemas',
    'test-output',
    '__mocks__',
  ]),
  TARGET_OUTPUT_DIRECTORY_LITERAL,
  FORENSIC_REPORTS_DIRECTORY_LITERAL: join(WORKSPACE_ROOT_DIRECTORY_LITERAL, 'reports'),
  SOURCE_LOCALE_IDENTIFIER: DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_COLLECTION: SUPPORTED_LOCALE_CODES_COLLECTION,
  WEAVER_ENGINE_IDENTIFIER_LITERAL: ModuleIdentifierSchema.parse(
    'INTERNATIONALIZATION_WEAVER_ENGINE',
  ),
});

WeaverConfigurationSchema.parse(rawWeaverConfigurationSnapshot);

/**
 * @name WEAVER_CONFIGURATION
 * @description Manifiesto central inmutable del compilador lingüístico derivado del SSOT BCP 47.
 */
export const WEAVER_CONFIGURATION: IWeaverConfiguration = rawWeaverConfigurationSnapshot;

export {
  ForensicAuditEntrySchema,
  LinguisticModulePayloadSchema,
  LinguisticParityViolationSchema,
  LinguisticSiloFormatSchema,
  WeaverAuditReportSchema,
};

export type {
  IForensicAuditEntry,
  ILinguisticModulePayload,
  ILinguisticParityViolation,
  IWeaverAuditReport,
  TLinguisticSiloFormat,
};
