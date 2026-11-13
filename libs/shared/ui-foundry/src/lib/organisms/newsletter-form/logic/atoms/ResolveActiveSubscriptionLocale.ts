/**
 * @section Shared UI Foundry - Active Locale Resolver (Atom)
 * @description Átomo de lógica pura encargado de determinar el código BCP 47 activo
 * para solicitudes de suscripción en cualquier aplicación consumidora (Next.js App Router,
 * CMS o SPAs independientes). Prioriza el segmento de ruta localizado sobre el atributo
 * `<html lang>` y consulta dinámicamente `SUPPORTED_LOCALES_REGISTRY` (`@floripa-dignidade/contracts`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  DEFAULT_LOCALE_IDENTIFIER,
  SUPPORTED_LOCALES_REGISTRY,
  SupportedLocaleSchema,
  type TSupportedLocale,
} from '@floripa-dignidade/contracts';

const ISO_639_BASE_CODE_REGEX = /^[a-z]{2,3}$/i;

const findExactActiveLocale = (lowerCasedTagLiteral: string): TSupportedLocale | null => {
  const exactActiveEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.isEnabledBoolean &&
      entrySnapshot.localeCodeLiteral.toLowerCase() === lowerCasedTagLiteral,
  );

  return exactActiveEntry !== undefined
    ? SupportedLocaleSchema.parse(exactActiveEntry.localeCodeLiteral)
    : null;
};

const findPlannedLocaleFallback = (lowerCasedTagLiteral: string): TSupportedLocale | null => {
  const plannedCatalogedEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) => entrySnapshot.localeCodeLiteral.toLowerCase() === lowerCasedTagLiteral,
  );

  if (plannedCatalogedEntry === undefined) {
    return null;
  }

  const fallbackValidation = SupportedLocaleSchema.safeParse(
    plannedCatalogedEntry.fallbackLocaleIdentifier,
  );

  return fallbackValidation.success ? fallbackValidation.data : null;
};

const resolveCatalogedLocaleCandidate = (
  rawCandidateLiteral: string | undefined,
  isCompoundBaseFallbackAllowedBoolean: boolean,
): TSupportedLocale | null => {
  if (!rawCandidateLiteral || rawCandidateLiteral.trim() === '') {
    return null;
  }

  const lowerCasedTagLiteral = rawCandidateLiteral.trim().replace(/_/g, '-').toLowerCase();

  const exactLocaleMatch = findExactActiveLocale(lowerCasedTagLiteral);
  if (exactLocaleMatch !== null) {
    return exactLocaleMatch;
  }

  const plannedLocaleFallback = findPlannedLocaleFallback(lowerCasedTagLiteral);
  if (plannedLocaleFallback !== null) {
    return plannedLocaleFallback;
  }

  const isPureBaseCodeBoolean = ISO_639_BASE_CODE_REGEX.test(lowerCasedTagLiteral);
  if (!isPureBaseCodeBoolean && !isCompoundBaseFallbackAllowedBoolean) {
    return null;
  }

  const baseLanguageCodeLiteral = lowerCasedTagLiteral.split('-')[0] ?? '';
  const baseLanguageActiveEntry = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.isEnabledBoolean &&
      entrySnapshot.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCodeLiteral,
  );

  return baseLanguageActiveEntry !== undefined
    ? SupportedLocaleSchema.parse(baseLanguageActiveEntry.localeCodeLiteral)
    : null;
};

const validateExplicitLocaleOverride = (
  explicitLocaleOverride: TSupportedLocale | undefined,
): TSupportedLocale | null => {
  if (explicitLocaleOverride === undefined) {
    return null;
  }

  const overrideValidation = SupportedLocaleSchema.safeParse(explicitLocaleOverride);
  return overrideValidation.success ? overrideValidation.data : null;
};

const extractRouteFirstSegmentLiteral = (): string | undefined => {
  if (typeof globalThis === 'undefined' || !('location' in globalThis)) {
    return undefined;
  }

  return globalThis.location.pathname?.split('/').filter(Boolean)[0];
};

const extractDocumentLanguageLiteral = (): string | undefined => {
  if (typeof globalThis === 'undefined' || !('document' in globalThis)) {
    return undefined;
  }

  return globalThis.document.documentElement?.lang;
};

const extractNavigatorLanguageLiteral = (): string | undefined => {
  if (typeof globalThis === 'undefined' || !('navigator' in globalThis)) {
    return undefined;
  }

  return globalThis.navigator.language;
};

/**
 * Resuelve de forma determinista el idioma activo BCP 47 siguiendo la cascada:
 * 1. Override explícito del consumidor validado contra `SupportedLocaleSchema`.
 * 2. Primer segmento de ruta (`/pt-BR/...`, evitando falsos positivos en slugs).
 * 3. Atributo `<html lang="...">` del documento activo.
 * 4. Idioma principal del navegador (`navigator.language`).
 * 5. `DEFAULT_LOCALE_IDENTIFIER` del registro SSOT.
 *
 * @param explicitLocaleOverride - Código BCP 47 opcional provisto por el consumidor.
 * @returns {TSupportedLocale} Código BCP 47 habilitado y sellado nominalmente.
 */
export const ResolveActiveSubscriptionLocale = (
  explicitLocaleOverride?: TSupportedLocale,
): TSupportedLocale => {
  const validatedOverride = validateExplicitLocaleOverride(explicitLocaleOverride);
  if (validatedOverride !== null) {
    return validatedOverride;
  }

  const routeLocaleMatch = resolveCatalogedLocaleCandidate(
    extractRouteFirstSegmentLiteral(),
    false,
  );
  if (routeLocaleMatch !== null) {
    return routeLocaleMatch;
  }

  const secondaryCandidatesCollection = [
    extractDocumentLanguageLiteral(),
    extractNavigatorLanguageLiteral(),
  ];

  for (const candidateLiteral of secondaryCandidatesCollection) {
    const resolvedLocale = resolveCatalogedLocaleCandidate(candidateLiteral, true);
    if (resolvedLocale !== null) {
      return resolvedLocale;
    }
  }

  return DEFAULT_LOCALE_IDENTIFIER;
};
