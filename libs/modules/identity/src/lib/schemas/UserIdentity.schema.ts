/**
 * @section Identity DNA - Global Verified Identity Schema
 * @description Define el contrato mestre para la identidad ciudadana e institucional.
 * Orquesta la convergencia entre autenticación social, transparencia y privacidad.
 * Actúa como la Única Fuente de Verdad (SSOT) para el enjambre de datos.
 *
 * Protocolo OEDP-V17.0 - High Performance & ISO Technical Naming.
 * SANEADO Zenith: Inyección de vectores anti-bot y rastro de mutación forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { UserAccessRoleSchema } from './UserAccessRole.schema';

/**
 * @section ADN Criptográfico - Tipificación Nominal (Branding)
 * @description Garantiza que un identificador de usuario no sea confundido con
 * otros UUIDs del sistema (News, Organizations, etc) en el Grafo de Tipos.
 */
export const UserIdentifierSchema = z.string()
  .uuid()
  .brand<'UserIdentifier'>();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type UserIdentifier = z.infer<typeof UserIdentifierSchema>;

/**
 * @section Catálogo de Proveedores de Identidad
 * Entidades externas autorizadas para la federación de soberanía.
 */
export const SocialIdentityProviderSchema = z.enum([
  'GOOGLE_IDENTITY',
  'APPLE_ID',
  'INSTAGRAM_GRAPH',
  'FACEBOOK_CONNECT',
  'X_CORP_API',
  'INTERNAL_INFRASTRUCTURE'
]).describe('Identificador técnico del proveedor de autenticación federada.');

/** 🛡️ SANEADO Zenith: Exportación nominal para tipado de mappers externos. */
export type SocialIdentityProvider = z.infer<typeof SocialIdentityProviderSchema>;

/**
 * @name UserIdentitySchema
 * @description Contrato soberano de identidad. Define el perfil completo del ciudadano
 * con soporte para auditoría bayesiana y telemetría de comportamiento.
 */
export const UserIdentitySchema = z.object({

  /** Identificador único e inalterable en el enjambre de datos. */
  identityIdentifier: UserIdentifierSchema,

  /** Nombre completo capturado del registro civil o proveedor social. */
  fullLegalNameLiteral: z.string()
    .min(3)
    .transform((value) => value.trim())
    .describe('Nombre legal completo para procesos de transparencia y auditoría institucional.'),

  /**
   * Nombre Público Anonimizado (Regra ISO: NOME + INICIAL).
   * Ejemplo: "ANALUIZA S."
   */
  anonymizedPublicNameLiteral: z.string()
    .describe('Representación visual segura para proteger la privacidad del ciudadano en el portal.'),

  /** Dirección de contacto principal validada. */
  electronicMailAddressLiteral: z.string()
    .email()
    .transform((value) => value.toLowerCase().trim())
    .describe('Dirección de correo electrónico vinculada a la cuenta soberana.'),

  /** Dirección URL física del avatar institucional. */
  avatarImageUniformResourceLocator: z.string()
    .url()
    .nullable()
    .describe('Dirección física del recurso visual de identidad (S3/Cloudinary).'),

  /** Identificador del proveedor de autenticación utilizado. */
  socialProviderIdentifier: SocialIdentityProviderSchema
    .default('INTERNAL_INFRASTRUCTURE'),

  /**
   * NÍVEL DE AUTORIDAD PONDERADA (Bayesian Trust Score).
   * Determina el peso del voto del ciudadano en los algoritmos de impacto social.
   */
  identityTrustWeightScoreNumeric: z.number()
    .min(0)
    .max(1)
    .default(0.1)
    .describe('Coeficiente algorítmico de credibilidad basado en comportamiento ético histórico.'),

  /**
   * 🛡️ PROACTIVO Zenith: Probabilidad de Humanidad.
   * Vector utilizado por el Neural Sentinel para mitigar ataques de orquestación de bots.
   */
  humanProbabilityConfidenceScoreNumeric: z.number()
    .min(0)
    .max(1)
    .default(0.5)
    .describe('Nivel de certeza de que la identidad corresponde a un ser humano real.'),

  /** Papel de autoridad institucional (RBAC). */
  assignedAuthorityRoleLiteral: UserAccessRoleSchema
    .default('CITIZEN_REGISTERED'),

  /** Estado de la auditoría documental humana (Selo de Verificação). */
  isIdentityLegallyVerifiedBoolean: z.boolean()
    .default(false)
    .describe('Indica si el perfil ha superado la validación manual de documentos de la ONG.'),

  /** Registro inalterable de creación en la infraestructura soberana. */
  occurrenceTimestampISO: z.string()
    .datetime()
    .describe('Marca temporal de activación de la identidad en el Ledger.'),

  /** 🛡️ SANEADO Zenith: Registro de última modificación para auditoría de integridad. */
  lastIdentityMutationTimestampISO: z.string()
    .datetime()
    .describe('Marca temporal de la última actualización de rol o peso de autoridad.'),

}).readonly();

/** 🛡️ ADN Tipado para el Enjambre de Identidad */
export type IUserIdentity = z.infer<typeof UserIdentitySchema>;
