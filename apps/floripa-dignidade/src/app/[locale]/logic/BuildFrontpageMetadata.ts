/**
 * @section Frontpage Logic - Dynamic SEO & Hreflang Metadata Builder (Atom)
 * @description Construye dinámicamente los metadatos SEO, OpenGraph y enlaces `hreflang`
 * de la Frontpage a partir del catálogo único BCP 47 (`@floripa-dignidade/contracts`) y
 * del diccionario localizado resuelto por `LoadFrontpageDictionaries`, eliminando títulos
 * y descripciones hardcodeadas en un solo idioma (ADR 0030 / `seo-performance.md`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { Metadata } from 'next';

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALE_CODES_COLLECTION,
  SupportedLocaleSchema,
} from '@floripa-dignidade/contracts';

import { LoadFrontpageDictionaries } from './LoadFrontpageDictionaries';

/**
 * Genera metadatos SEO localizados y etiquetas `hreflang` dinámicas para la Frontpage.
 *
 * @param rawLocaleIdentifierLiteral - Segmento `[locale]` recibido en la ruta solicitada.
 * @returns {Promise<Metadata>} Contrato de metadatos Next.js 16 validado y localizado.
 */
export const BuildFrontpageMetadata = async (
  rawLocaleIdentifierLiteral: string,
): Promise<Metadata> => {
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const { localizedContent } = await LoadFrontpageDictionaries(resolvedLocaleLiteral);

  const alternateLanguagesMapping: Record<string, string> = {};
  for (const activeLocaleCodeLiteral of SUPPORTED_LOCALE_CODES_COLLECTION) {
    alternateLanguagesMapping[activeLocaleCodeLiteral] = `/${activeLocaleCodeLiteral}`;
  }
  alternateLanguagesMapping['x-default'] = `/${DEFAULT_LOCALE_IDENTIFIER}`;

  const localizedTitleLiteral = `${localizedContent.hero.headlineMainLiteral} ${localizedContent.hero.headlineAccentLiteral} | Floripa Dignidade`;
  const localizedDescriptionLiteral = localizedContent.hero.descriptionLiteral;

  return {
    title: localizedTitleLiteral,
    description: localizedDescriptionLiteral,
    alternates: {
      canonical: `/${resolvedLocaleLiteral}`,
      languages: alternateLanguagesMapping,
    },
    openGraph: {
      title: localizedTitleLiteral,
      description: localizedDescriptionLiteral,
      locale: resolvedLocaleLiteral.replace('-', '_'),
      type: 'website',
    },
  };
};
