/**
 * @section User Management & Identity - Identity Integrity Contracts
 * @description Única Fuente de Verdad (SSOT) para el Perfil de Identidad Multidimensional.
 * Orquesta la Identidad Civil (CPF/CNPJ), Niveles de Confianza (gov.br),
 * Puntos de Contacto validados (LGPD) y Residencia Territorial (IBGE Sync).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 * SANEADO Turbopack: Erradicación de extensiones '.js' y cumplimiento estricto de max-lines (< 150).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Identificadores Nominales Branded (Clean Paths) */
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
} from './IdentityIdentifiers.schema';

/* 2. Jerarquía de Autoridad y Roles (Clean Paths) */
import { IdentityAccessRoleSchema } from '../IdentityAccessRole.schema';

/**
 * @name IdentityTrustLevelEnum
 * @description Niveles de confiabilidad técnica inspirados en el estándar gov.br (Bronze, Prata, Ouro).
 */
export const IdentityTrustLevelEnum = z
  .enum([
    'ANONYMOUS', // Identidad no validada (Rastro de hardware/fingerprint)
    'BRONZE', // Identidad declarativa (Email/Redes Sociales)
    'SILVER', // Identidad verificada (Bancos acreditados/CNH)
    'GOLD', // Identidad comprobada (Biometría TSE/Certificado Digital e-CPF)
  ])
  .describe('Nivel de certidumbre institucional de la identidad.');

export type TIdentityTrustLevel = z.infer<typeof IdentityTrustLevelEnum>;

/**
 * @name ContactPointMetadataSchema
 * @description Canales de comunicación validados bajo cumplimiento estricto de la LGPD.
 */
export const ContactPointMetadataSchema = z
  .object({
    primaryEmailAddressLiteral: z
      .string()
      .email({ message: 'FORMATO_CORREO_ELECTRONICO_INVALIDO' })
      .transform((emailAddressInputLiteral: string) =>
        emailAddressInputLiteral.toLowerCase().trim(),
      ),

    hasVerifiedEmailBoolean: z.boolean().default(false),

    mobilePhoneFormattedLiteral: z
      .string()
      .optional()
      .describe('Número telefónico en formato internacional E.164.'),

    whatsappIdentificationLiteral: z
      .string()
      .optional()
      .describe('Identificador de cuenta vinculado a la mensajería institucional.'),

    hasGivenPrivacyConsentBoolean: z
      .boolean()
      .describe('Consentimiento explícito para el tratamiento de datos y contacto.'),
  })
  .readonly();

export type IContactPointMetadata = z.infer<typeof ContactPointMetadataSchema>;

/**
 * @name TerritorialAddressSnapshotSchema
 * @description Vínculo geográfico institucional sin dependencias propietarias (IBGE Open Data).
 */
export const TerritorialAddressSnapshotSchema = z
  .object({
    postalCodeLiteral: z
      .string()
      .length(8, { message: 'EL_CEP_DEBE_CONTENER_EXACTAMENTE_8_DIGITOS' })
      .describe('CEP brasileño purificado (solo 8 dígitos numéricos).'),

    stateIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
    municipalityIbgeIdentifier: TerritorialTechnicalIdentifierSchema,
    neighborhoodIbgeIdentifier: TerritorialTechnicalIdentifierSchema,

    streetNameLiteral: z
      .string()
      .min(1, { message: 'EL_NOMBRE_DE_LA_VIA_ES_OBLIGATORIO' })
      .transform((streetNameInputLiteral: string) => streetNameInputLiteral.toUpperCase().trim()),

    addressNumberLiteral: z
      .string()
      .min(1, { message: 'EL_NUMERO_PREDIAL_ES_OBLIGATORIO' })
      .transform((addressNumberInputLiteral: string) => addressNumberInputLiteral.trim()),

    addressComplementLiteral: z.string().optional(),
  })
  .readonly();

export type ITerritorialAddressSnapshot = z.infer<typeof TerritorialAddressSnapshotSchema>;

/**
 * @name IdentityProfileSchema
 * @description Contrato maestro de identidad. Ensambla el perfil civil, contacto y territorio.
 */
export const IdentityProfileSchema = z
  .object({
    identityIdentifier: IdentityIdentifierSchema,
    organizationIdentifier: OrganizationIdentifierSchema,
    trustLevelLiteral: IdentityTrustLevelEnum.default('ANONYMOUS'),

    civilIdentificationDocumentLiteral: z
      .string()
      .regex(/^\d{11,14}$/, {
        message: 'EL_DOCUMENTO_FISCAL_DEBE_CONTENER_ENTRE_11_Y_14_DIGITOS',
      })
      .optional()
      .describe('Documento nacional (CPF/CNPJ) purificado para auditoría forense.'),

    anonymizedPublicNameLiteral: z
      .string()
      .min(3, { message: 'EL_NOMBRE_PUBLICO_DEBE_CONTENER_AL_MENOS_3_CARACTERES' }),

    fullLegalNameLiteral: z
      .string()
      .min(3, { message: 'EL_NOMBRE_LEGAL_DEBE_CONTENER_AL_MENOS_3_CARACTERES' })
      .transform((legalNameInputLiteral: string) => legalNameInputLiteral.toUpperCase().trim())
      .optional(),

    contactPointMetadata: ContactPointMetadataSchema,
    territorialAddressSnapshot: TerritorialAddressSnapshotSchema.optional(),

    identityTrustWeightScoreNumeric: z
      .number()
      .min(0.1, { message: 'EL_PESO_MINIMO_DE_CONFIANZA_ES_0.1' })
      .max(1.0, { message: 'EL_PESO_MAXIMO_DE_CONFIANZA_ES_1.0' })
      .default(0.1),

    assignedAuthorityRoleLiteral: IdentityAccessRoleSchema.default('IDENTITY_REGISTERED'),

    lastIdentityMutationTimestampISO: z
      .string()
      .datetime({ message: 'FORMATO_DE_TIMESTAMP_DE_MUTACION_INVALIDO' }),

    accountActivationTimestampISO: z
      .string()
      .datetime({ message: 'FORMATO_DE_TIMESTAMP_DE_ACTIVACION_INVALIDO' }),
  })
  .readonly();

export type IIdentityProfile = z.infer<typeof IdentityProfileSchema>;
