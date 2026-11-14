/**
 * @section AI Providers - Hugging Face Multi-Model Configuration Resolver (Atom)
 * @description Átomo encargado de extraer credenciales mediante `GatherEnvironmentMetadata`,
 * validar la estructura del token (`hf_*`) y transporte HTTPS (ADR 0015), normalizar URLs
 * legadas de `api-inference.huggingface.co` hacia `router.huggingface.co/hf-inference` y
 * resolver dinámicamente el protocolo y modelo destino.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0015).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';

import {
  CANONICAL_HUGGING_FACE_CHAT_COMPLETIONS_URL_LITERAL,
  CANONICAL_HUGGING_FACE_DEFAULT_MODEL_LITERAL,
  HuggingFaceApiTokenSecretSchema,
  HuggingFaceModelIdentifierSchema,
  type IHuggingFaceDriverOptions,
  type THuggingFaceConfigurationResolution,
  type THuggingFaceInferenceProtocol,
} from '../schemas/HuggingFaceInferenceDriver.schema';

const LEGACY_INFERENCE_DOMAIN_LITERAL = 'api-inference.huggingface.co';
const CURRENT_ROUTER_TASK_PREFIX_LITERAL = 'router.huggingface.co/hf-inference';

const normalizeLegacyRouterUrlLiteral = (rawEndpointUrlLiteral: string): string => {
  const trimmedUrlLiteral = rawEndpointUrlLiteral.trim();

  return trimmedUrlLiteral.includes(LEGACY_INFERENCE_DOMAIN_LITERAL)
    ? trimmedUrlLiteral.replace(LEGACY_INFERENCE_DOMAIN_LITERAL, CURRENT_ROUTER_TASK_PREFIX_LITERAL)
    : trimmedUrlLiteral;
};

const resolveEndpointAndProtocol = (
  validatedOptions: IHuggingFaceDriverOptions,
  environmentModelUrlLiteral: string | undefined,
  modelIdentifierLiteral: string,
): {
  readonly targetEndpointUrlLiteral: string;
  readonly inferenceProtocolLiteral: THuggingFaceInferenceProtocol;
} => {
  if (validatedOptions.customRouterEndpointUrlLiteral) {
    const normalizedCustomUrlLiteral = normalizeLegacyRouterUrlLiteral(
      validatedOptions.customRouterEndpointUrlLiteral,
    );
    const inferredProtocolLiteral: THuggingFaceInferenceProtocol =
      validatedOptions.inferenceProtocolLiteral ??
      (normalizedCustomUrlLiteral.includes('/hf-inference/models/')
        ? 'HUGGING_FACE_TASK_API'
        : 'OPENAI_CHAT_COMPLETIONS');

    return {
      targetEndpointUrlLiteral: normalizedCustomUrlLiteral,
      inferenceProtocolLiteral: inferredProtocolLiteral,
    };
  }

  if (environmentModelUrlLiteral && environmentModelUrlLiteral.trim() !== '') {
    const normalizedEnvironmentUrlLiteral = normalizeLegacyRouterUrlLiteral(
      environmentModelUrlLiteral,
    );
    const inferredProtocolLiteral: THuggingFaceInferenceProtocol =
      validatedOptions.inferenceProtocolLiteral ??
      (normalizedEnvironmentUrlLiteral.endsWith('/v1/chat/completions')
        ? 'OPENAI_CHAT_COMPLETIONS'
        : 'HUGGING_FACE_TASK_API');

    return {
      targetEndpointUrlLiteral: normalizedEnvironmentUrlLiteral,
      inferenceProtocolLiteral: inferredProtocolLiteral,
    };
  }

  if (validatedOptions.inferenceProtocolLiteral === 'HUGGING_FACE_TASK_API') {
    return {
      targetEndpointUrlLiteral: `https://${CURRENT_ROUTER_TASK_PREFIX_LITERAL}/models/${modelIdentifierLiteral}`,
      inferenceProtocolLiteral: 'HUGGING_FACE_TASK_API',
    };
  }

  return {
    targetEndpointUrlLiteral: CANONICAL_HUGGING_FACE_CHAT_COMPLETIONS_URL_LITERAL,
    inferenceProtocolLiteral: 'OPENAI_CHAT_COMPLETIONS',
  };
};

/**
 * Resuelve y certifica la configuración operativa multi-modelo para Hugging Face Router.
 *
 * @param validatedOptions - Opciones validadas de invocación del driver.
 * @returns {THuggingFaceConfigurationResolution} Configuración certificada o estado no configurado.
 */
export const ResolveHuggingFaceDriverConfiguration = (
  validatedOptions: IHuggingFaceDriverOptions,
): THuggingFaceConfigurationResolution => {
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawApiTokenCandidate = environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'];

  const resolvedModelIdentifierLiteral = HuggingFaceModelIdentifierSchema.parse(
    validatedOptions.preferredModelIdentifier ?? CANONICAL_HUGGING_FACE_DEFAULT_MODEL_LITERAL,
  );

  const { targetEndpointUrlLiteral, inferenceProtocolLiteral } = resolveEndpointAndProtocol(
    validatedOptions,
    environmentMetadataSnapshot['HUGGING_FACE_MODEL_URL'],
    resolvedModelIdentifierLiteral,
  );

  if (!rawApiTokenCandidate || rawApiTokenCandidate.trim() === '') {
    return Object.freeze({
      isConfiguredBoolean: false,
      errorCodeLiteral: 'MISSING_HUGGING_FACE_ACCESS_TOKEN',
      targetEndpointUrlLiteral,
      modelIdentifierLiteral: resolvedModelIdentifierLiteral,
    });
  }

  const tokenValidationResult = HuggingFaceApiTokenSecretSchema.safeParse(rawApiTokenCandidate);
  if (!tokenValidationResult.success) {
    return Object.freeze({
      isConfiguredBoolean: false,
      errorCodeLiteral: 'INVALID_HUGGING_FACE_TOKEN_FORMAT',
      targetEndpointUrlLiteral,
      modelIdentifierLiteral: resolvedModelIdentifierLiteral,
    });
  }

  if (!targetEndpointUrlLiteral.startsWith('https://')) {
    return Object.freeze({
      isConfiguredBoolean: false,
      errorCodeLiteral: 'NON_HTTPS_ENDPOINT_PROHIBITED',
      targetEndpointUrlLiteral,
      modelIdentifierLiteral: resolvedModelIdentifierLiteral,
    });
  }

  return Object.freeze({
    isConfiguredBoolean: true,
    apiTokenSecret: tokenValidationResult.data,
    targetEndpointUrlLiteral,
    modelIdentifierLiteral: resolvedModelIdentifierLiteral,
    inferenceProtocolLiteral,
    timeoutInMillisecondsQuantity: validatedOptions.timeoutInMillisecondsQuantity,
    maxOutputTokensQuantity: validatedOptions.maxOutputTokensQuantity,
    temperatureNumeric: validatedOptions.temperatureNumeric,
  });
};
