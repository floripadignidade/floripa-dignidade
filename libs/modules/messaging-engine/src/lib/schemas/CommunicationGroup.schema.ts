/**
 * @section Messaging DNA - Communication Group Schema
 * @description Contrato soberano para la gestión de Grupos de Comunicación (Action Hubs).
 * Define la estructura de gobernanza, visibilidad e integridad territorial.
 *
 * Protocolo OEDP-V17.0 - High Performance & Data Sovereignty.
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Tipado Nominal (Branding)
 * 🛡️ Blindaje contra confusión de identificadores en el Data Lake.
 */
export const GroupIdentifierSchema = z.string().uuid().brand<'CommunicationGroupIdentifier'>();
export type TGroupIdentifier = z.infer<typeof GroupIdentifierSchema>;

/**
 * Modelos de Gobernanza de Grupo.
 */
export const GroupGovernanceModelSchema = z
  .enum([
    'BROADCAST_ONLY', // Solo autoridades emiten.
    'MODERATED_DIALOGUE', // Participación ciudadana con filtro.
    'OPEN_COLLABORATION', // Interacción fluida entre ciudadanos verificados.
  ])
  .describe('Modelo de interacción y permisos de despacho del hub.');

/**
 * Niveles de Visibilidad Soberana.
 */
export const GroupVisibilityModeSchema = z
  .enum([
    'PUBLIC_TRANSPARENCY', // Indexable universalmente.
    'VERIFIED_ONLY', // Solo identidades validadas.
    'INSTITUTIONAL_PRIVATE', // Operación técnica interna.
  ])
  .describe('Nivel de exposición en el buscador universal.');

/**
 * Metadatos de Participación e Impacto.
 * ⚡ ATOMIZADO: Permite el triaje estadístico por el Neural Sentinel.
 */
export const GroupParticipationMetadataSchema = z
  .object({
    totalMemberQuantity: z.number().int().nonnegative().default(0),
    isOfficialVerifiedBoolean: z.boolean().default(false),
    lastActivityTimestampISO: z.string().datetime().optional(),
  })
  .default({});

/**
 * @name CommunicationGroupSchema
 * @description Aduana de ADN para la creación y gestión de círculos de comunicación.
 */
export const CommunicationGroupSchema = z
  .object({
    /** Identificador único inalterable. */
    groupIdentifier: GroupIdentifierSchema,

    /** Nombre oficial (Ej: "Comité de Ética - Bairro Tapera"). */
    officialDisplayNameLiteral: z
      .string()
      .min(3, 'NOMBRE_DEMASIADO_CORTO')
      .max(120, 'NOMBRE_DEMASIADO_LARGO'),

    /** Identificador de Red (Slug) ISO Standard. */
    technicalSlugLiteral: z
      .string()
      .regex(/^[a-z0-9-]+$/, 'FORMATO_SLUG_INVALIDO')
      .describe('Identificador único para URLs y ruteo técnico.'),

    groupDescriptionLiteral: z.string().max(500, 'DESCRIPCION_DEMASIADO_LARGA'),

    /** Referencia a la Organización propietaria (CMS Link). */
    organizationalOwnerIdentifier: z
      .string()
      .uuid()
      .describe('Entidad responsable de la moderación.'),

    /** Vínculo Territorial (Integración con territorial-engine). */
    territorialFocusIdentifier: z
      .string()
      .optional()
      .describe('ID de localidad oficial (Barrio/Distrito).'),

    governanceModelLiteral: GroupGovernanceModelSchema.default('MODERATED_DIALOGUE'),

    visibilityModeLiteral: GroupVisibilityModeSchema.default('VERIFIED_ONLY'),

    /** Estado Operativo (Soft Delete Protocol). */
    operationalStatusLiteral: z.enum(['ACTIVE', 'SUSPENDED', 'ARCHIVED']).default('ACTIVE'),

    participationMetadata: GroupParticipationMetadataSchema,

    /** Marca temporal de creación en la infraestructura. */
    occurrenceTimestampISO: z.string().datetime(),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Exportaciones nominales para erradicar errores de resolución de tipos.
 */
export type ICommunicationGroup = z.infer<typeof CommunicationGroupSchema>;
export type TGroupGovernanceModel = z.infer<typeof GroupGovernanceModelSchema>;
export type TGroupVisibilityMode = z.infer<typeof GroupVisibilityModeSchema>;
