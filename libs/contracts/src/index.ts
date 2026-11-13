/**
 * @section Global Infrastructure - Enterprise Contracts Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para el ADN estructural del ecosistema.
 * Centraliza exclusivamente la re-exportación declarativa de esquemas Zod, catálogos
 * inmutables y tipos nominales para Identidad, Datos Fiscales e Internacionalización BCP 47.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * ============================================================================
 * @domain 1. MANAGEMENT & IDENTITY (Multi-tenant Governance)
 * ============================================================================
 */
export {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  IdentityAccessRoleSchema,
  USER_ACCESS_ROLES_COLLECTION,
  UserAccessRoleSchema,
} from './lib/identity/UserAccessRole.schema';

export type { TIdentityAccessRole, UserAccessRole } from './lib/identity/UserAccessRole.schema';

export {
  IdentityProfileSchema,
  IdentityProfileSchema as UserIdentitySchema,
  IdentityTrustLevelEnum,
} from './lib/identity/schemas/IdentityProfile.schema';

export type {
  IIdentityProfile,
  IIdentityProfile as IUserIdentity,
  TIdentityTrustLevel,
} from './lib/identity/schemas/IdentityProfile.schema';

export {
  DeviceFingerprintIdentifierSchema,
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
} from './lib/identity/schemas/IdentityIdentifiers.schema';

export type {
  TDeviceFingerprintIdentifier,
  TIdentityIdentifier,
  TOrganizationIdentifier,
  TTerritorialTechnicalIdentifier,
} from './lib/identity/schemas/IdentityIdentifiers.schema';

export {
  CitizenCpfSchema,
  EnterpriseCnpjSchema,
} from './lib/identity/schemas/IdentityDocument.schema';

export type { TCitizenCpf, TEnterpriseCnpj } from './lib/identity/schemas/IdentityDocument.schema';

export { AnonymizeIdentityNameSchema } from './lib/identity/schemas/AnonymizeIdentityName.schema';
export type { IAnonymizeIdentityNameParameters } from './lib/identity/schemas/AnonymizeIdentityName.schema';

export { AccessIntegrityRequestSchema } from './lib/identity/schemas/AccessIntegrityRequest.schema';
export type { IAccessIntegrityRequest } from './lib/identity/schemas/AccessIntegrityRequest.schema';

export {
  EvaluateIdentityAuthoritySchema,
  SocialIdentityProviderSchema,
  SynchronizeIdentityAuthoritySchema,
} from './lib/identity/schemas/IdentityOperations.schema';

export type {
  IEvaluateIdentityAuthorityParameters,
  ISynchronizeIdentityAuthorityParameters,
  SocialIdentityProvider,
} from './lib/identity/schemas/IdentityOperations.schema';

export {
  IdentityAuthorityAuditSchema,
  IdentityAuthorityResultSchema,
} from './lib/identity/schemas/IdentityAuthorityAudit.schema';

export type {
  IIdentityAuthorityAuditParameters,
  IIdentityAuthorityResult,
} from './lib/identity/schemas/IdentityAuthorityAudit.schema';

export { IdentitySecurityStandardsSchema } from './lib/identity/schemas/IdentitySecurityStandards.schema';
export type { IIdentitySecurityStandards } from './lib/identity/schemas/IdentitySecurityStandards.schema';

export { IdentitySeniorityResultSchema } from './lib/identity/schemas/IdentitySeniority.schema';
export type { IIdentitySeniorityResult } from './lib/identity/schemas/IdentitySeniority.schema';

export { ValidateAdministrativeAuthoritySchema } from './lib/identity/schemas/ValidateAdministrativeAuthority.schema';
export type { IValidateAdministrativeAuthorityParameters } from './lib/identity/schemas/ValidateAdministrativeAuthority.schema';

export { IdentityPhysicalRecordSchema } from './lib/identity/schemas/IdentityPhysicalRecord.schema';
export type { IIdentityPhysicalRecord } from './lib/identity/schemas/IdentityPhysicalRecord.schema';

export { IdentityLinguisticDictionarySchema } from './lib/identity/i18n/IdentityLinguistic.schema';
export type { IIdentityLinguisticDictionary } from './lib/identity/i18n/IdentityLinguistic.schema';

/**
 * ============================================================================
 * @domain 2. FINANCIAL & MUNICIPAL DATA (Fiscal Auditing SSOT)
 * ============================================================================
 */
export {
  ExpenditureAuditMetadataSchema,
  FunctionalCategorySchema,
  ProviderMetadataSchema,
  ProviderTaxIdentifierSchema,
  PublicExpenditureIdentifierSchema,
  PublicExpenditureSchema,
} from './lib/financial/PublicExpenditure.schema';

export type {
  IPublicExpenditure,
  TProviderTaxIdentifier,
  TPublicExpenditureIdentifier,
} from './lib/financial/PublicExpenditure.schema';

/**
 * ============================================================================
 * @domain 3. INTERNATIONALIZATION (BCP 47 Locales SSOT - ADR 0030)
 * ============================================================================
 */
export {
  ACTIVE_LOCALES_ENTRIES_COLLECTION,
  CATALOGED_LOCALE_CODES_COLLECTION,
  CatalogedLocaleSchema,
  DEFAULT_LOCALE_IDENTIFIER,
  LocaleRegistryEntrySchema,
  LocaleTextDirectionSchema,
  LocalesRegistryCollectionSchema,
  SUPPORTED_LOCALES_REGISTRY,
  SUPPORTED_LOCALE_CODES_COLLECTION,
  SupportedLocaleSchema,
} from './lib/internationalization/SupportedLocales.schema';

export type {
  ICatalogedLocale,
  ILocaleRegistryEntry,
  ISupportedLocale,
  TActiveLocaleCodeLiteral,
  TCatalogedLocale,
  TCatalogedLocaleCodeLiteral,
  TLocaleTextDirection,
  TSupportedLocale,
} from './lib/internationalization/SupportedLocales.schema';
