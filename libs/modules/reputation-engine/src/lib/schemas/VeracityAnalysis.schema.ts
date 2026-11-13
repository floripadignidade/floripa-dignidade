/**
 * @section Reputation Engine - Veracity Analysis DNA
 * @description Define el contrato de salida inmutable para la auditoría cognitiva
 * de contenidos cualitativos. Permite al sistema clasificar la calidad ética,
 * la veracidad y la intención semántica de un testimonio ciudadano mediante IA.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & AI Inalytics.
 * SANEADO Zenith: Inyección de descriptores para el Neural Sentinel, cumplimiento
 * de Prosa ISO y sellado de inmutabilidad total (ReadOnly).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section Catálogo de Señalética Semántica (AI Flags)
 * @description Identificadores técnicos de patrones de comportamiento detectados
 * por los modelos de lenguaje durante el escaneo ético.
 */
export const SemanticFlagSchema = z
  .enum([
    'HATE_SPEECH_DETECTED', // Detección de discurso de odio o violencia.
    'SPAM_BOT_PATTERN', // Patrón de repetición o automatización inhumana.
    'LOGICAL_INCONSISTENCY', // Discrepancia entre hechos conocidos y el relato.
    'SARCASM_DETECTED', // Uso de ironía que puede sesgar la analítica.
    'OBJECTIVE_TESTIMONY', // Relato neutral basado en evidencia.
    'BIASED_REPRESENTATION', // Intento deliberado de inflar o degradar reputación.
  ])
  .describe('Etiquetas de clasificación ontológica generadas por la IA.');

export type TSemanticFlag = z.infer<typeof SemanticFlagSchema>;

/**
 * @section Protocolo de Moderación (Action Logic)
 */
export const ModerationActionSchema = z
  .enum([
    'APPROVE', // Contenido íntegro, listo para impactar el Ledger.
    'FLAG_FOR_REVIEW', // Requiere auditoría por un interventor humano.
    'REJECT', // Contenido malicioso o corrupto; bloqueo inmediato.
  ])
  .describe('Directiva técnica de acción para el orquestador de persistencia.');

export type TModerationAction = z.infer<typeof ModerationActionSchema>;

/**
 * @name VeracityAnalysisSchema
 * @description Esquema maestro que estructura los hallazgos de la auditoría cognitiva.
 */
export const VeracityAnalysisSchema = z
  .object({
    /**
     * COEFICIENTE DE VERACIDAD (0.0 a 1.0)
     * Determinado por el motor de análisis de salud (Inference Score).
     */
    veracityConfidenceScoreNumeric: z
      .number()
      .min(0)
      .max(1)
      .describe('Nivel de certeza probabilística sobre la veracidad del contenido.'),

    /** Colección de banderas detectadas durante el procesamiento. */
    semanticFlagsCollection: z
      .array(SemanticFlagSchema)
      .describe('Listado de anomalías o virtudes semánticas identificadas.'),

    /** Recomendación automática para el flujo de trabajo (Workflow). */
    moderationActionSuggestion: ModerationActionSchema,

    /**
     * RAZONAMIENTO COGNITIVO (Inference reasoning)
     * Justificación técnica de la IA para el veredicto de moderación.
     */
    inferenceReasoningLiteral: z
      .string()
      .min(1)
      .describe('Explicación textual del proceso de razonamiento del Neural Sentinel.'),
  })
  .readonly(); // Inmutabilidad forzada para proteger la evidencia de auditoría.

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IVeracityAnalysis = z.infer<typeof VeracityAnalysisSchema>;
