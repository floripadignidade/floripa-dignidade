/**
 * @section CMS Architecture - Infrastructure & Forensic Evidence Orchestrator
 * @description Orquestador declarativo de la colección multimedia en Payload CMS 3.84.
 * Ensambla los átomos de política RBAC, configuración de carga S3/WebP/AVIF, campos de
 * accesibilidad WCAG y hooks de auditoría forense manteniendo el contrato público intacto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

import { MEDIA_VAULT_ACCESS_POLICY } from './media-vault/MediaVaultAccessPolicy';
import { MEDIA_VAULT_FIELDS_COLLECTION } from './media-vault/MediaVaultFields';
import { MEDIA_VAULT_FORENSIC_HOOKS } from './media-vault/MediaVaultForensicHooks';
import { MEDIA_VAULT_UPLOAD_CONFIGURATION } from './media-vault/MediaVaultUploadConfig';

/**
 * @name MediaVaultCollection
 * @description Colección institucional para la custodia de evidencias y activos de marca en la nube.
 */
export const MediaVaultCollection: CollectionConfig = {
  slug: 'media-vault',

  labels: {
    singular: 'Mídia/Evidência',
    plural: 'Acervo Multimídia',
  },

  admin: {
    group: 'Infraestrutura',
    description: 'Gerenciamento de evidências visuais e ativos de marca institucional.',
    useAsTitle: 'alternativeTextLiteral',
    defaultColumns: ['filename', 'alternativeTextLiteral', 'mimeType', 'filesize'],
  },

  access: MEDIA_VAULT_ACCESS_POLICY,
  upload: MEDIA_VAULT_UPLOAD_CONFIGURATION,
  fields: MEDIA_VAULT_FIELDS_COLLECTION,
  hooks: MEDIA_VAULT_FORENSIC_HOOKS,
};
