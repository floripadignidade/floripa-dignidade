/**
 * @section Shared State Store - Identity and Presence Schemas (Atom)
 * @description Define los contratos Zod inmutables para identificadores nominales,
 * reputación ciudadana y disponibilidad en tiempo real dentro del almacén global.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name StateCitizenIdentifierSchema
 * @description Identificador único universal (UUID v4) sellado nominalmente para ciudadanos en estado local.
 */
export const StateCitizenIdentifierSchema = z
  .string()
  .uuid({ message: 'STATE_CITIZEN_IDENTIFIER_MUST_BE_UUID' })
  .describe('Identificador nominal inalterable del ciudadano en la memoria del cliente.')
  .brand<'CitizenIdentifier'>();

export type TStateCitizenIdentifier = z.infer<typeof StateCitizenIdentifierSchema>;

/**
 * @name StateGroupIdentifierSchema
 * @description Identificador único universal (UUID v4) sellado nominalmente para círculos de comunicación.
 */
export const StateGroupIdentifierSchema = z
  .string()
  .uuid({ message: 'STATE_GROUP_IDENTIFIER_MUST_BE_UUID' })
  .describe('Identificador nominal de un círculo de comunicación o grupo territorial.')
  .brand<'GroupIdentifier'>();

export type TStateGroupIdentifier = z.infer<typeof StateGroupIdentifierSchema>;

/**
 * @name AvailabilityStatusEnum
 * @description Catálogo ontológico de estados de disponibilidad ciudadana en tiempo real.
 */
export const AvailabilityStatusEnum = z
  .enum(['ONLINE', 'AWAY', 'DO_NOT_DISTURB', 'OFFLINE'])
  .describe('Estados ontológicos de disponibilidad del ciudadano en tiempo real.');

export type TAvailabilityStatus = z.infer<typeof AvailabilityStatusEnum>;

/**
 * @name CredibilityIdentityStateSchema
 * @description Dominio 3: Estado de identidad civil verificada y peso bayesiano de autoridad.
 */
export const CredibilityIdentityStateSchema = z
  .object({
    actorAuthorityWeightNumeric: z
      .number()
      .min(0)
      .max(1)
      .default(0.1)
      .describe('Coeficiente bayesiano de autoridad asignado por el motor de impacto.'),
    isVerifiedHumanBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si la identidad alcanzó el umbral de verificación humana institucional.'),
    activeCitizenIdentifier: StateCitizenIdentifierSchema.optional().describe(
      'Identificador nominal del ciudadano autenticado actualmente en el cliente.',
    ),
  })
  .readonly();

/**
 * @name UserPresenceStateSchema
 * @description Dominio 4: Estado de presencia en hardware, mensaje personalizado y canal Web Push.
 */
export const UserPresenceStateSchema = z
  .object({
    availabilityStatus: AvailabilityStatusEnum.default('OFFLINE').describe(
      'Estado de disponibilidad actual calculado a partir de sensores de red y visibilidad.',
    ),
    customStatusMessageLiteral: z
      .string()
      .max(60)
      .default('')
      .describe('Mensaje corto de contexto definido por el ciudadano.'),
    activePushTokenSecret: z
      .string()
      .optional()
      .describe('Token secreto de suscripción para notificaciones Web Push (PWA).'),
    lastHeartbeatTimestampISO: z
      .string()
      .datetime()
      .describe('Marca temporal ISO 8601 del último pulso de presencia emitido.'),
  })
  .readonly();
