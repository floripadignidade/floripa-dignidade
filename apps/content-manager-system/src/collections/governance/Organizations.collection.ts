/**
 * @section CMS Architecture - Governance & Multi-Tenancy Orchestrator
 * @description Orquestador declarativo de la colección de Organizaciones en Payload CMS 3.84.
 * Ensambla los átomos de política RBAC, campos institucionales/branding y hooks de
 * trazabilidad forense preservando intacto el contrato de colección.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Enjambre Atómico Local (Clean Paths - Extensionless) */
import { ORGANIZATIONS_ACCESS_POLICY } from './organizations/OrganizationsAccessPolicy';
import { ORGANIZATIONS_FIELDS_COLLECTION } from './organizations/OrganizationsFields';
import { ORGANIZATIONS_FORENSIC_HOOKS } from './organizations/OrganizationsForensicHooks';

/**
 * @name OrganizationsCollection
 * @description Registro de entidades institucionales que conforman la red de impacto social.
 */
export const OrganizationsCollection: CollectionConfig = {
  slug: 'organizations',

  labels: {
    singular: 'Organização',
    plural: 'Ecossistema Institucional',
  },

  admin: {
    useAsTitle: 'institutionalNameLiteral',
    group: 'Governança',
    defaultColumns: [
      'institutionalNameLiteral',
      'legalIdentificationLiteral',
      'operationalStatusLiteral',
    ],
  },

  access: ORGANIZATIONS_ACCESS_POLICY,
  fields: ORGANIZATIONS_FIELDS_COLLECTION,
  hooks: ORGANIZATIONS_FORENSIC_HOOKS,
};
