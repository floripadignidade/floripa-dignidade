/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/i18n/schemas/IdentityPage.i18n.schema.ts
 * @section Institutional Identity - Linguistic Schema (Atom)
 * @description Contrato Zod inmutable para validar los diccionarios de la página de
 * identidad institucional de Floripa Dignidade (MROSC Lei 13.019/2014 y pilares de impacto).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const createRequiredLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'IDENTITY_PAGE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name IdentityPillarI18nSchema
 * @description Esquema para cada uno de los 3 pilares institucionales (Pão, Teto, Lei).
 */
export const IdentityPillarI18nSchema = z
  .object({
    identifier: z.string().trim().min(1),
    titleLiteral: createRequiredLiteralSchema('Título del pilar institucional.'),
    subtitleLiteral: createRequiredLiteralSchema('Subtítulo descriptivo del pilar.'),
    descriptionLiteral: createRequiredLiteralSchema('Detalle operativo y alcance del pilar.'),
  })
  .readonly();

export type IIdentityPillarI18n = z.infer<typeof IdentityPillarI18nSchema>;

/**
 * @name IdentityPageI18nSchema
 * @description Contrato maestro de validación para `identity.json`.
 */
export const IdentityPageI18nSchema = z
  .object({
    hero: z
      .object({
        badgeLabelLiteral: createRequiredLiteralSchema('Etiqueta superior de soberanía civil.'),
        headlineMainLiteral: createRequiredLiteralSchema('Titular principal de la misión.'),
        headlineAccentLiteral: createRequiredLiteralSchema('Frase acentuada de impacto.'),
        descriptionLiteral: createRequiredLiteralSchema('Resumen ontológico institucional.'),
      })
      .readonly(),
    framework: z
      .object({
        badgeLiteral: createRequiredLiteralSchema('Etiqueta del marco legal MROSC.'),
        headlineLiteral: createRequiredLiteralSchema('Título de la sección jurídica.'),
        descriptionLiteral: createRequiredLiteralSchema(
          'Explicación del encuadre en Lei 13.019/2014.',
        ),
        legalFormLiteral: createRequiredLiteralSchema('Figura jurídica de la organización.'),
        territorialJurisdictionLiteral: createRequiredLiteralSchema(
          'Jurisdicción territorial oficial.',
        ),
      })
      .readonly(),
    pillarsSection: z
      .object({
        badgeLiteral: createRequiredLiteralSchema('Etiqueta de los pilares de acción.'),
        headlineLiteral: createRequiredLiteralSchema('Título de la tríada de impacto.'),
        descriptionLiteral: createRequiredLiteralSchema(
          'Descripción de la tríada Pão, Teto e Lei.',
        ),
        pillarsCollection: z.array(IdentityPillarI18nSchema).min(3).max(3).readonly(),
      })
      .readonly(),
    actions: z
      .object({
        primaryCtaLabelLiteral: createRequiredLiteralSchema(
          'Etiqueta de acción hacia el Observatorio.',
        ),
        secondaryCtaLabelLiteral: createRequiredLiteralSchema(
          'Etiqueta de acción hacia denuncias.',
        ),
      })
      .readonly(),
    metadata: z
      .object({
        pageTitleLiteral: createRequiredLiteralSchema('Título SEO de la página de identidad.'),
        pageDescriptionLiteral: createRequiredLiteralSchema('Descripción SEO institucional.'),
      })
      .readonly(),
  })
  .readonly();

export type IIdentityPageI18n = z.infer<typeof IdentityPageI18nSchema>;
