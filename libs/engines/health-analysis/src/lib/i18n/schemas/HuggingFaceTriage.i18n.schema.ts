/**
 * @section Cognitive Analysis Contracts - Hugging Face Triage Linguistic Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios localizados del
 * motor de triaje de respuestas HTTP de Hugging Face Router. Garantiza paridad
 * estructural para observaciones nominales, fallos de estado HTTP y señales SRE.
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
    .min(1, { message: 'HUGGING_FACE_TRIAGE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name HuggingFaceTriageI18nSchema
 * @description Aduana Zod inmutable para validar los diccionarios de `huggingFaceTriage.json`.
 */
export const HuggingFaceTriageI18nSchema = z
  .object({
    observations: z
      .object({
        nominalInferenceFallbackLiteral: createRequiredTranslationLiteralSchema(
          'Observación de respaldo cuando la respuesta HTTP 200 carece de texto extraíble.',
        ),
        malformedSuccessPayloadLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando el enrutador responde HTTP 200 pero el cuerpo JSON está corrupto.',
        ),
        coldStartLoadingLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando el modelo está inicializándose en frío (HTTP 503).',
        ),
        authenticationRejectedLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando el enrutador rechaza HUGGING_FACE_API_TOKEN (HTTP 401/403).',
        ),
        rateLimitExceededLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando se excede la cuota temporal del proveedor (HTTP 429).',
        ),
        modelUnsupportedOrInvalidLiteral: createRequiredTranslationLiteralSchema(
          'Observación cuando el modelo no está soportado o la petición es inválida (HTTP 400/404/422).',
        ),
        unexpectedHttpErrorLiteral: createRequiredTranslationLiteralSchema(
          'Observación genérica ante otros errores HTTP devueltos por el enrutador.',
        ),
      })
      .readonly(),
    telemetry: z
      .object({
        inferenceSuccessLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando una inferencia concluye con cuerpo válido.',
        ),
        inferenceDegradedLatencyLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando una inferencia válida excede el umbral de latencia.',
        ),
        malformedPayloadWarningLiteral: createRequiredTranslationLiteralSchema(
          'Alerta cuando una respuesta HTTP 200 no puede parsearse como JSON válido.',
        ),
      })
      .readonly(),
  })
  .readonly()
  .describe('Contrato lingüístico integral del motor de triaje HTTP Hugging Face.');

export type IHuggingFaceTriageI18n = z.infer<typeof HuggingFaceTriageI18nSchema>;
