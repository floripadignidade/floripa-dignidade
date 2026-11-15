/**
 * @section Security Contingency Contracts - Unauthorized Page Linguistic Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios de la página
 * localizada de acceso no autorizado (`/unauthorized`), incluyendo los literales del
 * banner de alerta de seguridad y la hoja de ruta de verificación `gov.br`.
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
    .min(1, { message: 'UNAUTHORIZED_PAGE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name UnauthorizedPageI18nSchema
 * @description Aduana Zod inmutable para validar los literales de `unauthorized.json`.
 */
export const UnauthorizedPageI18nSchema = z
  .object({
    hero: z
      .object({
        badgeLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta superior de control de acceso perimetral.',
        ),
        headlineLiteral: createRequiredTranslationLiteralSchema(
          'Titular principal claro e institucional sobre restricción de acceso.',
        ),
        descriptionLiteral: createRequiredTranslationLiteralSchema(
          'Explicación accesible sobre los privilegios requeridos para la ruta.',
        ),
        guidanceHintLiteral: createRequiredTranslationLiteralSchema(
          'Orientación para regresar a zonas públicas o recibir alertas.',
        ),
      })
      .readonly(),
    systemAlert: z
      .object({
        titleLiteral: createRequiredTranslationLiteralSchema(
          'Título del banner de alerta de seguridad y verificación pendiente.',
        ),
        descriptionLiteral: createRequiredTranslationLiteralSchema(
          'Detalle sobre el registro de auditoría y la notificación institucional diferida.',
        ),
        roadmapNoteLiteral: createRequiredTranslationLiteralSchema(
          'Aviso sobre la futura integración con gov.br (Prata/Ouro) y solicitud de acceso.',
        ),
      })
      .readonly(),
    actions: z
      .object({
        primaryActionLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta del botón primario para volver al inicio localizado.',
        ),
        secondaryActionLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta del enlace hacia suscripción de alertas públicas.',
        ),
      })
      .readonly(),
    diagnostics: z
      .object({
        originRouteLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta de ruta protegida de origen sanitizada.',
        ),
        traceReferenceLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta del código UUID de seguimiento forense.',
        ),
      })
      .readonly(),
    metadata: z
      .object({
        pageTitleLiteral: createRequiredTranslationLiteralSchema(
          'Título SEO de la página de acceso restringido.',
        ),
        pageDescriptionLiteral: createRequiredTranslationLiteralSchema(
          'Descripción SEO de la página de acceso restringido.',
        ),
      })
      .readonly(),
  })
  .readonly();

export type IUnauthorizedPageI18n = z.infer<typeof UnauthorizedPageI18nSchema>;
