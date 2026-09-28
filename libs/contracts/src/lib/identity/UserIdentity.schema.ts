/**
 * @section User Management & Identity - Identity Integrity Contracts
 * @description Única Fuente de Verdad (SSOT) para el Perfil de Identidad Multidimensional.
 * Orquesta la Identidad Civil (CPF/CNPJ), Niveles de Confianza (gov.br),
 * Puntos de Contacto y Residencia Territorial (IBGE Sync).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010, ISO 11179 & LGPD Compliance.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/** 🛡️ RESOLUCIÓN SOURCE-FIRST: Imports con extensión .js y rutas relativas */
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema
} from './schemas/IdentityIdentifiers.schema.js';

import { UserAccessRoleSchema } from './schemas/UserAccessRole.schema.js';

/**
 * @name IdentityTrustLevelEnum
 * @description Niveles de confiabilidad técnica inspirados en el estándar gov.br.
 */
export const IdentityTrustLevelEnum = z.enum([
  'ANONYMOUS', // Visitante con DeviceFingerprint (Funciones limitadas)
  'BRONZE',    // Identidad declarativa (Email/Social)
  'SILVER',    // Identidad verificada (Internet Banking/CNH)
  'GOLD'       // Identidad comprobada (Biometría TSE/Certificado Digital)
]).describe('Nivel de certidumbre institucional de la identidad.');

export type TIdentityTrustLevel = z.infer<typeof IdentityTrustLevelEnum>;

/**
 * @name ContactPointMetadataSchema
 * @description ADN de canales de comunicación validados.
 */
export const ContactPointMetadataSchema = z.object({
  primaryEmailAddressLiteral: z.string().email().transform(v => v.toLowerCase().trim()),
  hasVerifiedEmailBoolean: z.boolean().default(false),

  mobilePhoneFormattedLiteral: z.string().optional()
    .describe('Formato internacional E.164.'),

  whatsappIdentificationLiteral: z.string().optional()
    .describe('ID de cuenta o número vinculado a la mensajería institucional.'),

  hasGivenPrivacyConsentBoolean: z.boolean()
    .describe('Consentimiento explícito para contacto bajo ley LGPD.'),
}).readonly();

/**
 * @name TerritorialAddressSnapshotSchema
 * @description Vínculo físico con el territorio sin dependencia de proveedores de pago (Maps).
 * Sincronizado con el motor territorial IBGE.
 */
export const TerritorialAddressSnapshotSchema = z.object({
  postalCodeLiteral: z.string().length(8).describe('CEP brasileño puro (solo números).'),

  /** 🛡️ SOBERANÍA IBGE: Identificadores técnicos inalterables */
  stateIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
  municipalityIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
  neighborhoodIbgeIdentifier: TerritorialTechnicalIdentifierSchema,

  streetNameLiteral: z.string().min(1).transform(v => v.toUpperCase()),
  addressNumberLiteral: z.string().min(1),
  addressComplementLiteral: z.string().optional(),
}).readonly();

/**
 * @name IdentityProfileSchema
 * @description Contrato maestro de identidad. Ensambla el rastro civil y el historial.
 *
 * @prompt_ia: "Verifica que 'organizationIdentifier' sea validado en el middleware
 * para garantizar que las identidades no puedan transitar entre diferentes Tenants
 * (Instituciones) a menos que posean rango de INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR."
 */
export const IdentityProfileSchema = z.object({
  /** Identificador único nominal. */
  identityIdentifier: IdentityIdentifierSchema,

  /** Jurisdicción Multi-tenant obligatoria. */
  organizationIdentifier: OrganizationIdentifierSchema,

  /** Nivel de confianza institucional (Estándar gov.br). */
  trustLevelLiteral: IdentityTrustLevelEnum.default('ANONYMOUS'),

  /** Identificación Civil (CPF/CNPJ) - Solo presente en Niveles SILVER/GOLD. */
  civilIdentificationDocumentLiteral: z.string()
    .regex(/^\d{11,14}$/)
    .optional()
    .describe('Documento nacional (CPF/CNPJ) purificado para auditoría.'),

  /** Nombre institucional/público anonimizado (ej: ANA S.). */
  anonymizedPublicNameLiteral: z.string().min(3),

  /** Nombre legal íntegro (Protegido por políticas de acceso). */
  fullLegalNameLiteral: z.string()
    .min(3)
    .transform((valueLiteral: string) => valueLiteral.toUpperCase().trim())
    .optional(),

  /** Puntos de contacto validados. */
  contactPointMetadata: ContactPointMetadataSchema,

  /** Residencia auditada mediante el Grafo IBGE. */
  territorialAddressSnapshot: TerritorialAddressSnapshotSchema.optional(),

  /** Coeficiente de reputación bayesiana (0.1 a 1.0). */
  identityTrustWeightScoreNumeric: z.number().min(0).max(1).default(0.1),

  /** Rol en la jerarquía de acceso institucional (RBAC). */
  assignedAuthorityRoleLiteral: UserAccessRoleSchema.default('IDENTITY_REGISTERED'),

  /** Trazabilidad de Auditoría. */
  lastIdentityMutationTimestampISO: z.string().datetime(),
  accountActivationTimestampISO: z.string().datetime(),

}).readonly();

export type IIdentityProfile = z.infer<typeof IdentityProfileSchema>;
