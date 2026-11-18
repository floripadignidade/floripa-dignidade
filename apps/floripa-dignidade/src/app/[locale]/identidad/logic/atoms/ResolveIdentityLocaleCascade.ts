/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/logic/atoms/ResolveIdentityLocaleCascade.ts
 * @section Institutional Identity - Locale Cascade Resolver (Atom)
 * @description Átomo de lógica pura encargado de construir la secuencia ordenada y sin
 * duplicados de códigos BCP 47 para la resolución resiliente de diccionarios (ADR 0030):
 * `locale solicitado -> variante activa del idioma base -> idioma fuente por defecto`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_REGISTRY,
} from '@floripa-dignidade/contracts';

/**
 * Construye la cascada determinista de candidatos lingüísticos activos en el registro SSOT.
 *
 * @param requestedLocaleLiteral - Código BCP 47 validado contra `SupportedLocaleSchema`.
 * @returns {readonly string[]} Colección inmutable y deduplicada de códigos BCP 47 candidatos.
 */
export const ResolveIdentityLocaleCascade = (requestedLocaleLiteral: string): readonly string[] => {
  const baseLanguageCodeLiteral = requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? '';

  const matchingBaseEntrySnapshot = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.isEnabledBoolean &&
      entrySnapshot.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCodeLiteral,
  );

  const orderedCandidatesCollection = [
    requestedLocaleLiteral,
    matchingBaseEntrySnapshot?.localeCodeLiteral,
    DEFAULT_LOCALE_IDENTIFIER,
  ].filter(
    (candidateLocaleLiteral): candidateLocaleLiteral is string =>
      typeof candidateLocaleLiteral === 'string' && candidateLocaleLiteral.length > 0,
  );

  return Object.freeze(Array.from(new Set(orderedCandidatesCollection)));
};
