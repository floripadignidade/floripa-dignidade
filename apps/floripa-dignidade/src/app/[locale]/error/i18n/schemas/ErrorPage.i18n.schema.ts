/**
 * @section Contingency Contracts - Error Page Linguistic Integrity Schema (Atom)
 * @description Define el contrato Zod inmutable para los diccionarios de la página
 * localizada de contingencia ante fallos operativos en gateways o rutas del portal.
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
    .min(1, { message: 'ERROR_PAGE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name ErrorPageI18nSchema
 * @description Aduana Zod inmutable para validar los literales de `error.json`.
 */
export const ErrorPageI18nSchema = z
  .object({
    hero: z
      .object({
        badgeLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta superior de aviso institucional de contingencia.',
        ),
        headlineLiteral: createRequiredTranslationLiteralSchema(
          'Titular principal legible para el ciudadano ante una interrupción temporal.',
        ),
        defaultDescriptionLiteral: createRequiredTranslationLiteralSchema(
          'Descripción genérica de respaldo cuando no hay código específico reconocido.',
        ),
        guidanceHintLiteral: createRequiredTranslationLiteralSchema(
          'Orientación práctica sobre cómo proceder o reintentar la operación.',
        ),
      })
      .readonly(),
    errors: z
      .object({
        CONFIRMATION_FAULT: createRequiredTranslationLiteralSchema(
          'Mensaje específico cuando falla el procesamiento del enlace de confirmación.',
        ),
        GATEWAY_FAULT: createRequiredTranslationLiteralSchema(
          'Mensaje específico ante interrupción temporal de un servicio de entrada.',
        ),
        UNKNOWN_FAULT: createRequiredTranslationLiteralSchema(
          'Mensaje de contingencia ante incidentes técnicos no catalogados.',
        ),
      })
      .readonly(),
    actions: z
      .object({
        primaryActionLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta del botón principal para regresar al inicio localizado.',
        ),
        secondaryActionLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta del enlace secundario hacia el Observatorio de Gastos Públicos.',
        ),
      })
      .readonly(),
    diagnostics: z
      .object({
        errorCodeLabelLiteral: createRequiredTranslationLiteralSchema(
          'Prefijo de etiqueta para el código operativo sanitizado.',
        ),
        traceReferenceLabelLiteral: createRequiredTranslationLiteralSchema(
          'Prefijo de etiqueta para el UUID de trazabilidad forense.',
        ),
      })
      .readonly(),
    metadata: z
      .object({
        pageTitleLiteral: createRequiredTranslationLiteralSchema(
          'Título SEO de la página de contingencia.',
        ),
        pageDescriptionLiteral: createRequiredTranslationLiteralSchema(
          'Descripción SEO de la página de contingencia.',
        ),
      })
      .readonly(),
  })
  .readonly();

export type IErrorPageI18n = z.infer<typeof ErrorPageI18nSchema>;
