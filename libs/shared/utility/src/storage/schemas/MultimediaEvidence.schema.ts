/**
 * @section Storage DNA - Multimedia Evidence Schema
 * @description Define el contrato de integridad absoluto para cualquier activo físico
 * que ingrese al ecosistema (Denuncias, Facturas, Actas). Implementa validación de
 * seguridad, límites de cuota SRE e isomorfismo total para soportar Edge Runtime.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Isomorphic Integrity.
 * 🛡️ LEY ZENITH: Erradicación de la dependencia 'Buffer' de Node.js para permitir
 * la validación de archivos en el cliente (Browser) y en el servidor (Vercel Edge).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section Identidades Nominales (Branded Types)
 * @description Sello de marca que garantiza que un ID de evidencia sea tratado
 * como una entidad única en el Grafo de Tipos, evitando colisiones con IDs de usuarios.
 */
export const EvidenceIdentifierSchema = z.string().uuid().brand<'EvidenceIdentifier'>();
export type TEvidenceIdentifier = z.infer<typeof EvidenceIdentifierSchema>;

/**
 * @section Taxonomía de Evidencia
 * Clasificación ontológica del propósito del archivo.
 */
export const EvidenceCategorySchema = z
  .enum([
    'HUMAN_RIGHTS_PROOF', // Pruebas directas de violaciones (Fotos/Videos)
    'FINANCIAL_INVOICE', // Comprobantes de gasto público (PDF/Imágenes)
    'INSTITUTIONAL_ASSET', // Activos de marca o documentos oficiales de la ONG
    'CITIZEN_REPORT', // Testimonios documentados
  ])
  .describe('Categoría técnica que determina la política de retención y cifrado.');

export type TEvidenceCategory = z.infer<typeof EvidenceCategorySchema>;

/**
 * @name MultimediaEvidencePayloadSchema
 * @description Aduana de ADN para la inyección de pruebas documentales.
 * Valida tanto la integridad binaria como los metadatos de clasificación.
 */
export const MultimediaEvidencePayloadSchema = z
  .object({
    /**
     * 🛡️ SANEADO Zenith: Referencia binaria isomórfica.
     * Acepta tipos nativos de navegador y de servidor sin recurrir a APIs propietarias.
     */
    fileBlobReference: z
      .instanceof(Blob)
      .or(z.instanceof(Uint8Array))
      .or(z.instanceof(ArrayBuffer))
      .describe('Cuerpo binario del archivo capturado por el hardware.'),

    /** Metadata de Clasificación e Identidad Institucional */
    institutionalContextMetadata: z
      .object({
        ownerOrganizationIdentifier: z
          .string()
          .default('GLOBAL_FLORIPA')
          .describe('UUID de la organización responsable de la custodia.'),

        evidenceCategoryLiteral: EvidenceCategorySchema,

        originalFileNameLiteral: z
          .string()
          .min(1, { message: 'STORAGE.ERRORS.FILENAME_REQUIRED' })
          .transform((value) => value.trim())
          .describe('Nombre original del archivo para rastro forense.'),

        mimeTypeLiteral: z
          .string()
          .regex(/^(image|application|video|audio)\//, {
            message: 'STORAGE.ERRORS.INVALID_MIME_TYPE',
          })
          .describe('Identificador técnico del formato de medio (ISO Standard).'),
      })
      .readonly(),

    /**
     * Seguridad SRE: Límite de carga (Quota Guard).
     * @constant MAXIMUM_FILE_SIZE_BYTES - 15MB (Límite del Tier gratuito).
     */
    fileSizeInBytesQuantity: z
      .number()
      .nonnegative()
      .max(15728640, { message: 'STORAGE.ERRORS.FILE_TOO_LARGE_MAX_15MB' })
      .describe('Tamaño físico del archivo en bytes para auditoría de cuota.'),
  })
  .readonly(); // Inmutabilidad forzada del contrato.

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IMultimediaEvidencePayload = z.infer<typeof MultimediaEvidencePayloadSchema>;
