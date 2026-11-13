/**
 * @section Impact Analytics DNA - Social Efficiency Schema
 * @description Define el contrato para el reporte de correlación entre gasto público
 * y percepción civil. Permite auditar si la inversión financiera en un territorio
 * se traduce en una mejora real de la reputación institucional.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & Forensic Statistics.
 */

import { z } from 'zod';

export const SocialEfficiencyReportSchema = z
  .object({
    /** Referencia al gasto de la PMF auditado. */
    expenditureIdentifier: z.string().describe('Hash determinista del gasto (FD-XXXX).'),

    /** Datos del cruzamiento territorial. */
    territorialContext: z.object({
      ibgeIdentifier: z.string(),
      territoryNameLiteral: z.string(),
    }),

    /** Métricas de Comparación (Cruce). */
    analysisMetrics: z.object({
      executedAmountNumeric: z.number().describe('Dinero invertido por la municipalidad.'),
      communityTrustScoreNumeric: z.number().describe('Nivel de aprobación ciudadana (0-1).'),
      efficiencyIndexNumeric: z
        .number()
        .describe('Ratio calculado: Impacto por cada Real invertido.'),
    }),

    /** Inferencia de la IA. */
    anomalyAlertBoolean: z
      .boolean()
      .describe('Verdadero si el gasto es alto y la confianza es crítica.'),
    generationTimestampISO: z.string().datetime(),
  })
  .readonly();

export type ISocialEfficiencyReport = z.infer<typeof SocialEfficiencyReportSchema>;
