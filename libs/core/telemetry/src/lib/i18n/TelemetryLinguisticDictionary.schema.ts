/**
 * @section Telemetry DNA - Linguistic Integrity Schema
 * @description Define el contrato soberano para los diccionarios de traducción
 * del sistema nervioso central. Garantiza que cada señal emitida posea
 * una representación textual validada para auditoría y logs semánticos.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name TelemetryLinguisticDictionarySchema
 * @description Aduana de validación para las almas lingüísticas (JSON) del búnker
 * de telemetría. Impede que el sistema nervioso emita señales sin una
 * descripción humana clara en los idiomas soportados.
 */
export const TelemetryLinguisticDictionarySchema = z
  .object({
    /**
     * Mapeo de Señales Telemétricas Localizadas.
     * Define la representación textual de los hitos del flujo de ejecución.
     */
    telemetrySignalsMapping: z
      .object({
        START_PROCESS: z
          .string()
          .describe('Mensaje técnico emitido al inicio de una operación atómica.'),

        END_PROCESS: z
          .string()
          .describe('Mensaje de confirmación tras la finalización exitosa de un proceso.'),

        LATENCY_REPORT: z
          .string()
          .describe('Texto descriptivo que acompaña al reporte de microsegundos de ejecución.'),
      })
      .readonly(),
  })
  .readonly();

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Interfaz inmutable del diccionario para el compilador de internacionalización (Weaver).
 */
export type ITelemetryLinguisticDictionary = z.infer<typeof TelemetryLinguisticDictionarySchema>;
