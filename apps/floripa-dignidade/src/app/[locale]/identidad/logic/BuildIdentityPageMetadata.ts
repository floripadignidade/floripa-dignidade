/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/BuildIdentityPageMetadata.ts
 * @section Institutional Identity - SEO & OpenGraph Metadata Builder (Atom)
 * @description Construye dinámicamente los metadatos SEO y OpenGraph para la página
 * institucional de identidad a partir del diccionario localizado resuelto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { Metadata } from 'next';

import { DEFAULT_LOCALE_IDENTIFIER, SupportedLocaleSchema } from '@floripa-dignidade/contracts';

import { LoadIdentityPageDictionary } from './LoadIdentityPageDictionary';

/**
 * Resuelve y sella los metadatos SEO institucionalmente conforme al idioma activo.
 *
 * @param rawLocaleIdentifierLiteral - Segmento BCP 47 recibido en la ruta.
 * @returns {Promise<Metadata>} Metadatos Next.js 16 localizados.
 */
export const BuildIdentityPageMetadata = async (
  rawLocaleIdentifierLiteral: string,
): Promise<Metadata> => {
  const localeValidationResult = SupportedLocaleSchema.safeParse(rawLocaleIdentifierLiteral);
  const resolvedLocaleLiteral = localeValidationResult.success
    ? localeValidationResult.data
    : DEFAULT_LOCALE_IDENTIFIER;

  const dictionarySnapshot = await LoadIdentityPageDictionary(resolvedLocaleLiteral);

  return {
    title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
    description: dictionarySnapshot.metadata.pageDescriptionLiteral,
    alternates: {
      canonical: `/${resolvedLocaleLiteral}/identidad`,
    },
    openGraph: {
      title: `${dictionarySnapshot.metadata.pageTitleLiteral} | Floripa Dignidade`,
      description: dictionarySnapshot.metadata.pageDescriptionLiteral,
      type: 'website',
    },
  };
};
