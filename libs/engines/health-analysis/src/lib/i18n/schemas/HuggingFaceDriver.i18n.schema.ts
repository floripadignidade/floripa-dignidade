/**
 * @section Cognitive Analysis Contracts - Hugging Face Driver Linguistic Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios localizados del
 * adaptador de inferencia multi-modelo Hugging Face Router (`@floripa-dignidade/health-analysis-engine`).
 * Garantiza paridad estructural entre los mensajes de diagnóstico, fallos de red y alertas
 * operativas en todos los idiomas habilitados del ecosistema.
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
    .min(1, { message: 'HUGGING_FACE_DRIVER_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name HuggingFaceDriverI18nSchema
 * @description Aduana Zod inmutable para validar los diccionarios de `huggingFaceDriver.json`.
 */
export const HuggingFaceDriverI18nSchema = z
  .object({
    observations: z
      .object({
        missingCredentialsLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando HUGGING_FACE_API_TOKEN no está configurado.',
        ),
        invalidTokenFormatLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando el token no cumple el formato institucional.',
        ),
        invalidEndpointProtocolLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando el endpoint configurado incumple el requisito HTTPS TLS.',
        ),
        networkTimeoutLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada cuando el proveedor excede el tiempo máximo de respuesta.',
        ),
        networkFailureLiteral: createRequiredTranslationLiteralSchema(
          'Observación retornada ante un fallo de conectividad o serialización con el enrutador.',
        ),
      })
      .readonly()
      .describe('Mensajes descriptivos inyectados en respuestas degradadas de inferencia.'),
    telemetry: z
      .object({
        credentialsRejectedLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico cuando la configuración o credenciales impiden iniciar la consulta.',
        ),
        networkCollapseLiteral: createRequiredTranslationLiteralSchema(
          'Registro telemétrico crítico cuando colapsa la comunicación HTTP con Hugging Face Router.',
        ),
      })
      .readonly()
      .describe('Mensajes técnicos emitidos hacia el bus de observabilidad.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral para el adaptador de inferencia Hugging Face.');

export type IHuggingFaceDriverI18n = z.infer<typeof HuggingFaceDriverI18nSchema>;
