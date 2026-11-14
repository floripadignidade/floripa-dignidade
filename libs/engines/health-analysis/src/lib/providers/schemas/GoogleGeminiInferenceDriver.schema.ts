/**
 * @section Cognitive Analysis Contracts - Google Gemini Driver Schema (Atom)
 * @description Única Fuente de Verdad (SSOT) para validar opciones multi-modelo, formatos
 * de clave de Google AI Studio (Standard `AIza*` y Auth Keys `AQ.*`) y el contrato de
 * respuesta `generateContent` v1beta.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0015 / ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

export const CANONICAL_GEMINI_API_BASE_URL_LITERAL =
  'https://generativelanguage.googleapis.com/v1beta/models';

export const CANONICAL_GEMINI_DEFAULT_MODEL_LITERAL = 'gemini-3.8-flash';
export const DEFAULT_GEMINI_TIMEOUT_IN_MILLISECONDS_QUANTITY = 10_000;
export const DEFAULT_GEMINI_MAX_OUTPUT_TOKENS_QUANTITY = 512;
export const DEFAULT_GEMINI_TEMPERATURE_NUMERIC = 0.2;

/**
 * @name GeminiModelIdentifierSchema
 * @description Identificador nominal de modelo Gemini vigente (ej. `gemini-3.8-flash`, `gemini-3.5-flash-lite`).
 */
export const GeminiModelIdentifierSchema = z
  .string()
  .trim()
  .min(3)
  .max(120)
  .regex(/^[a-zA-Z0-9._-]+$/, { message: 'INVALID_GEMINI_MODEL_IDENTIFIER_FORMAT' })
  .brand<'GeminiModelIdentifier'>();

export type TGeminiModelIdentifier = z.infer<typeof GeminiModelIdentifierSchema>;

/**
 * @name GeminiApiKeySecretSchema
 * @description Valida claves Standard (`AIza...`) y Authorization Keys (`AQ....`) de Google AI Studio.
 */
export const GeminiApiKeySecretSchema = z
  .string()
  .trim()
  .min(20, { message: 'GEMINI_API_KEY_INSUFFICIENT_LENGTH' })
  .refine(
    (keyLiteral: string): boolean => keyLiteral.startsWith('AIza') || keyLiteral.startsWith('AQ.'),
    { message: 'INVALID_GEMINI_API_KEY_PREFIX' },
  )
  .brand<'GeminiApiKeySecret'>();

export type TGeminiApiKeySecret = z.infer<typeof GeminiApiKeySecretSchema>;

/**
 * @name GoogleGeminiDriverOptionsSchema
 * @description Opciones extensibles por invocación para selección de modelo, idioma y límites SRE.
 */
export const GoogleGeminiDriverOptionsSchema = z
  .object({
    preferredModelIdentifier: z.string().trim().min(3).max(120).optional(),
    systemInstructionPromptLiteral: z.string().trim().min(1).max(4000).optional(),
    timeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(1_000)
      .max(60_000)
      .default(DEFAULT_GEMINI_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    maxOutputTokensQuantity: z
      .number()
      .int()
      .min(1)
      .max(8_192)
      .default(DEFAULT_GEMINI_MAX_OUTPUT_TOKENS_QUANTITY),
    temperatureNumeric: z.number().min(0).max(2).default(DEFAULT_GEMINI_TEMPERATURE_NUMERIC),
    localeIdentifier: SupportedLocaleSchema.default(DEFAULT_LOCALE_IDENTIFIER),
    correlationIdentifier: CorrelationIdentifierSchema.optional(),
  })
  .readonly();

export type IGoogleGeminiDriverOptionsInput = z.input<typeof GoogleGeminiDriverOptionsSchema>;
export type IGoogleGeminiDriverOptions = z.output<typeof GoogleGeminiDriverOptionsSchema>;

/**
 * @name GeminiGenerateContentResponseSchema
 * @description Contrato Zod para validar la respuesta JSON nativa de `generateContent`.
 */
export const GeminiGenerateContentResponseSchema = z
  .object({
    candidates: z
      .array(
        z
          .object({
            content: z
              .object({
                parts: z.array(z.object({ text: z.string().optional() }).readonly()).optional(),
              })
              .readonly()
              .optional(),
            finishReason: z.string().optional(),
          })
          .readonly(),
      )
      .optional(),
    usageMetadata: z
      .object({
        promptTokenCount: z.number().int().nonnegative().optional(),
        candidatesTokenCount: z.number().int().nonnegative().optional(),
        totalTokenCount: z.number().int().nonnegative().optional(),
      })
      .readonly()
      .optional(),
    modelVersion: z.string().optional(),
  })
  .readonly();

export type TGeminiConfigurationErrorCode =
  | 'MISSING_GOOGLE_GEMINI_API_KEY'
  | 'INVALID_GOOGLE_GEMINI_API_KEY_FORMAT';

export interface IGoogleGeminiResolvedConfiguration {
  readonly isConfiguredBoolean: true;
  readonly apiKeySecret: TGeminiApiKeySecret;
  readonly modelIdentifierLiteral: TGeminiModelIdentifier;
  readonly targetEndpointUrlLiteral: string;
  readonly timeoutInMillisecondsQuantity: number;
  readonly maxOutputTokensQuantity: number;
  readonly temperatureNumeric: number;
}

export interface IGoogleGeminiUnconfiguredState {
  readonly isConfiguredBoolean: false;
  readonly errorCodeLiteral: TGeminiConfigurationErrorCode;
  readonly modelIdentifierLiteral: string;
  readonly targetEndpointUrlLiteral: string;
}

export type TGoogleGeminiConfigurationResolution =
  | IGoogleGeminiResolvedConfiguration
  | IGoogleGeminiUnconfiguredState;
