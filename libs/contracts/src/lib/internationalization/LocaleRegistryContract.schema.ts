/**
 * @section Internationalization Contracts - Locale Registry Entry Schema
 * @description Define los contratos Zod inmutables para describir idiomas y variantes
 * regionales conforme a BCP 47, ISO 639-1, ISO 3166-1, UN M.49 e ISO 15924.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

const BCP47_LOCALE_CODE_REGEX = /^[a-z]{2,3}(?:-[A-Za-z0-9]{2,8})*$/;
const ISO_639_LANGUAGE_CODE_REGEX = /^[a-z]{2,3}$/;
const ISO_REGION_OR_SCRIPT_CODE_REGEX = /^(?:[A-Z]{2}|[0-9]{3}|[A-Z][a-z]{3}(?:-[A-Z]{2})?)$/;

/**
 * @name LocaleTextDirectionSchema
 * @description Dirección tipográfica admitida para renderizado HTML (`dir="ltr" | "rtl"`).
 */
export const LocaleTextDirectionSchema = z
  .enum(['ltr', 'rtl'])
  .describe('Dirección de escritura del idioma para conformidad de renderizado HTML y WCAG.');

export type TLocaleTextDirection = z.infer<typeof LocaleTextDirectionSchema>;

/**
 * @name LocaleRegistryEntrySchema
 * @description Contrato estructural inmutable para cada entrada de idioma en el catálogo único.
 */
export const LocaleRegistryEntrySchema = z
  .object({
    localeCodeLiteral: z
      .string()
      .regex(BCP47_LOCALE_CODE_REGEX, { message: 'INVALID_BCP47_LOCALE_CODE_FORMAT' })
      .describe('Código lingüístico normalizado bajo estándar BCP 47 (ejemplo: pt-BR, es-419).'),

    iso639LanguageCodeLiteral: z
      .string()
      .regex(ISO_639_LANGUAGE_CODE_REGEX, { message: 'INVALID_ISO_639_LANGUAGE_CODE' })
      .describe('Subetiqueta base de idioma conforme a la norma ISO 639-1 / ISO 639-2.'),

    iso3166RegionOrScriptCodeLiteral: z
      .string()
      .regex(ISO_REGION_OR_SCRIPT_CODE_REGEX, { message: 'INVALID_ISO_REGION_OR_SCRIPT_CODE' })
      .describe('Subetiqueta geográfica (ISO 3166-1 / UN M.49) o de escritura (ISO 15924).'),

    nativeLabelLiteral: z
      .string()
      .min(2, { message: 'LOCALE_NATIVE_LABEL_TOO_SHORT' })
      .describe('Nombre autónimo del idioma y variante para el selector de interfaz.'),

    textDirectionLiteral: LocaleTextDirectionSchema,

    isEnabledBoolean: z
      .boolean()
      .describe('Determina si el idioma está habilitado para rutas y compilación de diccionarios.'),

    isDefaultBoolean: z
      .boolean()
      .describe('Identifica el idioma canónico fuente de verdad del ecosistema.'),

    fallbackLocaleIdentifier: z
      .string()
      .regex(BCP47_LOCALE_CODE_REGEX, { message: 'INVALID_FALLBACK_LOCALE_CODE_FORMAT' })
      .describe('Código BCP 47 de respaldo ante ausencia de traducción secundaria.'),
  })
  .readonly();

export type ILocaleRegistryEntry = z.infer<typeof LocaleRegistryEntrySchema>;
