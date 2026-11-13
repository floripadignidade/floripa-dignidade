/**
 * @section Reputation Engine Contracts - Linguistic Integrity Schema (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del módulo
 * de reputación ciudadana (`@floripa-dignidade/reputation-engine`). Garantiza paridad entre
 * los registros operativos de evaluación y los errores cualitativos de entrada en todos los
 * idiomas habilitados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales lingüísticos obligatorios sin espacios residuales.
 *
 * @param semanticDescriptionLiteral - Descripción técnica para inspección automatizada de contratos.
 * @returns Esquema Zod de cadena purificada con longitud mínima de 1 carácter.
 */
const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'REPUTATION_ENGINE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name ReputationEngineI18nSchema
 * @description Esquema maestro inmutable para los diccionarios del motor de reputación.
 */
export const ReputationEngineI18nSchema = z
  .object({
    /** Mensajes de registro operativo durante la ingesta y verificación de evaluaciones. */
    logs: z
      .object({
        INVALID_PULSE_STRUCTURE: createRequiredTranslationLiteralSchema(
          'Alerta emitida cuando el pulso de evaluación incumple el contrato estructural.',
        ),
        SUBMISSION_NOMINAL: createRequiredTranslationLiteralSchema(
          'Confirmación de integración exitosa de la evaluación en la red de confianza.',
        ),
        ANOMALY_DETECTED: createRequiredTranslationLiteralSchema(
          'Aviso de anomalía conductual por posible automatización en evaluaciones.',
        ),
      })
      .readonly()
      .describe('Catálogo de registros operativos del módulo de reputación.'),

    /** Mensajes de error estructurado para validación de evaluaciones y comentarios. */
    errors: z
      .object({
        REPUTATION_PULSE_ADN_CORRUPTO: createRequiredTranslationLiteralSchema(
          'Mensaje de error ante estructura de evaluación inválida o corrupta.',
        ),
        COMMENTARY_TOO_SHORT: createRequiredTranslationLiteralSchema(
          'Error emitido cuando el comentario argumentativo tiene menos de 10 caracteres.',
        ),
        COMMENTARY_EXCEEDS_MAXIMUM_LENGTH: createRequiredTranslationLiteralSchema(
          'Error emitido cuando el comentario supera el límite técnico de 1000 caracteres.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de error de validación del módulo de reputación.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del motor de reputación ciudadana.');

/**
 * @name IReputationEngineI18n
 * @description Tipo inmutable inferido del diccionario validado del motor de reputación.
 */
export type IReputationEngineI18n = z.infer<typeof ReputationEngineI18nSchema>;
