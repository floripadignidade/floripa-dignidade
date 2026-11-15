/**
 * @file libs/tools/src/lib/infrastructure-auditor/probes/atoms/ResolveHuggingFaceProbeConfiguration.ts
 * @section Infrastructure Auditor - Hugging Face Probe Configuration Resolver (Atom)
 * @description Átomo de lógica pura encargado de extraer las credenciales y coordenadas de
 * Hugging Face Router desde un snapshot de entorno, normalizar endpoints heredados hacia
 * `router.huggingface.co`, validar formato de token (`hf_*`) y transporte HTTPS (ADR 0015)
 * y construir el payload mínimo de sondeo según el protocolo activo.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const CANONICAL_ROUTER_CHAT_COMPLETIONS_URL_LITERAL =
  'https://router.huggingface.co/v1/chat/completions';
const CANONICAL_DEFAULT_MODEL_IDENTIFIER_LITERAL = 'Qwen/Qwen2.5-7B-Instruct';
const LEGACY_INFERENCE_DOMAIN_LITERAL = 'api-inference.huggingface.co';
const CURRENT_ROUTER_TASK_PREFIX_LITERAL = 'router.huggingface.co/hf-inference';

const HuggingFaceTokenFormatSchema = z.string().trim().startsWith('hf_').min(10);
const HttpsEndpointUrlSchema = z
  .string()
  .trim()
  .url()
  .refine((endpointUrlLiteral: string): boolean => endpointUrlLiteral.startsWith('https://'));

export type THuggingFaceProbeProtocolLiteral = 'OPENAI_CHAT_COMPLETIONS' | 'HUGGING_FACE_TASK_API';

/**
 * @interface IHuggingFaceProbeConfigurationResolution
 * @description Resultado sellado e inmutable de la resolución de credenciales y protocolo.
 */
export interface IHuggingFaceProbeConfigurationResolution {
  readonly isProbeReadyBoolean: boolean;
  readonly hasValidSecretFormatBoolean: boolean;
  readonly apiTokenSecret: string;
  readonly targetEndpointUrlLiteral: string;
  readonly modelIdentifierLiteral: string;
  readonly inferenceProtocolLiteral: THuggingFaceProbeProtocolLiteral;
  readonly serializedProbeBodyLiteral: string;
  readonly failureCodeLiteral?:
    | 'MISSING_HUGGING_FACE_API_TOKEN'
    | 'INVALID_HUGGING_FACE_TOKEN_FORMAT'
    | 'INVALID_HUGGING_FACE_ENDPOINT_URL';
  readonly failureDescriptionLiteral?: string;
}

const normalizeEndpointUrlLiteral = (rawEndpointCandidate: string | undefined): string => {
  const trimmedUrlLiteral = rawEndpointCandidate?.trim() ?? '';
  if (trimmedUrlLiteral.length === 0) {
    return CANONICAL_ROUTER_CHAT_COMPLETIONS_URL_LITERAL;
  }

  return trimmedUrlLiteral.includes(LEGACY_INFERENCE_DOMAIN_LITERAL)
    ? trimmedUrlLiteral.replace(LEGACY_INFERENCE_DOMAIN_LITERAL, CURRENT_ROUTER_TASK_PREFIX_LITERAL)
    : trimmedUrlLiteral;
};

const resolveProtocolAndBody = (
  targetEndpointUrlLiteral: string,
  modelIdentifierLiteral: string,
): {
  readonly inferenceProtocolLiteral: THuggingFaceProbeProtocolLiteral;
  readonly serializedProbeBodyLiteral: string;
} => {
  const isTaskApiEndpointBoolean = targetEndpointUrlLiteral.includes('/hf-inference/models/');

  if (isTaskApiEndpointBoolean) {
    return Object.freeze({
      inferenceProtocolLiteral: 'HUGGING_FACE_TASK_API',
      serializedProbeBodyLiteral: JSON.stringify({
        inputs: 'ping',
        parameters: { max_new_tokens: 1, return_full_text: false },
      }),
    });
  }

  return Object.freeze({
    inferenceProtocolLiteral: 'OPENAI_CHAT_COMPLETIONS',
    serializedProbeBodyLiteral: JSON.stringify({
      model: modelIdentifierLiteral,
      messages: [{ role: 'user', content: 'ping' }],
      max_tokens: 1,
    }),
  });
};

