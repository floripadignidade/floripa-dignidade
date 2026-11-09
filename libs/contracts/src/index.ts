/**
 * @section Global Infrastructure - Enterprise Contracts Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para el ADN estructural del ecosistema.
 * Centraliza la exportación de esquemas Zod, tipos nominales y contratos de acceso.
 *
 * Implementa la estrategia de exportación dual para garantizar compatibilidad absoluta:
 * 1. Nomenclatura ISO 11179 Estricta (IdentityAccessRoleSchema, IdentityProfileSchema).
 * 2. Alias de Compatibilidad Institucional (UserAccessRoleSchema, UserIdentitySchema).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO Zenith: Erradicación definitiva de los errores TS2305 y TS2724 exponiendo
 * todos los esquemas, colecciones y tipos requeridos por los módulos de negocio.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Importaciones Locales para Construcción de Esquemas Compuestos */
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
} from './lib/identity/schemas/IdentityIdentifiers.schema.js';

import {
  IdentityAuthorityResultSchema,
} from './lib/identity/schemas/IdentityAuthorityAudit.schema.js';

import {
  IdentityAccessRoleSchema,
  UserAccessRoleSchema,
} from './lib/identity/UserAccessRole.schema.js';

/**
 * ============================================================================
 * @domain 1. MANAGEMENT & IDENTITY (Multi-tenant Governance)
 * ============================================================================
 */

/* 1.1. Identidad, Roles y Jerarquía de Autoridad */
export {
  IdentityAccessRoleSchema,
  UserAccessRoleSchema,
  IDENTITY_ACCESS_ROLES_COLLECTION,
  USER_ACCESS_ROLES_COLLECTION,
} from './lib/identity/UserAccessRole.schema.js';

export type {
  TIdentityAccessRole,
  UserAccessRole,
} from './lib/identity/UserAccessRole.schema.js';

export {
  IdentityProfileSchema,
  IdentityProfileSchema as UserIdentitySchema,
  IdentityTrustLevelEnum,
} from './lib/identity/schemas/IdentityProfile.schema.js';

export type {
  IIdentityProfile,
  IIdentityProfile as IUserIdentity,
  TIdentityTrustLevel,
} from './lib/identity/schemas/IdentityProfile.schema.js';

/* 1.2. Proveedores de Identidad Federada */
export const SocialIdentityProviderSchema = z
  .enum(['GOOGLE_IDENTITY', 'APPLE_ID', 'INTERNAL_INFRASTRUCTURE'])
  .describe('Identificador técnico de proveedor de autenticación federada o interna.');

export type SocialIdentityProvider = z.infer<typeof SocialIdentityProviderSchema>;

/* 1.3. Identificadores Nominales (Branded Types) */
export {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
  DeviceFingerprintIdentifierSchema,
} from './lib/identity/schemas/IdentityIdentifiers.schema.js';

export type {
  TIdentityIdentifier,
  TOrganizationIdentifier,
  TTerritorialTechnicalIdentifier,
  TDeviceFingerprintIdentifier,
} from './lib/identity/schemas/IdentityIdentifiers.schema.js';

/* 1.4. Validación de Documentación Civil y Privacidad */
export {
  CitizenCpfSchema,
  EnterpriseCnpjSchema,
} from './lib/identity/schemas/IdentityDocument.schema.js';

export {
  AnonymizeIdentityNameSchema,
} from './lib/identity/schemas/AnonymizeIdentityName.schema.js';

export type {
  IAnonymizeIdentityNameParameters,
} from './lib/identity/schemas/AnonymizeIdentityName.schema.js';

/* 1.5. Gobernanza, Permisos y Solicitudes de Acceso */
export {
  AccessIntegrityRequestSchema,
} from './lib/identity/schemas/AccessIntegrityRequest.schema.js';

export type {
  IAccessIntegrityRequest,
} from './lib/identity/schemas/AccessIntegrityRequest.schema.js';

export const EvaluateIdentityAuthoritySchema = z
  .object({
    activeRoleLiteral: UserAccessRoleSchema,
    requiredRoleLiteral: UserAccessRoleSchema,
  })
  .readonly()
  .describe('Contrato para la evaluación de jerarquía de autoridad institucional.');

export type IEvaluateIdentityAuthorityParameters = z.infer<
  typeof EvaluateIdentityAuthoritySchema
>;

/* 1.6. Auditoría de Confianza, Mérito y Antigüedad */
export {
  IdentityAuthorityAuditSchema,
  IdentityAuthorityResultSchema,
} from './lib/identity/schemas/IdentityAuthorityAudit.schema.js';

export type {
  IIdentityAuthorityAuditParameters,
  IIdentityAuthorityResult,
} from './lib/identity/schemas/IdentityAuthorityAudit.schema.js';

export {
  IdentitySecurityStandardsSchema,
} from './lib/identity/schemas/IdentitySecurityStandards.schema.js';

export type {
  IIdentitySecurityStandards,
} from './lib/identity/schemas/IdentitySecurityStandards.schema.js';

export {
  IdentitySeniorityResultSchema,
} from './lib/identity/schemas/IdentitySeniority.schema.js';

export type {
  IIdentitySeniorityResult,
} from './lib/identity/schemas/IdentitySeniority.schema.js';

export {
  ValidateAdministrativeAuthoritySchema,
} from './lib/identity/schemas/ValidateAdministrativeAuthority.schema.js';

export type {
  IValidateAdministrativeAuthorityParameters,
} from './lib/identity/schemas/ValidateAdministrativeAuthority.schema.js';

/* 1.7. Persistencia Física y Sincronización en el Ledger */
export {
  IdentityPhysicalRecordSchema,
} from './lib/identity/schemas/IdentityPhysicalRecord.schema.js';

export type {
  IIdentityPhysicalRecord,
} from './lib/identity/schemas/IdentityPhysicalRecord.schema.js';

export const SynchronizeIdentityAuthoritySchema = z
  .object({
    identityIdentifier: IdentityIdentifierSchema,
    organizationIdentifier: OrganizationIdentifierSchema,
    authorityResultSnapshot: IdentityAuthorityResultSchema,
    correlationIdentifier: z.string().uuid(),
  })
  .readonly()
  .describe('Contrato para la sincronización de autoridad institucional en el Ledger.');

export type ISynchronizeIdentityAuthorityParameters = z.infer<
  typeof SynchronizeIdentityAuthoritySchema
>;

/**
 * ============================================================================
 * @domain 2. FINANCIAL & MUNICIPAL DATA (Fiscal Auditing SSOT)
 * ============================================================================
 */
export * from './lib/financial/PublicExpenditure.schema.js';
