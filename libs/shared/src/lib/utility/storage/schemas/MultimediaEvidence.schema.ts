/**
 * @section Storage DNA - Multimedia Evidence Schema
 * @description Define el contrato de integridad para cualquier archivo que ingrese
 * al ecosistema (Denuncias, Facturas, Actas). Implementa validación de seguridad.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 */

import { z } from 'zod';

/** Identificador nominal para el archivo en la bóveda */
export const EvidenceIdentifierSchema = z.string().uuid().brand<'EvidenceIdentifier'>();
export type TEvidenceIdentifier = z.infer<typeof EvidenceIdentifierSchema>;

export const MultimediaEvidencePayloadSchema = z.object({
  /** El archivo físico en formato Blob o Buffer */
  fileBlobReference: z.instanceof(Blob).or(z.custom<Buffer>())
    .describe('Referencia binaria al activo multimedia.'),

  /** Metadata de Clasificación Institucional */
  contextMetadata: z.object({
    ownerOrganizationIdentifier: z.string().default('GLOBAL_FLORIPA'),
    evidenceCategoryLiteral: z.enum(['HUMAN_RIGHTS_PROOF', 'FINANCIAL_INVOICE', 'INSTITUTIONAL_ASSET', 'CITIZEN_REPORT']),
    originalFileNameLiteral: z.string().min(1),
    mimeTypeLiteral: z.string().regex(/^(image|application|video|audio)\//),
  }),

  /** Seguridad SRE: Límite máximo 15MB */
  fileSizeInBytesQuantity: z.number().max(15728640, 'FILE_TOO_LARGE_MAX_15MB'),

}).readonly();

export type IMultimediaEvidencePayload = z.infer<typeof MultimediaEvidencePayloadSchema>;
