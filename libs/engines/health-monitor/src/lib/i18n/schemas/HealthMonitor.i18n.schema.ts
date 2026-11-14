/**
 * @section Health Monitor Contracts - Linguistic Integrity Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios localizados del
 * monitor de infraestructura (`@floripa-dignidade/health-monitor`). Garantiza paridad
 * estructural para mensajes de telemetría operativa y fallos de sonda en todos los idiomas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'HEALTH_MONITOR_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name HealthMonitorI18nSchema
 * @description Aduana Zod inmutable para validar los diccionarios de `healthMonitor.json`.
 */
export const HealthMonitorI18nSchema = z
  .object({
    telemetry: z
      .object({
        probeNominalLiteral: createRequiredTranslationLiteralSchema(
          'Mensaje telemétrico emitido cuando la sonda responde en estado UP dentro del umbral.',
        ),
        probeDegradedLiteral: createRequiredTranslationLiteralSchema(
          'Mensaje telemétrico emitido cuando la sonda responde en estado DEGRADED por latencia.',
        ),
        probeDownLiteral: createRequiredTranslationLiteralSchema(
          'Mensaje telemétrico emitido cuando la sonda falla o supera el timeout (DOWN).',
        ),
        probeTimeoutLiteral: createRequiredTranslationLiteralSchema(
          'Descripción diagnóstica cuando una sonda de infraestructura agota el timeout.',
        ),
      })
      .readonly(),
  })
  .readonly()
  .describe('Contrato lingüístico integral del monitor de salud de infraestructura.');

export type IHealthMonitorI18n = z.infer<typeof HealthMonitorI18nSchema>;
