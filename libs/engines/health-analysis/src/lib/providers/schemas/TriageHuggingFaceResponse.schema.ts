/**
 * @section Cognitive Analysis Contracts - Hugging Face Response Triage Schema (Atom)
 * @description Contratos Zod inmutables para validar respuestas HTTP de Hugging Face
 * Router en formatos OpenAI Chat Completions, Task API tradicional y cuerpos de error.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';

import { HuggingFaceInferenceProtocolSchema } from './HuggingFaceInferenceDriver.schema';

export const HUGGING_FACE_DEGRADED_LATENCY_THRESHOLD_MILLISECONDS_QUANTITY = 3_000;

/**
 * @name TriageHuggingFaceResponseOptionsSchema
 * @description Opciones extensibles opcionales para enriquecer el triaje con contexto de idioma y modelo.
 */
export const TriageHuggingFaceResponseOptionsSchema = z
  .object({
    localeIdentifier: SupportedLocaleSchema.default(DEFAULT_LOCALE_IDENTIFIER),
    modelIdentifierLiteral: z.string().trim().min(1).optional(),
    inferenceProtocolLiteral: HuggingFaceInferenceProtocolSchema.optional(),
  })
  .readonly();

export type ITriageHuggingFaceResponseOptionsInput = z.input<
  typeof TriageHuggingFaceResponseOptionsSchema
>;

/**
 * @name OpenAiChatCompletionResponseSchema
 * @description Validador para respuestas compatibles con `/v1/chat/completions`.
 */
export const OpenAiChatCompletionResponseSchema = z
  .object({
    id: z.string().optional(),
    model: z.string().optional(),
    choices: z
      .array(
        z
          .object({
            message: z
              .object({
                role: z.string().optional(),
                content: z.string().nullable().optional(),
              })
              .optional(),
            text: z.string().optional(),
            finish_reason: z.string().nullable().optional(),
          })
          .readonly(),
      )
      .min(1),
    usage: z
      .object({
        prompt_tokens: z.number().int().nonnegative().optional(),
        completion_tokens: z.number().int().nonnegative().optional(),
        total_tokens: z.number().int().nonnegative().optional(),
      })
      .readonly()
      .optional(),
  })
  .readonly();

/**
 * @name HuggingFaceTaskApiItemSchema
 * @description Elemento individual devuelto por `/hf-inference/models/...`.
 */
export const HuggingFaceTaskApiItemSchema = z
  .object({
    generated_text: z.string().optional(),
    summary_text: z.string().optional(),
    translation_text: z.string().optional(),
  })
  .readonly();

export const HuggingFaceTaskApiResponseSchema = z.union([
  z.array(HuggingFaceTaskApiItemSchema).min(1),
  HuggingFaceTaskApiItemSchema,
]);

/**
 * @name HuggingFaceRouterErrorBodySchema
 * @description Validador para mensajes de diagnóstico en respuestas HTTP de error.
 */
export const HuggingFaceRouterErrorBodySchema = z
  .object({
    error: z
      .union([
        z.string(),
        z
          .object({
            message: z.string().optional(),
            type: z.string().optional(),
            code: z.union([z.string(), z.number()]).optional(),
          })
          .readonly(),
      ])
      .optional(),
    message: z.string().optional(),
    estimated_time: z.number().nonnegative().optional(),
  })
  .readonly();
