/**
 * @section Cognitive Analysis Contracts - Google Gemini Driver Linguistic Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios localizados del
 * adaptador de inferencia Google Gemini (`@floripa-dignidade/health-analysis-engine`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'GEMINI_DRIVER_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name GeminiDriverI18nSchema
 * @description Aduana Zod inmutable para validar los diccionarios de `geminiDriver.json`.
 */
export const GeminiDriverI18nSchema = z
  .object({
    observations: z
      .object({
        nominalInferenceFallbackLiteral: createRequiredTranslationLiteralSchema(
          'Observación de respaldo cuando la respuesta exitosa no contiene texto en candidates.',
        ),
        missingCredentialsLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando GOOGLE_GEMINI_API_KEY no está configurado.',
        ),
        invalidKeyFormatLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando la clave de Gemini no coincide con AIza o AQ.',
        ),
        malformedResponseLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando Google Gemini responde HTTP 200 con cuerpo JSON corrupto.',
        ),
        authenticationRejectedLiteral: createRequiredTranslationLiteralSchema(
          'Observación ante rechazo de clave o permisos (HTTP 400/401/403).',
        ),
        rateLimitExceededLiteral: createRequiredTranslationLiteralSchema(
          'Observación ante agotamiento temporal de cuota gratuita o RPM/RPD (HTTP 429).',
        ),
        modelUnavailableLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando el modelo solicitado fue retirado o no existe (HTTP 404).',
        ),
        unexpectedHttpErrorLiteral: createRequiredTranslationLiteralSchema(
          'Observación ante códigos HTTP inesperados del servicio de Google.',
        ),
        networkTimeoutLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando expira el timeout configurado para la llamada HTTP.',
        ),
        networkFailureLiteral: createRequiredTranslationLiteralSchema(
          'Observación ante fallo de conectividad o serialización de carga útil.',
        ),
      })
      .readonly(),
    telemetry: z
      .object({
        credentialsRejectedLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando faltan credenciales válidas para Google Gemini.',
        ),
        inferenceSuccessLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando la inferencia con Google Gemini finaliza con éxito.',
        ),
        inferenceFailureLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando la API de Google Gemini responde con error HTTP.',
        ),
        networkCollapseLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico crítico cuando colapsa la conexión de red con Google Gemini.',
        ),
      })
      .readonly(),
  })
  .readonly()
  .describe('Contrato lingüístico integral para el adaptador de inferencia Google Gemini.');

export type IGeminiDriverI18n = z.infer<typeof GeminiDriverI18nSchema>;
