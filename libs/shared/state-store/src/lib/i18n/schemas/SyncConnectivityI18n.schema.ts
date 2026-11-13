/**
 * @section Shared State Store - Connectivity Sync Linguistic Contract (Atom)
 * @description Contrato Zod inmutable para los literales telemétricos de conectividad
 * física y recuperación offline del almacén de estado (ADR 0025 / ADR 0030).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name SyncConnectivityI18nSchema
 * @description Valida la paridad estructural de los diccionarios de conectividad en `i18n/<locale>/connectivity.json`.
 */
export const SyncConnectivityI18nSchema = z
  .object({
    telemetry: z
      .object({
        NETWORK_RESTORED_SIGNAL: z
          .string()
          .min(1)
          .describe('Mensaje emitido cuando el navegador recupera conectividad de red.'),
        NETWORK_LOST_SIGNAL: z
          .string()
          .min(1)
          .describe('Mensaje emitido cuando el navegador detecta pérdida de conectividad de red.'),
      })
      .readonly(),
  })
  .readonly();

export type ISyncConnectivityI18n = z.infer<typeof SyncConnectivityI18nSchema>;
