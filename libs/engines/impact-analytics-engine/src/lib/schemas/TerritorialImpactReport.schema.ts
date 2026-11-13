/**
 * @section Impact Analytics DNA - Territorial Impact Report Schema
 * @description Define el contrato para el desglose geográfico del sentimiento popular.
 * Estructura la visualización del "Mapa de Calor de Confianza" por barrios.
 *
 * Protocolo OEDP-V16.0 - Sovereign Data & Forensic Statistical Accuracy.
 */

import { z } from 'zod';

/**
 * @name TerritorialClusterSchema
 * @description Representación estadística de un distrito o barrio específico.
 */
export const TerritorialClusterSchema = z
  .object({
    /** Nombre normalizado del barrio (ej: "TAPERA", "CENTRO"). */
    territoryIdentifierLiteral: z.string(),

    /** Puntuación de confianza promediada en el territorio. */
    aggregatedTrustScoreNumeric: z.number().min(0).max(1),

    /** Volumen de interacciones capturadas en esta zona. */
    totalInteractionQuantity: z.number().int().nonnegative(),

    /** Índice de acuerdo local (1.0 = Unanimidad, 0.0 = Conflicto). */
    communityConsensusIndexNumeric: z.number().min(0).max(1),
  })
  .readonly();

/**
 * @name TerritorialImpactReportSchema
 */
export const TerritorialImpactReportSchema = z
  .object({
    /** Identificador de la entidad analizada (Noticia/Institución). */
    targetEntityIdentifier: z.string().uuid(),

    /** Colección de métricas por zona geográfica. */
    territorialClustersCollection: z.array(TerritorialClusterSchema),

    /** Marca temporal de generación del reporte. */
    generationTimestampISO: z.string().datetime(),
  })
  .readonly();

export type ITerritorialImpactReport = z.infer<typeof TerritorialImpactReportSchema>;
