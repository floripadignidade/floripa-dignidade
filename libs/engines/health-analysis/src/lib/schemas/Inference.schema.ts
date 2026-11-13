/**
 * @section Health Analysis DNA - Cognitive Inference Schema
 * @description Define el contrato soberano para la comunicación con modelos de IA
 * y la estructura de las directivas de auto-sanación.
 *
 * Protocolo OEDP-V15.0 - Sovereign Data & ReadOnly Integrity.
 * Saneamiento: Exportación de tipos nominales para soporte de Verbatim Syntax (TS2305 Fix).
 *
 * @author Dirección de Ingeniería - Floripa Dignidade
 */

import { z } from 'zod';

/**
 * @section Esquema de Proveedores
 * Define el ecosistema multi-modelo soportado por el motor de análisis.
 */
export const AIProviderSchema = z
  .enum(['OPENAI', 'ANTHROPIC', 'HUGGING_FACE', 'LOCAL_SLM'])
  .describe('Identificadores de proveedores de inferencia cognitiva autorizados.');

/**
 * 🛡️ ADN Tipado: Representación literal del proveedor.
 * Utilizado por el orquestador para garantizar el desacoplamiento de tipos.
 */
export type TAIProvider = z.infer<typeof AIProviderSchema>;

/**
 * @name InferenceResponseSchema
 * @description Contrato maestro de respuesta cognitiva.
 * Transforma datos crudos de IA en directivas de acción para el sistema.
 */
export const InferenceResponseSchema = z
  .object({
    analysisId: z
      .string()
      .uuid()
      .describe('Identificador único inalterable de la operación de inferencia.'),

    confidenceScore: z
      .number()
      .min(0)
      .max(1)
      .describe('Nivel de certeza probabilística del modelo sobre el análisis (0.0 a 1.0).'),

    observation: z
      .string()
      .describe('Razonamiento lógico detallado generado por la entidad cognitiva.'),

    suggestedAction: z
      .enum(['NONE', 'RESTART_MODULE', 'CACHE_PURGE', 'CODE_REFACTOR_REQUIRED'])
      .describe('Directiva técnica de sanación recomendada para el ecosistema.'),

    detectedAnomalies: z
      .array(z.string())
      .describe('Colección de patrones de fallo o desviaciones lógicas identificadas.'),

    metadata: z
      .record(z.string(), z.unknown())
      .describe('Metadatos técnicos del proveedor (tokens, latencia interna, versión del modelo).'),
  })
  .readonly();

/** 🛡️ ADN Tipado: Interfaz inmutable de la respuesta de inferencia. */
export type IInferenceResponse = z.infer<typeof InferenceResponseSchema>;
