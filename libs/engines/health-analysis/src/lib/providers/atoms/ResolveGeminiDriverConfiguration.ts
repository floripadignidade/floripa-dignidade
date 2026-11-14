/**
 * @section AI Providers - Google Gemini Configuration Resolver (Atom)
 * @description Extrae `GOOGLE_GEMINI_API_KEY` mediante `GatherEnvironmentMetadata`,
 * valida claves Standard (`AIza*`) y Auth Keys (`AQ.*`) de Google AI Studio y construye
 * el endpoint HTTPS v1beta para el modelo Gemini solicitado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0015).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';

import {
  CANONICAL_GEMINI_API_BASE_URL_LITERAL,
  CANONICAL_GEMINI_DEFAULT_MODEL_LITERAL,
  GeminiApiKeySecretSchema,
  GeminiModelIdentifierSchema,
  type IGoogleGeminiDriverOptions,
  type TGoogleGeminiConfigurationResolution,
} from '../schemas/GoogleGeminiInferenceDriver.schema';

/**
 * Resuelve y certifica la configuración operativa para Google Gemini API.
 *
 * @param validatedOptions - Opciones validadas de modelo, tokens máximos y temperatura.
 * @returns {TGoogleGeminiConfigurationResolution} Configuración certificada o estado no configurado.
 */
export const ResolveGeminiDriverConfiguration = (
  validatedOptions: IGoogleGeminiDriverOptions,
): TGoogleGeminiConfigurationResolution => {
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawApiKeyCandidate = environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'];

  const resolvedModelIdentifierLiteral = GeminiModelIdentifierSchema.parse(
    validatedOptions.preferredModelIdentifier ??
      environmentMetadataSnapshot['GOOGLE_GEMINI_MODEL_ID'] ??
      CANONICAL_GEMINI_DEFAULT_MODEL_LITERAL,
  );

  const targetEndpointUrlLiteral = `${CANONICAL_GEMINI_API_BASE_URL_LITERAL}/${resolvedModelIdentifierLiteral}:generateContent`;

  if (!rawApiKeyCandidate || rawApiKeyCandidate.trim() === '') {
    return Object.freeze({
      isConfiguredBoolean: false,
      errorCodeLiteral: 'MISSING_GOOGLE_GEMINI_API_KEY',
      modelIdentifierLiteral: resolvedModelIdentifierLiteral,
      targetEndpointUrlLiteral,
    });
  }

  const keyValidationResult = GeminiApiKeySecretSchema.safeParse(rawApiKeyCandidate);
  if (!keyValidationResult.success) {
    return Object.freeze({
      isConfiguredBoolean: false,
      errorCodeLiteral: 'INVALID_GOOGLE_GEMINI_API_KEY_FORMAT',
      modelIdentifierLiteral: resolvedModelIdentifierLiteral,
      targetEndpointUrlLiteral,
    });
  }

  return Object.freeze({
    isConfiguredBoolean: true,
    apiKeySecret: keyValidationResult.data,
    modelIdentifierLiteral: resolvedModelIdentifierLiteral,
    targetEndpointUrlLiteral,
    timeoutInMillisecondsQuantity: validatedOptions.timeoutInMillisecondsQuantity,
    maxOutputTokensQuantity: validatedOptions.maxOutputTokensQuantity,
    temperatureNumeric: validatedOptions.temperatureNumeric,
  });
};
