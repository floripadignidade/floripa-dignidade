import { z } from 'zod';

/**
 * @section Aduana Lingüística - Analytics Engine
 * Protocolo OEDP-V11.0 (Granular i18n & Dictionary Compilation)
 */

/**
 * Esquema Soberano para el diccionario de traducciones de analítica.
 * Define la estructura obligatoria que deben cumplir los archivos JSON
 * (pt-BR.json, es-ES.json, en-US.json) para garantizar la integridad visual.
 */
export const AnalyticsI18nSchema = z
  .object({
    errors: z.object({
      ADN_CORRUPTO: z
        .string()
        .describe('Mensaje de error cuando un evento de usuario falla la validación de esquema'),

      PERDIDA_CONEXION: z
        .string()
        .describe('Mensaje de advertencia cuando falla la sincronización con el bus de eventos'),
    }),

    logs: z.object({
      EVENTO_CAPTURADO: z
        .string()
        .describe('Confirmación de que un pulso de interacción ha sido procesado con éxito'),
    }),
  })
  .readonly();

/**
 * Interfaz tipada del diccionario de analítica para el compilador de i18n.
 */
export type IAnalyticsI18n = z.infer<typeof AnalyticsI18nSchema>;
