/**
 * @section Observatory Logic - Dynamic SEO & Hreflang Metadata Builder (Atom)
 * @description Construye dinámicamente los metadatos SEO, enlaces canónicos, etiquetas
 * `hreflang` y OpenGraph del Observatorio de Gastos Públicos a partir del catálogo único
 * BCP 47 (`@floripa-dignidade/contracts`) y del diccionario localizado resuelto por
 * `LoadObservatoryDictionary`, erradicando mapas de títulos fijos (ADR 0030 / SEO).
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

import { LoadObservatoryDictionary } from './LoadObservatoryDictionary';

const OBSERVATORY_ROUTE_SUFFIX_LITERAL = 'observatorio/gastos-publicos';

/**
 * Genera metadatos SEO localizados y etiquetas `hreflang` dinámicas para el observatorio.
 * Si el segmento `[locale]` recibido no corresponde a un idioma habilitado, conmuta al
 * idioma fuente por defecto para evitar colapsos durante la resolución de metadatos.
 *
 * @param rawLocaleIdentifierLiteral - Segmento dinámico `[locale]` de la ruta solicitada.
 * @returns {Promise<Metadata>} Contrato de metadatos Next.js 16 validado y localizado.
 */
export const BuildObservatoryMetadata = async (
  rawLocaleIdentifierLiteral: string,
): Promise<Metadata> => {
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadObservatoryDictionary(resolvedLocaleLiteral);

  const alternateLanguagesMapping: Record<string, string> = {};
  for (const activeLocaleCodeLiteral of SUPPORTED_LOCALE_CODES_COLLECTION) {
    alternateLanguagesMapping[activeLocaleCodeLiteral] =
      `/${activeLocaleCodeLiteral}/${OBSERVATORY_ROUTE_SUFFIX_LITERAL}`;
  }
  alternateLanguagesMapping['x-default'] =
    `/${DEFAULT_LOCALE_IDENTIFIER}/${OBSERVATORY_ROUTE_SUFFIX_LITERAL}`;

  const localizedTitleLiteral = `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`;
  const localizedDescriptionLiteral = dictionarySnapshot.metadata.pageDescriptionLiteral;

  return {
    title: localizedTitleLiteral,
    description: localizedDescriptionLiteral,
    alternates: {
      canonical: `/${resolvedLocaleLiteral}/${OBSERVATORY_ROUTE_SUFFIX_LITERAL}`,
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
