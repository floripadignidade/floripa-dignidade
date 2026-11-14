/**
 * @section CMS Architecture - Identity & Civil Governance Orchestrator
 * @description Orquestador declarativo de la colección de Ciudadanos y Operadores
 * institucionales en Payload CMS 3.84. Ensambla los átomos de política RBAC, campos
 * de identidad/consentimiento LGPD y hooks de trazabilidad forense sin PII,
 * manteniendo simetría estructural con `OrganizationsCollection` y `MediaVaultCollection`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad) y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Enjambre Atómico Local (Clean Paths - Extensionless) */
import { CITIZEN_USERS_ACCESS_POLICY } from './citizen-users/CitizenUsersAccessPolicy';
import { CITIZEN_USERS_FIELDS_COLLECTION } from './citizen-users/CitizenUsersFields';
import { CITIZEN_USERS_FORENSIC_HOOKS } from './citizen-users/CitizenUsersForensicHooks';

/**
 * @name CitizenUsersCollection
 * @description Bóveda de identidades ciudadanas y operadores con autoridad sobre el ecosistema.
 */
export const CitizenUsersCollection: CollectionConfig = {
  slug: 'citizen-users',

  labels: {
    singular: 'Cidadão',
    plural: 'Rede de Cidadania',
  },

  admin: {
    useAsTitle: 'fullLegalNameLiteral',
    group: 'Identidade & Acesso',
    defaultColumns: ['fullLegalNameLiteral', 'email', 'assignedAuthorityRoleLiteral'],
    listSearchableFields: ['fullLegalNameLiteral', 'email'],
  },

  auth: {
    tokenExpiration: 7200,
    verify: false,
    maxLoginAttempts: 5,
    lockTime: 600000,
  },

  access: CITIZEN_USERS_ACCESS_POLICY,
  fields: CITIZEN_USERS_FIELDS_COLLECTION,
  hooks: CITIZEN_USERS_FORENSIC_HOOKS,
};
