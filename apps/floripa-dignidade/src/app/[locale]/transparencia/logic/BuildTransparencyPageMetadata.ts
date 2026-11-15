/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/BuildTransparencyPageMetadata.ts
 * @section Transparency Gazette Logic - Dynamic SEO & Hreflang Metadata Builder (Atom)
 * @description Construye dinámicamente los metadatos SEO, enlace canónico, OpenGraph
 * y etiquetas `hreflang` para el Periódico de Transparencia Activa a partir del catálogo
 * único BCP 47 (`@floripa-dignidade/contracts`) y el diccionario localizado resuelto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
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

import { LoadTransparencyPageDictionary } from './LoadTransparencyPageDictionary';

const TRANSPARENCY_ROUTE_SEGMENT_LITERAL = 'transparencia';

/**
 * Genera metadatos SEO localizados y mapa dinámico `hreflang` para todos los idiomas activos.
 *
 * @param rawLocaleIdentifierLiteral - Segmento `[locale]` recibido en la ruta solicitada.
 * @returns {Promise<Metadata>} Contrato de metadatos Next.js 16 validado y localizado.
 */
export const BuildTransparencyPageMetadata = async (
  rawLocaleIdentifierLiteral: string,
): Promise<Metadata> => {
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadTransparencyPageDictionary(resolvedLocaleLiteral);

  const alternateLanguagesMapping: Record<string, string> = {};
  for (const activeLocaleCodeLiteral of SUPPORTED_LOCALE_CODES_COLLECTION) {
    alternateLanguagesMapping[activeLocaleCodeLiteral] =
      `/${activeLocaleCodeLiteral}/${TRANSPARENCY_ROUTE_SEGMENT_LITERAL}`;
  }
  alternateLanguagesMapping['x-default'] =
    `/${DEFAULT_LOCALE_IDENTIFIER}/${TRANSPARENCY_ROUTE_SEGMENT_LITERAL}`;

  const localizedTitleLiteral = `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`;
  const localizedDescriptionLiteral = dictionarySnapshot.metadata.pageDescriptionLiteral;

  return {
    title: localizedTitleLiteral,
    description: localizedDescriptionLiteral,
    alternates: {
      canonical: `/${resolvedLocaleLiteral}/${TRANSPARENCY_ROUTE_SEGMENT_LITERAL}`,
      languages: alternateLanguagesMapping,
    },
    openGraph: {
      title: localizedTitleLiteral,
      description: localizedDescriptionLiteral,
      locale: resolvedLocaleLiteral.replace(/-/g, '_'),
      type: 'website',
    },
  };
};
