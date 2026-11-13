/**
 * @section Shared State Store - Hydration Linguistic Contract (Atom)
 * @description Contrato Zod inmutable para los literales telemétricos del auditor
 * de rehidratación de estado local (ADR 0025 / ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name StateHydrationI18nSchema
 * @description Valida la paridad estructural de los diccionarios de hidratación en `i18n/<locale>/hydration.json`.
 */
export const StateHydrationI18nSchema = z
  .object({
    telemetry: z
      .object({
        HYDRATION_STORAGE_READ_FAILURE: z
          .string()
          .min(1)
          .describe('Mensaje emitido cuando falla la lectura o parseo de almacenamiento local.'),
        HYDRATION_SCHEMA_CORRUPTION_DETECTED: z
          .string()
          .min(1)
          .describe('Mensaje emitido cuando los datos rehidratados incumplen el contrato Zod.'),
        HYDRATION_NOMINAL_SUCCESS: z
          .string()
          .min(1)
          .describe('Confirmación de rehidratación válida del estado persistido.'),
        HYDRATION_COLD_START_NOMINAL: z
          .string()
          .min(1)
          .describe('Confirmación de arranque limpio sin snapshot previo en almacenamiento local.'),
      })
      .readonly(),
  })
  .readonly();

export type IStateHydrationI18n = z.infer<typeof StateHydrationI18nSchema>;
