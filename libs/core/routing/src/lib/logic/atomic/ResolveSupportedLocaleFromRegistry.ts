/**
 * @section Routing Logic - Supported Locale Registry Resolver Atom
 * @description Átomo de lógica pura encargado de resolver el mejor idioma activo
 * a partir de candidatos BCP 47 ordenados, aplicando cascada de compatibilidad
 * contra `SUPPORTED_LOCALES_REGISTRY` (ADR 0030):
 * 1. Coincidencia exacta con idioma activo (`isEnabledBoolean: true`).
 * 2. Variante regional catalogada hacia su `fallbackLocaleIdentifier` activo.
 * 3. Coincidencia por subetiqueta base ISO 639 hacia idioma activo equivalente.
 * 4. Retorno de respaldo institucional por defecto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { SUPPORTED_LOCALES_REGISTRY, SupportedLocaleSchema } from '@floripa-dignidade/contracts';
import type { ISupportedLocale } from '@floripa-dignidade/contracts';

import type { IAcceptLanguageCandidate } from './ParseAcceptLanguageHeader';

/**
 * @interface ILocaleResolutionResult
 * @description Snapshot inmutable del resultado de resolución lingüística.
 */
export interface ILocaleResolutionResult {
  readonly resolvedLocaleIdentifier: ISupportedLocale;
  readonly resolutionStrategyLiteral:
    | 'EXACT_ACTIVE_MATCH'
    | 'PLANNED_VARIANT_FALLBACK'
    | 'BASE_LANGUAGE_MATCH'
    | 'DEFAULT_FALLBACK';
  readonly matchedCandidateLiteral: string | null;
}

const tryExactActiveLocaleMatch = (candidateTagLiteral: string): ISupportedLocale | null => {
  const validationResult = SupportedLocaleSchema.safeParse(candidateTagLiteral);
  return validationResult.success ? validationResult.data : null;
};

const tryPlannedVariantFallbackMatch = (candidateTagLiteral: string): ISupportedLocale | null => {
  const catalogedEntrySnapshot = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.localeCodeLiteral.toLowerCase() === candidateTagLiteral.toLowerCase(),
  );

  if (catalogedEntrySnapshot === undefined) {
    return null;
  }

  return tryExactActiveLocaleMatch(catalogedEntrySnapshot.fallbackLocaleIdentifier);
};

const tryBaseLanguageMatch = (candidateTagLiteral: string): ISupportedLocale | null => {
  const baseLanguageCodeLiteral = candidateTagLiteral.split('-')[0]?.toLowerCase();
  if (!baseLanguageCodeLiteral) {
    return null;
  }

  const matchingActiveEntrySnapshot = SUPPORTED_LOCALES_REGISTRY.find(
    (entrySnapshot) =>
      entrySnapshot.isEnabledBoolean &&
      entrySnapshot.iso639LanguageCodeLiteral.toLowerCase() === baseLanguageCodeLiteral,
  );

  if (matchingActiveEntrySnapshot === undefined) {
    return null;
  }

  return tryExactActiveLocaleMatch(matchingActiveEntrySnapshot.localeCodeLiteral);
};

/**
 * Evalúa secuencialmente los candidatos lingüísticos hasta obtener un idioma activo válido.
 *
 * @param orderedCandidatesCollection - Candidatos ordenados por peso de preferencia.
 * @param fallbackLocaleIdentifier - Idioma de respaldo garantizado en ausencia de coincidencia.
 * @returns {ILocaleResolutionResult} Resultado sellado con estrategia y candidato aplicado.
 */
export const ResolveSupportedLocaleFromRegistry = (
  orderedCandidatesCollection: readonly IAcceptLanguageCandidate[],
  fallbackLocaleIdentifier: ISupportedLocale,
): ILocaleResolutionResult => {
  for (const candidateSnapshot of orderedCandidatesCollection) {
    const exactLocaleMatch = tryExactActiveLocaleMatch(
      candidateSnapshot.normalizedLocaleTagLiteral,
    );
    if (exactLocaleMatch !== null) {
      return Object.freeze({
        resolvedLocaleIdentifier: exactLocaleMatch,
        resolutionStrategyLiteral: 'EXACT_ACTIVE_MATCH',
        matchedCandidateLiteral: candidateSnapshot.normalizedLocaleTagLiteral,
      });
    }

    const plannedVariantFallback = tryPlannedVariantFallbackMatch(
      candidateSnapshot.normalizedLocaleTagLiteral,
    );
    if (plannedVariantFallback !== null) {
      return Object.freeze({
        resolvedLocaleIdentifier: plannedVariantFallback,
        resolutionStrategyLiteral: 'PLANNED_VARIANT_FALLBACK',
        matchedCandidateLiteral: candidateSnapshot.normalizedLocaleTagLiteral,
      });
    }

    const baseLanguageMatch = tryBaseLanguageMatch(candidateSnapshot.normalizedLocaleTagLiteral);
    if (baseLanguageMatch !== null) {
      return Object.freeze({
        resolvedLocaleIdentifier: baseLanguageMatch,
        resolutionStrategyLiteral: 'BASE_LANGUAGE_MATCH',
        matchedCandidateLiteral: candidateSnapshot.normalizedLocaleTagLiteral,
      });
    }
  }

  return Object.freeze({
    resolvedLocaleIdentifier: fallbackLocaleIdentifier,
    resolutionStrategyLiteral: 'DEFAULT_FALLBACK',
    matchedCandidateLiteral: null,
  });
};
