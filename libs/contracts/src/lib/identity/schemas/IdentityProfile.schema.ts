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

/**
 * 🛡️ RESOLUCIÓN SOURCE-FIRST (Ley OEDP-V18.1):
 * Uso de extensiones .js y rutas relativas para compatibilidad ESM nativa.
 */
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema
} from './IdentityIdentifiers.schema.js';

/**
 * 🛡️ SANEADO Zenith (Fix TS2305):
 * Sincronización nominal con el esquema de autoridad nivelado.
 */
import { IdentityAccessRoleSchema } from '../IdentityAccessRole.schema.js';

/**
 * @name IdentityTrustLevelEnum
 * @description Niveles de confiabilidad técnica inspirados en el estándar gov.br.
 */
export const IdentityTrustLevelEnum = z.enum([
  'ANONYMOUS', // Identidad no validada (Rastro de hardware/fingerprint)
  'BRONZE',    // Identidad declarativa (Email/Redes Sociales)
  'SILVER',    // Identidad verificada (Bancos acreditados/CNH)
  'GOLD'       // Identidad comprobada (Biometría TSE/Certificado Digital e-CPF)
]).describe('Nivel de certidumbre institucional de la identidad.');

export type TIdentityTrustLevel = z.infer<typeof IdentityTrustLevelEnum>;

/**
 * @name ContactPointMetadataSchema
 * @description ADN de canales de comunicación validados bajo cumplimiento LGPD.
 */
export const ContactPointMetadataSchema = z.object({
  primaryEmailAddressLiteral: z.string()
    .email()
    .transform((valueLiteral: string) => valueLiteral.toLowerCase().trim()),

  hasVerifiedEmailBoolean: z.boolean().default(false),

  mobilePhoneFormattedLiteral: z.string().optional()
    .describe('Número telefónico en formato internacional E.164.'),

  whatsappIdentificationLiteral: z.string().optional()
    .describe('Identificador de cuenta vinculado a la mensajería institucional.'),

  hasGivenPrivacyConsentBoolean: z.boolean()
    .describe('Consentimiento explícito para el tratamiento de datos y contacto.'),
}).readonly();

/**
 * @name TerritorialAddressSnapshotSchema
 * @description Vínculo geográfico soberano sin dependencia de proveedores de pago (Maps).
 * Sincronizado con los identificadores técnicos del motor IBGE.
 */
export const TerritorialAddressSnapshotSchema = z.object({
  postalCodeLiteral: z.string().length(8)
    .describe('CEP brasileño purificado (solo 8 dígitos numéricos).'),

  /** 🛡️ SOBERANÍA TERRITORIAL: Identificadores técnicos inalterables del IBGE */
  stateIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
  municipalityIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
  neighborhoodIbgeIdentifier: TerritorialTechnicalIdentifierSchema,

  streetNameLiteral: z.string()
    .min(1)
    .transform((valueLiteral: string) => valueLiteral.toUpperCase().trim()),

  addressNumberLiteral: z.string().min(1),
  addressComplementLiteral: z.string().optional(),
}).readonly();

/**
 * @name IdentityProfileSchema
 * @description Contrato maestro de identidad. Ensambla el rastro civil, contacto y territorio.
 *
 * @prompt_ia: "Asegura que el 'organizationIdentifier' sea validado en cada orquestador
 * de lógica para garantizar el aislamiento físico de datos entre diferentes Tenants (Instituciones)."
 */
export const IdentityProfileSchema = z.object({
  /** Identificador único nominal (UUID v4 Branded). */
  identityIdentifier: IdentityIdentifierSchema,

  /** Jurisdicción Multi-tenant mandatoria para la segregación de datos. */
  organizationIdentifier: OrganizationIdentifierSchema,

  /** Grado de confianza institucional (Estándar gov.br). */
  trustLevelLiteral: IdentityTrustLevelEnum.default('ANONYMOUS'),

  /** Identificación Civil (CPF/CNPJ) - Solo presente en Niveles SILVER/GOLD. */
  civilIdentificationDocumentLiteral: z.string()
    .regex(/^\d{11,14}$/)
    .optional()
    .describe('Documento nacional (CPF/CNPJ) purificado para auditoría forense.'),

  /** Firma pública para visualización segura (ej: ANA S.). */
  anonymizedPublicNameLiteral: z.string().min(3),

  /** Nombre legal íntegro (Protegido por políticas de jerarquía administrativa). */
  fullLegalNameLiteral: z.string()
    .min(3)
    .transform((valueLiteral: string) => valueLiteral.toUpperCase().trim())
    .optional(),

  /** Puntos de contacto validados. */
  contactPointMetadata: ContactPointMetadataSchema,

  /** Ubicación física auditada mediante el Grafo IBGE. */
  territorialAddressSnapshot: TerritorialAddressSnapshotSchema.optional(),

  /** Coeficiente de reputación bayesiana (0.1 a 1.0). */
  identityTrustWeightScoreNumeric: z.number().min(0.1).max(1).default(0.1),

  /** Rol en la jerarquía institucional (RBAC). */
  assignedAuthorityRoleLiteral: IdentityAccessRoleSchema.default('IDENTITY_REGISTERED'),

  /** Trazabilidad de Auditoría. */
  lastIdentityMutationTimestampISO: z.string().datetime(),
  accountActivationTimestampISO: z.string().datetime(),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IIdentityProfile = z.infer<typeof IdentityProfileSchema>;
