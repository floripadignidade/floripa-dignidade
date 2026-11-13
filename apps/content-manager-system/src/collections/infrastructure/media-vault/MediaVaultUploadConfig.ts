/**
 * @section CMS Infrastructure - Media Vault Upload Specification (Atom)
 * @description Define las reglas técnicas de ingesta multimedia y generación de
 * variantes optimizadas (WebP y AVIF) para optimizar Core Web Vitals (LCP) y
 * preservar evidencias documentales en alta definición.
 *
 * Delega la persistencia física al adaptador S3-Compatible configurado en Payload CMS
 * (omitiendo almacenamiento en disco local conforme a ADR 0015).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

type TMediaVaultUploadConfiguration = Exclude<NonNullable<CollectionConfig['upload']>, boolean>;

const uploadConfigurationDefinition: TMediaVaultUploadConfiguration = {
  mimeTypes: ['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'application/pdf'],
  imageSizes: [
    {
      name: 'thumbnail',
      width: 400,
      height: 300,
      position: 'centre',
      formatOptions: { format: 'webp', options: { quality: 80 } },
    },
    {
      name: 'standard_card',
      width: 800,
      height: 500,
      position: 'centre',
      formatOptions: { format: 'webp', options: { quality: 85 } },
    },
    {
      name: 'forensic_high_definition',
      width: 1920,
      position: 'centre',
      formatOptions: { format: 'avif', options: { quality: 90 } },
    },
  ],
  adminThumbnail: 'thumbnail',
};

/**
 * @name MEDIA_VAULT_UPLOAD_CONFIGURATION
 * @description Configuración inmutable de formatos MIME permitidos y perfiles de compresión.
 */
export const MEDIA_VAULT_UPLOAD_CONFIGURATION: TMediaVaultUploadConfiguration = Object.freeze(
  uploadConfigurationDefinition,
);
