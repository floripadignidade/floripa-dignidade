/**
 * @section Cognitive Analysis Contracts - Hugging Face Multi-Model Driver Schema (Atom)
 * @description Única Fuente de Verdad (SSOT) para validar la configuración, protocolos
 * de enrutamiento multi-modelo (Chat Completions OpenAI-Compatible y Task API) y opciones
 * de ejecución del driver de Hugging Face Router.
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

export const CANONICAL_HUGGING_FACE_CHAT_COMPLETIONS_URL_LITERAL =
  'https://router.huggingface.co/v1/chat/completions';

export const CANONICAL_HUGGING_FACE_DEFAULT_MODEL_LITERAL = 'Qwen/Qwen2.5-7B-Instruct';

export const DEFAULT_HUGGING_FACE_TIMEOUT_IN_MILLISECONDS_QUANTITY = 12_000;
export const DEFAULT_HUGGING_FACE_MAX_TOKENS_QUANTITY = 512;
export const DEFAULT_HUGGING_FACE_TEMPERATURE_NUMERIC = 0.2;

/**
 * @name HuggingFaceModelIdentifierSchema
 * @description Identificador nominal de modelo registrado en Hugging Face Hub / Router.
 */
export const HuggingFaceModelIdentifierSchema = z
  .string()
  .trim()
  .min(3, { message: 'HUGGING_FACE_MODEL_IDENTIFIER_TOO_SHORT' })
  .max(160, { message: 'HUGGING_FACE_MODEL_IDENTIFIER_TOO_LONG' })
  .brand<'HuggingFaceModelIdentifier'>()
  .describe(
    'Identificador de repositorio del modelo en Hugging Face (ej. Qwen/Qwen2.5-7B-Instruct).',
  );

export type THuggingFaceModelIdentifier = z.infer<typeof HuggingFaceModelIdentifierSchema>;

/**
 * @name HuggingFaceInferenceProtocolSchema
 * @description Protocolos de transporte admitidos por el enrutador unificado de Hugging Face.
 */
export const HuggingFaceInferenceProtocolSchema = z
  .enum(['OPENAI_CHAT_COMPLETIONS', 'HUGGING_FACE_TASK_API'])
  .describe('Protocolo de serialización HTTP utilizado según el endpoint destino.');

export type THuggingFaceInferenceProtocol = z.infer<typeof HuggingFaceInferenceProtocolSchema>;

/**
 * @name HuggingFaceDriverOptionsSchema
 * @description Aduana Zod inmutable para parametrización opcional por llamada multi-modelo.
 */
export const HuggingFaceDriverOptionsSchema = z
  .object({
    preferredModelIdentifier: z.string().trim().min(3).max(160).optional(),
    inferenceProtocolLiteral: HuggingFaceInferenceProtocolSchema.optional(),
    customRouterEndpointUrlLiteral: z.string().trim().url().optional(),
    systemInstructionPromptLiteral: z.string().trim().min(1).max(4000).optional(),
    timeoutInMillisecondsQuantity: z
      .number()
      .int()
      .min(1_000)
      .max(60_000)
      .default(DEFAULT_HUGGING_FACE_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    maxOutputTokensQuantity: z
      .number()
      .int()
      .min(1)
      .max(4_096)
      .default(DEFAULT_HUGGING_FACE_MAX_TOKENS_QUANTITY),
    temperatureNumeric: z.number().min(0).max(2).default(DEFAULT_HUGGING_FACE_TEMPERATURE_NUMERIC),
    localeIdentifier: SupportedLocaleSchema.default(DEFAULT_LOCALE_IDENTIFIER),
    correlationIdentifier: CorrelationIdentifierSchema.optional(),
  })
  .readonly()
  .describe('Opciones extensibles para conmutación dinámica de modelos y protocolos.');

export type IHuggingFaceDriverOptionsInput = z.input<typeof HuggingFaceDriverOptionsSchema>;
export type IHuggingFaceDriverOptions = z.output<typeof HuggingFaceDriverOptionsSchema>;

/**
 * @name HuggingFaceConfigurationErrorCodeSchema
 * @description Códigos de diagnóstico ante fallos de configuración previa al transporte.
 */
export const HuggingFaceConfigurationErrorCodeSchema = z
  .enum([
    'MISSING_HUGGING_FACE_ACCESS_TOKEN',
    'INVALID_HUGGING_FACE_TOKEN_FORMAT',
    'NON_HTTPS_ENDPOINT_PROHIBITED',
  ])
  .describe('Causa específica del bloqueo preventivo de configuración.');

export type THuggingFaceConfigurationErrorCode = z.infer<
  typeof HuggingFaceConfigurationErrorCodeSchema
>;

/**
 * @name HuggingFaceApiTokenSecretSchema
 * @description Validador nominal del token oficial de Hugging Face (`hf_*`).
 */
export const HuggingFaceApiTokenSecretSchema = z
  .string()
  .trim()
  .startsWith('hf_', { message: 'INVALID_HUGGING_FACE_TOKEN_PREFIX' })
  .min(10, { message: 'HUGGING_FACE_TOKEN_INSUFFICIENT_LENGTH' })
  .brand<'HuggingFaceApiTokenSecret'>()
  .describe('Token secreto de autorización para el enrutador de Hugging Face.');

export type THuggingFaceApiTokenSecret = z.infer<typeof HuggingFaceApiTokenSecretSchema>;

/**
 * @interface IHuggingFaceResolvedConfiguration
 * @description Configuración certificada e inmutable lista para ejecutar transporte HTTP.
 */
export interface IHuggingFaceResolvedConfiguration {
  readonly isConfiguredBoolean: true;
  readonly apiTokenSecret: THuggingFaceApiTokenSecret;
  readonly targetEndpointUrlLiteral: string;
  readonly modelIdentifierLiteral: THuggingFaceModelIdentifier;
  readonly inferenceProtocolLiteral: THuggingFaceInferenceProtocol;
  readonly timeoutInMillisecondsQuantity: number;
  readonly maxOutputTokensQuantity: number;
  readonly temperatureNumeric: number;
}

/**
 * @interface IHuggingFaceUnconfiguredState
 * @description Estado certificado cuando faltan credenciales o el endpoint viola TLS.
 */
export interface IHuggingFaceUnconfiguredState {
  readonly isConfiguredBoolean: false;
  readonly errorCodeLiteral: THuggingFaceConfigurationErrorCode;
  readonly targetEndpointUrlLiteral: string;
  readonly modelIdentifierLiteral: string;
}

export type THuggingFaceConfigurationResolution =
  | IHuggingFaceResolvedConfiguration
  | IHuggingFaceUnconfiguredState;
