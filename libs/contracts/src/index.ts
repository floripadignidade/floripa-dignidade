/**
 * @section Global Infrastructure - Enterprise Contracts Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para el ADN estructural del ecosistema.
 * Centraliza la exportación de esquemas Zod, tipos nominales y almas lingüísticas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * SANEADO Zenith: Erradicación de términos "User/Citizen", resolución nativa ESM
 * y purga de referencias huérfanas detectadas en la auditoría forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @domain 1. MANAGEMENT & IDENTITY (Multi-tenant Governance)
 * @description Contratos para la gestión de perfiles, autoridad y acceso.
 */

/* 1.1. Identidad y Autoridad (SANEADO ISO 11179) */
export {
  IdentityAccessRoleSchema,
  IDENTITY_ACCESS_ROLES_COLLECTION
} from './lib/identity/IdentityAccessRole.schema.js';

export type {
  TIdentityAccessRole
} from './lib/identity/IdentityAccessRole.schema.js';

export {
  IdentityProfileSchema,
  IdentityTrustLevelEnum,
} from './lib/identity/schemas/IdentityProfile.schema.js';

export type {
  IIdentityProfile,
  TIdentityTrustLevel
} from './lib/identity/schemas/IdentityProfile.schema.js';

/* 1.2. Identificadores Nominales (Branded Types) */
export {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
  DeviceFingerprintIdentifierSchema
} from './lib/identity/schemas/IdentityIdentifiers.schema.js';

export type {
  TIdentityIdentifier,
  TOrganizationIdentifier,
  TTerritorialTechnicalIdentifier,
  TDeviceFingerprintIdentifier
} from './lib/identity/schemas/IdentityIdentifiers.schema.js';

/* 1.3. Validación de Identidad Civil y Privacidad */
export {
  CitizenCpfSchema,
  EnterpriseCnpjSchema
} from './lib/identity/schemas/IdentityDocument.schema.js';

export {
  AnonymizeIdentityNameSchema
} from './lib/identity/schemas/AnonymizeIdentityName.schema.js';

export type {
  IAnonymizeIdentityNameParameters
} from './lib/identity/schemas/AnonymizeIdentityName.schema.js';

/* 1.4. Gobernanza y Auditoría Institucional */
export {
  AccessIntegrityRequestSchema
} from './lib/identity/schemas/AccessIntegrityRequest.schema.js';

export type {
  IAccessIntegrityRequest
} from './lib/identity/schemas/AccessIntegrityRequest.schema.js';

export {
  IdentityAuthorityAuditSchema,
  IdentityAuthorityResultSchema
} from './lib/identity/schemas/IdentityAuthorityAudit.schema.js';

export type {
  IIdentityAuthorityAuditParameters,
  IIdentityAuthorityResult
} from './lib/identity/schemas/IdentityAuthorityAudit.schema.js';

export {
  IdentitySecurityStandardsSchema
} from './lib/identity/schemas/IdentitySecurityStandards.schema.js';

export type {
  IIdentitySecurityStandards
} from './lib/identity/schemas/IdentitySecurityStandards.schema.js';

export {
  IdentitySeniorityResultSchema
} from './lib/identity/schemas/IdentitySeniority.schema.js';

export type {
  IIdentitySeniorityResult
} from './lib/identity/schemas/IdentitySeniority.schema.js';

export {
  ValidateAdministrativeAuthoritySchema
} from './lib/identity/schemas/ValidateAdministrativeAuthority.schema.js';

export type {
  IValidateAdministrativeAuthorityParameters
} from './lib/identity/schemas/ValidateAdministrativeAuthority.schema.js';

/**
 * @domain 2. FINANCIAL & MUNICIPAL DATA (Fiscal Auditing)
 */
export * from './lib/financial/PublicExpenditure.schema.js';

/**
 * @prompt_ia: "Este Barrel es el cimiento del Grafo. Asegura que cualquier nueva
 * exportación incluya la extensión .js para cumplir con el estándar ESM nativo
 * y evitar el colapso del motor de resolución en Next.js 16."
 */
