/**
 * @section Storage Contracts - Multimedia Vault Result Schema (Atom)
 * @description Contrato Zod inmutable para certificar la salida consolidada tras la
 * carga de un activo multimedia o documental en Supabase Storage, garantizando URL
 * HTTPS pública válida y clave jerárquica sellada nominalmente.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { EnterpriseStoragePathLiteralSchema } from './EnterpriseStoragePath.schema';

/**
 * @name MultimediaVaultResultSchema
 * @description Aduana Zod inmutable para la respuesta pública del almacenamiento multimedia.
 */
export const MultimediaVaultResultSchema = z
  .object({
    /** URL pública HTTPS para acceder al activo almacenado en Supabase Storage. */
    evidenceUrlLiteral: z
      .string()
      .trim()
      .url({ message: 'INVALID_EVIDENCE_PUBLIC_URL' })
      .refine((urlLiteral: string): boolean => urlLiteral.startsWith('https://'), {
        message: 'EVIDENCE_PUBLIC_URL_REQUIRES_HTTPS',
      })
      .describe('Localizador uniforme HTTPS público generado para el recurso persistido.'),

    /** Clave jerárquica interna normalizada dentro del bucket de almacenamiento. */
    storagePathLiteral: EnterpriseStoragePathLiteralSchema.describe(
      'Ruta relativa sellada dentro del bucket de almacenamiento cloud.',
    ),
  })
  .readonly();

/** Contrato de salida inmutable tras la persistencia multimedia en la nube. */
export type IMultimediaVaultResult = z.infer<typeof MultimediaVaultResultSchema>;
