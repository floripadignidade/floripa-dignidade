/**
 * @section Newsletter Invalid Token Contracts - Linguistic Integrity Schema (Atom)
 * @description Define el contrato Zod inmutable para los diccionarios de la página de
 * contingencia ante enlaces de confirmación expirados, ya utilizados o malformados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name NewsletterInvalidTokenI18nSchema
 * @description Aduana Zod inmutable para validar los literales de `invalidToken.json`.
 */
export const NewsletterInvalidTokenI18nSchema = z
  .object({
    hero: z
      .object({
        badgeLabelLiteral: z.string().trim().min(1),
        headlineLiteral: z.string().trim().min(1),
        descriptionLiteral: z.string().trim().min(1),
        guidanceHintLiteral: z.string().trim().min(1),
      })
      .readonly(),
    actions: z
      .object({
        primaryActionLabelLiteral: z.string().trim().min(1),
        secondaryActionLabelLiteral: z.string().trim().min(1),
      })
      .readonly(),
    diagnostics: z
      .object({
        traceReferenceLabelLiteral: z.string().trim().min(1),
      })
      .readonly(),
    metadata: z
      .object({
        pageTitleLiteral: z.string().trim().min(1),
        pageDescriptionLiteral: z.string().trim().min(1),
      })
      .readonly(),
  })
  .readonly();

export type INewsletterInvalidTokenI18n = z.infer<typeof NewsletterInvalidTokenI18nSchema>;
