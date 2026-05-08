/**
 * @section Impact Analytics DNA - Popular Acceptance Indicator Schema
 * @description Define el contrato soberano para las métricas de impacto social.
 * Estructura los datos estadísticos procesados por el motor de analítica,
 * incluyendo intervalos de confianza, niveles de consenso y rastro de algoritmo.
 *
 * Protocolo OEDP-V17.0 - High Performance & Forensic Statistical Accuracy.
 * Vision: Data-Driven Social Reliability (SRE) for Citizen Defense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section Tipado Nominal (Branded Types)
 * @description Protege los identificadores de indicadores de colisiones lógicas en el Data Lake.
 */
export const IndicatorIdentifierSchema = z.string().uuid().brand<'ImpactIndicatorIdentifier'>();
export type ImpactIndicatorIdentifier = z.infer<typeof IndicatorIdentifierSchema>;

/**
 * 🛡️ SANEADO Zenith: Identificador de la entidad evaluada (Gasto, Noticia o Denuncia).
 */
export const EvaluatedEntityIdentifierSchema = z.string().uuid().brand<'EvaluatedEntityIdentifier'>();
export type EvaluatedEntityIdentifier = z.infer<typeof EvaluatedEntityIdentifierSchema>;

/**
 * Tendencia estadística detectada en el periodo actual.
 * Proporciona una dirección vectorial para el triaje proactivo del Sentinel.
 */
export const AcceptanceTrendSchema = z.enum([
  'RISING_TRUST',      // Incremento sostenido de la credibilidad popular.
  'STABLE_CONSENSUS',   // Estabilidad nominal en la percepción civil.
  'DECLINING_TRUST',   // Degradación de la confianza; requiere auditoría.
  'VOLATILE_RATING'     // Fluctuaciones extremas; posible conflicto o ataque coordinado.
]).describe('Dirección vectorial del sentimiento popular en el eje temporal.');

export type TAcceptanceTrend = z.infer<typeof AcceptanceTrendSchema>;

/**
 * @name PopularAcceptanceIndicatorSchema
 * @description Contrato maestro para la representación del "Termómetro Popular".
 * Este objeto es la Única Fuente de Verdad (SSOT) para la transparencia pública.
 */
export const PopularAcceptanceIndicatorSchema = z.object({
  /** Identificador único inalterable del snapshot estadístico generado. */
  indicatorIdentifier: IndicatorIdentifierSchema,

  /** Referencia física a la entidad que ha sido sometida a auditoría ciudadana. */
  targetEntityIdentifier: EvaluatedEntityIdentifierSchema,

  /**
   * PUNTUACIÓN BAYESIANA PONDERADA (0.0 - 1.0)
   * Resultado del algoritmo de Bayes que prioriza identidades verificadas.
   */
  weightedTrustScoreNumeric: z.number().min(0).max(1)
    .describe('Promedio ponderado de confianza institucional (0 = Nula, 1 = Absoluta).'),

  /**
   * INTERVALO DE CONFIANZA (Certidumbre Estadística)
   * Determinado por el volumen de la muestra y la autoridad de los participantes.
   */
  statisticalConfidenceLevelNumeric: z.number().min(0).max(1)
    .describe('Grado de fiabilidad del indicador (1.0 representa certidumbre total).'),

  /** Volumen total de voces identificadas que componen este snapshot. */
  totalParticipantQuantity: z.number().int().nonnegative()
    .describe('Cantidad total de interacciones humanas capturadas en este ciclo.'),

  /** Desglose por niveles de autoridad (Transparencia SRE). */
  authorityLevelDistributionMetadata: z.object({
    verifiedCitizensQuantity: z.number().int().nonnegative(),
    anonymousInteractionsQuantity: z.number().int().nonnegative(),
    technicalAuditorsQuantity: z.number().int().nonnegative()
      .describe('Votos de personal experto con peso de supervisión técnica.'),
  }).readonly(),

  /** Tendencia temporal del indicador. */
  currentAcceptanceTrend: AcceptanceTrendSchema,

  /**
   * ÍNDICE DE CONSENSO (Polarización)
   * Mide la cohesión de la opinión. 0.0 indica polarización extrema (guerra de opiniones).
   */
  communityConsensusIndexNumeric: z.number().min(0).max(1)
    .describe('Grado de acuerdo comunitario; inversamente proporcional a la desviación típica.'),

  /** 🛡️ SANEADO Zenith: Versión de la lógica aplicada para historización forense. */
  algorithmVersionLiteral: z.string().default('BAYES_V1.2_FLORIPA'),

  /** Marca temporal inmutable de la generación del rastro (ISO 8601). */
  lastAggregationTimestampISO: z.string().datetime(),

}).readonly(); // Inmutabilidad forzada para el enjambre de datos.

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IPopularAcceptanceIndicator = z.infer<typeof PopularAcceptanceIndicatorSchema>;
