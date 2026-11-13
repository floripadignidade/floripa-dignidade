/**
 * @section Messaging DNA - User Presence & Platform Schema
 * @description Define el contrato de disponibilidad y rastro de hardware.
 * Actúa como la fuente de verdad única para el ruteo de señales de vida.
 *
 * Protocolo OEDP-V16.0 - Sovereign Identity & Contract Integrity.
 */

import { z } from 'zod';

/**
 * Catálogo de Estados de Disponibilidad.
 */
export const AvailabilityStatusSchema = z
  .enum(['ONLINE', 'AWAY', 'DO_NOT_DISTURB', 'OFFLINE'])
  .describe('Estado ontológico de disponibilidad en tiempo real.');

/**
 * Identificador de Plataforma Activa.
 * 🛡️ Refactor: Sincronizado con estándares de detección de hardware.
 */
export const DevicePlatformSchema = z
  .enum([
    'WEB_DESKTOP',
    'PWA_MOBILE_ANDROID',
    'PWA_MOBILE_APPLE', // Sincronizado con el hardware sensor
    'NATIVE_TABLET',
  ])
  .describe('Clasificación técnica del hardware de origen.');

/**
 * @name UserPresenceSchema
 * @description ADN de presencia para sincronización vía Heartbeat.
 */
export const UserPresenceSchema = z
  .object({
    /** Referencia a la identidad soberana. */
    citizenIdentifier: z.string().uuid().describe('UUID del ciudadano propietario del pulso.'),

    currentAvailabilityStatus: AvailabilityStatusSchema.default('OFFLINE'),

    /** Mensaje de contexto lingüístico. */
    customStatusMessageLiteral: z.string().max(60).optional(),

    lastActivePlatformLiteral: DevicePlatformSchema.optional(),

    /** Token criptográfico para despacho de notificaciones. */
    activePushSubscriptionTokenSecret: z
      .string()
      .optional()
      .describe('Token único de suscripción para Push API.'),

    isPresencePubliclyVisibleBoolean: z.boolean().default(true),

    /** Marca temporal de sincronización (ISO 8601). */
    lastHeartbeatTimestampISO: z.string().datetime(),
  })
  .readonly();

/**
 * --- EXPORTACIÓN DE CONTRATOS NOMINALES ---
 * 🛡️ Solución al Error TS2305
 */
export type IUserPresence = z.infer<typeof UserPresenceSchema>;
export type TAvailabilityStatus = z.infer<typeof AvailabilityStatusSchema>;
export type TDevicePlatform = z.infer<typeof DevicePlatformSchema>;