/**
 * Resuelve y valida la configuración física para sondear el enrutador unificado de Hugging Face.
 *
 * @param environmentMetadataSnapshot - Snapshot inmutable de variables de entorno.
 * @returns {IHuggingFaceProbeConfigurationResolution} Configuración validada o estado de rechazo.
 */
export const ResolveHuggingFaceProbeConfiguration = (
  environmentMetadataSnapshot: Readonly<Record<string, string | undefined>>,
): IHuggingFaceProbeConfigurationResolution => {
  const rawApiTokenCandidate = environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN']?.trim() ?? '';
  const rawModelIdentifierCandidate =
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_ID']?.trim() ?? '';
  const modelIdentifierLiteral =
    rawModelIdentifierCandidate.length > 0
      ? rawModelIdentifierCandidate
      : CANONICAL_DEFAULT_MODEL_IDENTIFIER_LITERAL;

  const targetEndpointUrlLiteral = normalizeEndpointUrlLiteral(
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_URL'],
  );

  const { inferenceProtocolLiteral, serializedProbeBodyLiteral } = resolveProtocolAndBody(
    targetEndpointUrlLiteral,
    modelIdentifierLiteral,
  );

  if (rawApiTokenCandidate.length === 0) {
    return Object.freeze({
      isProbeReadyBoolean: false,
      hasValidSecretFormatBoolean: false,
      apiTokenSecret: '',
      targetEndpointUrlLiteral,
      modelIdentifierLiteral,
      inferenceProtocolLiteral,
      serializedProbeBodyLiteral,
      failureCodeLiteral: 'MISSING_HUGGING_FACE_API_TOKEN',
      failureDescriptionLiteral:
        'La variable de entorno HUGGING_FACE_API_TOKEN no está configurada.',
    });
  }

  if (!HuggingFaceTokenFormatSchema.safeParse(rawApiTokenCandidate).success) {
    return Object.freeze({
      isProbeReadyBoolean: false,
      hasValidSecretFormatBoolean: false,
      apiTokenSecret: '',
      targetEndpointUrlLiteral,
      modelIdentifierLiteral,
      inferenceProtocolLiteral,
      serializedProbeBodyLiteral,
      failureCodeLiteral: 'INVALID_HUGGING_FACE_TOKEN_FORMAT',
      failureDescriptionLiteral:
        'La variable HUGGING_FACE_API_TOKEN no cumple el formato institucional (prefijo hf_ y mínimo 10 caracteres).',
    });
  }

  if (!HttpsEndpointUrlSchema.safeParse(targetEndpointUrlLiteral).success) {
    return Object.freeze({
      isProbeReadyBoolean: false,
      hasValidSecretFormatBoolean: true,
      apiTokenSecret: rawApiTokenCandidate,
      targetEndpointUrlLiteral,
      modelIdentifierLiteral,
      inferenceProtocolLiteral,
      serializedProbeBodyLiteral,
      failureCodeLiteral: 'INVALID_HUGGING_FACE_ENDPOINT_URL',
      failureDescriptionLiteral:
        'El endpoint HUGGING_FACE_MODEL_URL debe ser una URI HTTPS válida.',
    });
  }

  return Object.freeze({
    isProbeReadyBoolean: true,
    hasValidSecretFormatBoolean: true,
    apiTokenSecret: rawApiTokenCandidate,
    targetEndpointUrlLiteral,
    modelIdentifierLiteral,
    inferenceProtocolLiteral,
    serializedProbeBodyLiteral,
  });
};
