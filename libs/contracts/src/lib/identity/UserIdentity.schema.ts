/**
 * @section Enterprise Contracts - Multidimensional Citizen Identity SSOT
 * @description Única Fuente de Verdad (SSOT) para el Perfil de Identidad Multidimensional.
 * Orquesta la estructura de datos para la Identidad Civil (CPF/CNPJ), Niveles de Confianza
 * institucional (estándar gov.br), Canales de Contacto validados (LGPD) y Domicilio
 * Territorial indexado a la base de datos geográfica abierta del IBGE.
 *
 * Implementa la estrategia de exportación simétrica:
 * 1. Nomenclatura Canónica: UserIdentitySchema / IUserIdentity.
 * 2. Alias Institucional: IdentityProfileSchema / IIdentityProfile.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) y LGPD (Lei 13.709/2018).
 * SANEADO Zenith: Erradicación del error TS2307 corrigiendo la ruta relativa de UserAccessRoleSchema,
 * purga de parámetros abreviados en transformadores y sellado de inmutabilidad estructural.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Identificadores Nominales Branded (Resolución Source-First Relativa) */
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
  TerritorialTechnicalIdentifierSchema,
} from './schemas/IdentityIdentifiers.schema.js';

/* 2. Catálogo de Autoridad y Jerarquía Institucional (Ruta Corregida) */
import { UserAccessRoleSchema } from './UserAccessRole.schema.js';

/**
 * @name IdentityTrustLevelEnum
 * @description Niveles de confiabilidad técnica inspirados en el estándar gov.br (Bronze, Prata, Ouro).
 * Define la certeza probabilística sobre la identidad civil antes de calcular pesos de voto o auditoría.
 */
export const IdentityTrustLevelEnum = z
  .enum([
    'ANONYMOUS', // Visitante con huella digital de hardware (Capacidades de sólo lectura o emisión de ruido).
    'BRONZE',    // Identidad declarativa validada mediante correo electrónico o autenticación federada básica.
    'SILVER',    // Identidad verificada documentalmente o mediante integración con banca acreditada / CNH.
    'GOLD',      // Identidad plenamente comprobada mediante biometría oficial (TSE) o Certificado Digital e-CPF.
  ])
  .describe('Nivel de certidumbre institucional de la identidad ciudadana.');

export type TIdentityTrustLevel = z.infer<typeof IdentityTrustLevelEnum>;

/**
 * @name ContactPointMetadataSchema
 * @description Contrato inmutable para canales de comunicación validados bajo cumplimiento de la LGPD.
 */
export const ContactPointMetadataSchema = z
  .object({
    /** Dirección electrónica principal normalizada en minúsculas y sin espacios. */
    primaryEmailAddressLiteral: z
      .string()
      .email({ message: 'FORMATO_CORREO_ELECTRONICO_INVALIDO' })
      .transform((emailAddressInputLiteral: string) =>
        emailAddressInputLiteral.toLowerCase().trim(),
      ),

    /** Indica si el canal de correo ha superado el desafío de verificación Double Opt-In. */
    hasVerifiedEmailBoolean: z.boolean().default(false),

    /** Número telefónico celular en formato internacional estándar E.164 (opcional). */
    mobilePhoneFormattedLiteral: z
      .string()
      .optional()
      .describe('Número de telefonía móvil en formato internacional E.164.'),

    /** Identificador de cuenta de mensajería vinculado al servicio de WhatsApp institucional. */
    whatsappIdentificationLiteral: z
      .string()
      .optional()
      .describe('Identificador de cuenta o número vinculado a la mensajería institucional.'),

    /** Consentimiento explícito e inequívoco para el tratamiento de datos y contacto según la LGPD. */
    hasGivenPrivacyConsentBoolean: z
      .boolean()
      .describe('Consentimiento explícito para contacto y tratamiento bajo ley LGPD.'),
  })
  .readonly();

export type IContactPointMetadata = z.infer<typeof ContactPointMetadataSchema>;

/**
 * @name TerritorialAddressSnapshotSchema
 * @description Vínculo físico con el territorio sin dependencia de proveedores propietarios de cartografía.
 * Sincronizado unívocamente con la malla censal y códigos técnicos de localidades del IBGE.
 */
export const TerritorialAddressSnapshotSchema = z
  .object({
    /** Código de direccionamiento postal brasileño (CEP) purificado (estrictamente 8 dígitos numéricos). */
    postalCodeLiteral: z
      .string()
      .length(8, { message: 'EL_CEP_DEBE_CONTENER_EXACTAMENTE_8_DIGITOS' })
      .regex(/^\d+$/, { message: 'EL_CEP_DEBE_SER_ESTRICTAMENTE_NUMERICO' })
      .describe('Código postal brasileño (CEP) sin puntuación.'),

    /** 🛡️ INTEGRIDAD TERRITORIAL IBGE: Identificadores técnicos inalterables */
    stateIbgeIdentifier: TerritorialTechnicalIdentifierSchema.describe(
      'Identificador oficial del Estado (UF) según el IBGE.',
    ),
    municipalityIbgeIdentifier: TerritorialTechnicalIdentifierSchema.describe(
      'Identificador oficial del Municipio según el IBGE.',
    ),
    neighborhoodIbgeIdentifier: TerritorialTechnicalIdentifierSchema.describe(
      'Identificador oficial del Distrito o Barrio según el IBGE.',
    ),

    /** Nombre de la vía pública saneado en mayúsculas. */
    streetNameLiteral: z
      .string()
      .min(1, { message: 'EL_NOMBRE_DE_LA_VIA_ES_OBLIGATORIO' })
      .transform((streetNameInputLiteral: string) =>
        streetNameInputLiteral.toUpperCase().trim(),
      ),

    /** Número de numeración predial o designación catastral. */
    addressNumberLiteral: z
      .string()
      .min(1, { message: 'EL_NUMERO_PREDIAL_ES_OBLIGATORIO' })
      .transform((addressNumberInputLiteral: string) =>
        addressNumberInputLiteral.trim(),
      ),

    /** Complemento de dirección (apartamento, bloque, punto de referencia). */
    addressComplementLiteral: z.string().optional(),
  })
  .readonly();

