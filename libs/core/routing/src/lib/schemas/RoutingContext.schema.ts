/**
 * @section Routing DNA - Request Context Schema
 * @description Define la estructura soberana de los metadatos de una solicitud.
 * Protocolo OEDP-V13.0 - Extensibilidad Atómica.
 */

import { z } from 'zod';
import { SupportedLocaleSchema } from './RoutingConfiguration.schema';

export const RoutingContextSchema = z
  .object({
    /** Identificador único de la transacción para rastreo forense. */
    correlationIdentifier: z.string().uuid(),

    /** Idioma detectado o asignado por defecto. */
    detectedLocale: SupportedLocaleSchema,

    /** Información técnica del cliente para auditoría de seguridad. */
    clientMetadata: z.object({
      ipAddressLiteral: z.string().default('unknown'),
      userAgentLiteral: z.string().default('unknown'),
      deviceFingerprintLiteral: z.string().optional(),
    }),

    /** Control de flujo para el middleware. */
    isRequestAuthorizedBoolean: z.boolean().default(true),
    targetRedirectUrlLiteral: z.string().optional(),
  })
  .readonly();

export type IRoutingContext = z.infer<typeof RoutingContextSchema>;
