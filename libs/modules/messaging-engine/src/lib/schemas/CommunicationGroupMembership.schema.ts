/**
 * @section Messaging DNA - Democratic Membership Schema
 * @description Define el contrato de vinculación entre ciudadanos y Action Hubs.
 * Soporta estados complejos de moderación, delegación de voto (Mandatarios)
 * y rastro de antigüedad institucional.
 *
 * Protocolo OEDP-V16.0 - Sovereign Governance & Liquid Democracy.
 * Vision: Meritorious Moderation & Secure Vote Delegation.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Estados Ontológicos de Membresía.
 * PAUSED: El usuario no recibe notificaciones pero conserva su lugar.
 * BANNED: Bloqueo por auditoría ética del Neural Sentinel.
 * REPRESENTED: El usuario ha delegado su autoridad de voto a un mandatario.
 */
export const MembershipStatusSchema = z
  .enum(['ACTIVE', 'PAUSED', 'LEFT_INACTIVE', 'BANNED_BY_MODERATION', 'REPRESENTED'])
  .describe('Estado actual de la identidad dentro del grupo.');

/**
 * Niveles de Responsabilidad (Moderación).
 * Basado en el principio de antigüedad y reputación (No privilegios, sino preferencias).
 */
export const ModerationRoleSchema = z
  .enum([
    'STANDARD_MEMBER',
    'COMMUNITY_MODERATOR',
    'SENIOR_AUDITOR', // Miembro con antigüedad + Reputación > 0.9
    'FOUNDING_TRUSTEE',
  ])
  .describe('Nivel de responsabilidad operativa asignado.');

/**
 * @name CommunicationGroupMembershipSchema
 * @description ADN de la relación Ciudadano-Grupo.
 */
export const CommunicationGroupMembershipSchema = z
  .object({
    /** Identificador único de la membresía. */
    membershipIdentifier: z.string().uuid(),

    groupIdentifier: z.string().uuid(),

    citizenIdentifier: z.string().uuid(),

    currentStatusLiteral: MembershipStatusSchema.default('ACTIVE'),

    responsibilityRoleLiteral: ModerationRoleSchema.default('STANDARD_MEMBER'),

    /**
     * @section Soberanía Delegada (The Mandatary)
     * UUID de otro ciudadano que ejercerá la representación en votaciones.
     */
    delegatedMandataryIdentifier: z
      .string()
      .uuid()
      .nullable()
      .optional()
      .describe('ID del ciudadano que posee el poder de voto delegado.'),

    /**
     * Banderas de Preferencia.
     */
    isFavoritedByActorBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si el usuario ha marcado este grupo como prioritario.'),

    /**
     * Trazabilidad de Antigüedad.
     * Factor crítico para el cálculo de pesos en el Impact Analytics Engine.
     */
    joinedAtTimestampISO: z.string().datetime(),

    lastActivityTimestampISO: z.string().datetime(),
  })
  .readonly();

export type ICommunicationGroupMembership = z.infer<typeof CommunicationGroupMembershipSchema>;
export type TMembershipStatus = z.infer<typeof MembershipStatusSchema>;
