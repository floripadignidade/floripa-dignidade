/**
 * @section Messaging DNA - Web Push Payload Schema
 * @description Define la estructura inmutable que se envía al Service Worker
 * de la PWA para mostrar la notificación visual en el sistema operativo.
 *
 * Protocolo OEDP-V16.0 - Sovereign Data & ISO Standard Naming.
 */

import { z } from 'zod';

/**
 * @name PushPayloadSchema
 * @description Contrato para el despacho de señales al hardware del ciudadano.
 */
export const PushPayloadSchema = z
  .object({
    /** Título de la notificación (Ej: "Denuncia Actualizada"). */
    notificationHeadlineLiteral: z.string().min(1).max(60),

    /** Cuerpo breve para visualización en pantalla de bloqueo. */
    notificationBodyLiteral: z.string().min(1).max(120),

    /**
     * Ruta interna para redirección al hacer clic.
     * Ejemplo: "/es-ES/denuncias/uuid".
     */
    targetInteractionPathLiteral: z.string(),

    /** Identificador visual (Icono de la aplicación). */
    iconSourcePathLiteral: z.string().default('/brand/icon-192x192.png'),

    /** Identificador único para evitar duplicados en la bandeja del sistema. */
    notificationTagIdentifier: z.string(),
  })
  .readonly();

export type IPushPayload = z.infer<typeof PushPayloadSchema>;
