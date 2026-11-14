/**
 * @section Storage Contracts - Enterprise Storage Path Schema (Atom)
 * @description Define los contratos Zod inmutables y tipos nominales (Branded Types)
 * para la validación de parámetros de entrada y claves jerárquicas S3-Compatible.
 * Garantiza prevención estructural contra Path Traversal e inmutabilidad de rutas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { EvidenceCategorySchema } from './MultimediaEvidence.schema';

/**
 * @name EnterpriseStoragePathLiteralSchema
 * @description Contrato Zod con sellado de marca nominal para claves jerárquicas S3 válidas.
 */
export const EnterpriseStoragePathLiteralSchema = z
  .string()
  .trim()
  .min(1, { message: 'STORAGE_PATH_MUST_NOT_BE_EMPTY' })
  .refine(
    (pathCandidateLiteral: string): boolean =>
      !pathCandidateLiteral.includes('..') &&
      !pathCandidateLiteral.startsWith('/') &&
      !pathCandidateLiteral.endsWith('/') &&
      !pathCandidateLiteral.includes('//'),
    { message: 'INVALID_ENTERPRISE_STORAGE_PATH_STRUCTURE' },
  )
  .describe('Clave jerárquica relativa S3 saneada y libre de secuencias de salto de directorio.')
  .brand<'EnterpriseStoragePathLiteral'>();

/** Tipo nominal inmutable para la ruta de almacenamiento relativa dentro del bucket. */
export type TEnterpriseStoragePathLiteral = z.infer<typeof EnterpriseStoragePathLiteralSchema>;

/**
 * @name InstitutionalContextMetadataContractSchema
 * @description Contrato Zod inmutable para los metadatos institucionales requeridos al construir claves S3.
 */
export const InstitutionalContextMetadataContractSchema = z
  .object({
    ownerOrganizationIdentifier: z
      .string()
      .default('GLOBAL_FLORIPA')
      .describe('Identificador de la organización responsable de la custodia.'),
    evidenceCategoryLiteral: EvidenceCategorySchema,
    originalFileNameLiteral: z
      .string()
      .trim()
      .min(1, { message: 'STORAGE.ERRORS.FILENAME_REQUIRED' })
      .describe('Nombre original del archivo para trazabilidad forense.'),
    mimeTypeLiteral: z
      .string()
      .regex(/^(image|application|video|audio)\//, {
        message: 'STORAGE.ERRORS.INVALID_MIME_TYPE',
      })
      .describe('Identificador técnico del formato MIME (ISO Standard).'),
  })
  .readonly();

/**
 * @name GenerateEnterpriseStoragePathParametersSchema
 * @description Aduana Zod inmutable para validar los metadatos institucionales y el UUID v4 único.
 */
export const GenerateEnterpriseStoragePathParametersSchema = z
  .object({
    institutionalContextMetadata: InstitutionalContextMetadataContractSchema,
    uniqueIdentifierLiteral: z
      .string()
      .trim()
      .uuid({ message: 'STORAGE_UNIQUE_IDENTIFIER_MUST_BE_UUID_V4' })
      .describe('Identificador único universal (UUID v4) para evitar colisiones de objetos S3.'),
  })
  .readonly();

export type IGenerateEnterpriseStoragePathParameters = z.infer<
  typeof GenerateEnterpriseStoragePathParametersSchema
>;
