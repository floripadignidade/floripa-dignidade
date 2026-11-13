import { z } from 'zod';

/**
 * @section Aduana de ADN - Monitoreo de Infraestructura
 */

/**
 * Esquema que define los estados de salud posibles para un servicio del ecosistema.
 * - UP: El servicio responde dentro de los umbrales nominales.
 * - DEGRADED: El servicio responde pero con latencia superior al límite establecido.
 * - DOWN: El servicio no responde o ha retornado un fallo crítico.
 */
export const HealthStatusSchema = z
  .enum(['UP', 'DEGRADED', 'DOWN'])
  .describe('Estados ontológicos de salud de un servicio');

/**
 * Tipo inferido para el estado de salud.
 */
export type HealthStatus = z.infer<typeof HealthStatusSchema>;

/**
 * Esquema Soberano para el resultado de un chequeo de infraestructura.
 * Define la estructura inmutable que el Health Monitor despacha hacia Telemetry.
 */
export const InfrastructureCheckSchema = z
  .object({
    serviceName: z.string().describe('Nombre técnico del servicio evaluado (ej: REDIS_CACHE)'),

    status: HealthStatusSchema.describe('Resultado categórico de la evaluación'),

    latencyInMilliseconds: z.number().describe('Tiempo exacto de respuesta medido en milisegundos'),

    lastCheckTimestamp: z
      .string()
      .datetime()
      .describe('Marca temporal ISO 8601 del momento exacto del chequeo'),
  })
  .readonly();

/**
 * Interfaz inmutable del reporte de salud de infraestructura.
 */
export type IInfrastructureCheck = z.infer<typeof InfrastructureCheckSchema>;
