/**
 * @section Impact Analytics Contracts - Linguistic Integrity Schema (SSOT)
 * @description Define el contrato Zod inmutable para la terminología estadística institucional
 * de `@floripa-dignidade/impact-analytics-engine`. Garantiza paridad estructural entre las
 * métricas bayesianas, tendencias de aceptación, explicaciones metodológicas y veredictos
 * de anomalías sociales en todos los idiomas habilitados.
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
    .min(1, { message: 'IMPACT_ANALYTICS_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name ImpactAnalyticsI18nSchema
 * @description Contrato maestro inmutable para los diccionarios de analítica de impacto social.
 */
export const ImpactAnalyticsI18nSchema = z
  .object({
    /** Etiquetas de indicadores principales mostrados en el tablero ciudadano. */
    metrics: z
      .object({
        WEIGHTED_TRUST_LABEL: createRequiredTranslationLiteralSchema(
          'Etiqueta para el indicador de confianza bayesiana ponderada del termómetro ciudadano.',
        ),
        CONFIDENCE_LEVEL_LABEL: createRequiredTranslationLiteralSchema(
          'Etiqueta para el índice de certeza estadística calculado según tamaño muestral.',
        ),
        CONSENSUS_INDEX_LABEL: createRequiredTranslationLiteralSchema(
          'Etiqueta para el grado de consenso o polarización comunitaria detectado.',
        ),
        PARTICIPATION_VOLUME_LABEL: createRequiredTranslationLiteralSchema(
          'Etiqueta para el volumen total de participantes identificados en la evaluación.',
        ),
      })
      .readonly()
      .describe('Catálogo de etiquetas para métricas estadísticas principales.'),

    /** Descripciones localizadas sincronizadas con `AcceptanceTrendSchema`. */
    trends: z
      .object({
        RISING_TRUST: createRequiredTranslationLiteralSchema(
          'Etiqueta para tendencia de incremento sostenido en la credibilidad.',
        ),
        STABLE_CONSENSUS: createRequiredTranslationLiteralSchema(
          'Etiqueta para tendencia de estabilidad nominal en la percepción comunitaria.',
        ),
        DECLINING_TRUST: createRequiredTranslationLiteralSchema(
          'Etiqueta para tendencia de deterioro de la confianza pública.',
        ),
        VOLATILE_RATING: createRequiredTranslationLiteralSchema(
          'Etiqueta para fluctuaciones extremas o conflicto de opinión.',
        ),
      })
      .readonly()
      .describe('Catálogo localizado de tendencias temporales de aceptación.'),

    /** Textos explicativos para transparencia metodológica ciudadana. */
    explanations: z
      .object({
        BAYESIAN_METHODOLOGY_HINT: createRequiredTranslationLiteralSchema(
          'Explicación metodológica sobre la ponderación de voces con identidad verificada.',
        ),
        SAMPLE_SIZE_WARNING: createRequiredTranslationLiteralSchema(
          'Advertencia cuando la muestra aún es pequeña para una conclusión definitiva.',
        ),
      })
      .readonly()
      .describe('Notas pedagógicas sobre metodología estadística y muestra.'),

    /** Razonamientos legibles emitidos por `DetectSocialAnomaly` ante irregularidades. */
    anomalies: z
      .object({
        CRITICAL_DISCREPANCY_REASON: createRequiredTranslationLiteralSchema(
          'Justificación emitida ante gasto elevado con confianza ciudadana bajo el 35%.',
        ),
        HIGH_POLARIZATION_REASON: createRequiredTranslationLiteralSchema(
          'Justificación emitida cuando el índice de consenso indica polarización crítica.',
        ),
        LOW_PARTICIPATION_REASON: createRequiredTranslationLiteralSchema(
          'Justificación emitida cuando el volumen de voces verificadas es insuficiente.',
        ),
        NOMINAL_HEALTH_REASON: createRequiredTranslationLiteralSchema(
          'Justificación emitida cuando existe correlación saludable entre gasto y apoyo.',
        ),
      })
      .readonly()
      .describe('Catálogo de razonamientos para veredictos de anomalías sociales.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del motor de analítica de impacto social.');

/**
 * @name IImpactAnalyticsI18n
 * @description Tipo inmutable inferido del diccionario validado de analítica de impacto.
 */
export type IImpactAnalyticsI18n = z.infer<typeof ImpactAnalyticsI18nSchema>;
