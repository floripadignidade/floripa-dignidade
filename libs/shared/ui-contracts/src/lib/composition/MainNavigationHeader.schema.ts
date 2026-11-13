/**
 * @section UI Contracts - Main Navigation Header DNA
 * @description Define el contrato de integridad para la navegación institucional.
 * Protocolo OEDP-V17.0 - Zenith Architecture Standard.
 */

import { z } from 'zod';

/**
 * @name MainNavigationHeaderI18nSchema
 * @description Aduana lingüística para el encabezado.
 */
export const MainNavigationHeaderI18nSchema = z
  .object({
    navigationPaths: z.object({
      identity: z.string(),
      transparency: z.string(),
      press: z.string(),
      complaint: z.string(),
    }),
    actions: z.object({
      donateCallToAction: z.string(),
      searchPlaceholder: z.string(),
      mobileMenuToggle: z.string(),
      reportEmergencyLabel: z.string(),
    }),
  })
  .readonly();

export type IMainNavigationHeaderI18n = z.infer<typeof MainNavigationHeaderI18nSchema>;
