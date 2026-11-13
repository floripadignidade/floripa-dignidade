/**
 * @section Impact Analytics DNA - Social Anomaly Verdict
 * @description Define el contrato de salida inmutable para el detector de anomalías.
 * Estructura el razonamiento del Sentinel sobre la salud de la inversión pública.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * @author Raz Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Niveles de Severidad para el triaje del Neural Sentinel.
 */
export const AnomalySeveritySchema = z
  .enum([
    'CRITICAL_DISCREPANCY', // Gasto masivo con rechazo total.
    'HIGH_POLARIZATION', // Consenso fracturado.
    'LOW_PARTICIPATION', // Volumen de datos insuficiente para auditoría.
    'NOMINAL_HEALTH', // Sin anomalías detectadas.
  ])
  .describe('Severidad técnica de la anomalía social detectada.');

export type TAnomalySeverity = z.infer<typeof AnomalySeveritySchema>;

/**
 * @name SocialAnomalyVerdictSchema
 * @description ADN del veredicto generado por el motor de impacto.
 */
export const SocialAnomalyVerdictSchema = z
  .object({
    /** Indica si el sistema recomienda una auditoría forense manual. */
    isAnomalyDetectedBoolean: z.boolean(),

    /** Clasificación del riesgo. */
    anomalySeverityLiteral: AnomalySeveritySchema,

    /**
     * Coeficiente de Probabilidad (0.0 a 1.0).
     * Representa la certeza de la IA sobre la existencia de una irregularidad social.
     */
    anomalyProbabilityNumeric: z.number().min(0).max(1),

    /** Explicación técnica para el log de transparencia. */
    inferenceReasoningLiteral: z
      .string()
      .describe('Razonamiento algorítmico detrás del veredicto.'),

    /** Identificador de la versión del algoritmo (Trazabilidad). */
    algorithmVersionLiteral: z.string().default('HOLISTIC_SRE_V1.0'),
  })
  .readonly();

export type ISocialAnomalyVerdict = z.infer<typeof SocialAnomalyVerdictSchema>;