export type ITerritorialAddressSnapshot = z.infer<
  typeof TerritorialAddressSnapshotSchema
>;

/**
 * @name UserIdentitySchema
 * @description Contrato maestro de identidad ciudadana. Ensambla la identidad civil,
 * credenciales de acceso institucional, nivel de confianza bayesiana y jurisdicción territorial.
 *
 * Regla de Oro: El 'organizationIdentifier' debe ser validado perimetralmente en el middleware
 * para asegurar que las identidades no ejecuten mutaciones cruzadas entre distintas organizaciones
 * o municipios asociados (Aislamiento Multi-tenant).
 */
export const UserIdentitySchema = z
  .object({
    /** Identificador nominal único e inalterable del ciudadano (UUID v4 Branded). */
    identityIdentifier: IdentityIdentifierSchema,

    /** Jurisdicción institucional obligatoria para la segregación física de datos (Multi-tenancy). */
    organizationIdentifier: OrganizationIdentifierSchema,

    /** Grado de confianza técnica institucional según la taxonomía oficial. */
    trustLevelLiteral: IdentityTrustLevelEnum.default('ANONYMOUS'),

    /**
     * Documento de Registro Civil Nacional (CPF para personas físicas o CNPJ para colectivos).
     * Requerido exclusivamente en niveles de confianza SILVER o GOLD para auditoría pública.
     */
    civilIdentificationDocumentLiteral: z
      .string()
      .regex(/^\d{11,14}$/, {
        message: 'EL_DOCUMENTO_FISCAL_DEBE_CONTENER_ENTRE_11_Y_14_DIGITOS',
      })
      .optional()
      .describe('Documento nacional (CPF/CNPJ) purificado para auditoría fiscal y forense.'),

    /** Firma pública institucional anonimizada para exposición en la interfaz (ej: "MARIA S."). */
    anonymizedPublicNameLiteral: z
      .string()
      .min(3, { message: 'LA_FIRMA_PUBLICA_DEBE_CONTENER_AL_MENOS_3_CARACTERES' })
      .describe('Nombre público seguro para proteger la privacidad ciudadana (LGPD).'),

    /** Nombre civil completo oficial (Protegido por políticas de acceso estricto RBAC). */
    fullLegalNameLiteral: z
      .string()
      .min(3, { message: 'EL_NOMBRE_LEGAL_DEBE_CONTENER_AL_MENOS_3_CARACTERES' })
      .transform((legalNameInputLiteral: string) =>
        legalNameInputLiteral.toUpperCase().trim(),
      )
      .optional()
      .describe('Nombre legal íntegro protegido por políticas de privacidad.'),

    /** Puntos de contacto auditados y canales de notificación autorizados. */
    contactPointMetadata: ContactPointMetadataSchema,

    /** Residencia territorial auditada mediante el grafo geográfico del IBGE. */
    territorialAddressSnapshot: TerritorialAddressSnapshotSchema.optional(),

    /** Coeficiente bayesiano de reputación y peso de voto (Rango: 0.1 a 1.0). */
    identityTrustWeightScoreNumeric: z
      .number()
      .min(0.1, { message: 'EL_PESO_MINIMO_DE_CONFIANZA_ES_0.1' })
      .max(1.0, { message: 'EL_PESO_MAXIMO_DE_CONFIANZA_ES_1.0' })
      .default(0.1)
      .describe('Coeficiente bayesiano de autoridad para el termómetro de impacto.'),

    /** Rol asignado en la jerarquía de acceso institucional (RBAC). */
    assignedAuthorityRoleLiteral: UserAccessRoleSchema.default('IDENTITY_REGISTERED'),

    /** Marca temporal inmutable de la última mutación del registro de identidad. */
    lastIdentityMutationTimestampISO: z
      .string()
      .datetime({ message: 'FORMATO_DE_TIMESTAMP_DE_MUTACION_INVALIDO' })
      .describe('Timestamp ISO 8601 de la última alteración de estado.'),

    /** Marca temporal inmutable de la activación original de la cuenta ciudadana. */
    accountActivationTimestampISO: z
      .string()
      .datetime({ message: 'FORMATO_DE_TIMESTAMP_DE_ACTIVACION_INVALIDO' })
      .describe('Timestamp ISO 8601 del registro de la cuenta en el Ledger.'),
  })
  .readonly();

/**
 * @name IdentityProfileSchema
 * @description Alias institucional de compatibilidad histórica para UserIdentitySchema.
 */
export const IdentityProfileSchema = UserIdentitySchema;

/**
 * @section Representación de Tipos Estáticos (Source-First Typing)
 */
export type IUserIdentity = z.infer<typeof UserIdentitySchema>;
export type IIdentityProfile = IUserIdentity;