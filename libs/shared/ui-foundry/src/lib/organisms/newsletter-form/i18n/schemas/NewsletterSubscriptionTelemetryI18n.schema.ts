/**
 * @section Shared UI Foundry - Newsletter Telemetry i18n Schema (Atom)
 * @description Contrato Zod inmutable para los literales telemétricos del flujo de suscripción.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name NewsletterSubscriptionTelemetryI18nSchema
 * @description Valida paridad estructural de los diccionarios en `i18n/<locale>/newsletterTelemetry.json`.
 */
export const NewsletterSubscriptionTelemetryI18nSchema = z
  .object({
    telemetry: z
      .object({
        SUBSCRIPTION_TRANSACTION_STARTED: z.string().min(1),
        SUBSCRIPTION_CONVERSION_SUCCESS: z.string().min(1),
        SUBSCRIPTION_DISPATCH_FAULT: z.string().min(1),
      })
      .readonly(),
  })
  .readonly();

export type INewsletterSubscriptionTelemetryI18n = z.infer<
  typeof NewsletterSubscriptionTelemetryI18nSchema
>;
