/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/logic/TransparencyPageFallbackDictionaries.ts
 * @section Transparency Gazette Logic - In-Memory Fallback Dictionaries Orchestrator
 * @description Orquestador de resolución de respaldos lingüísticos en memoria para
 * `/[locale]/transparencia`. Mapea de forma determinista el idioma BCP 47 solicitado
 * hacia los sub-átomos de respaldo por idioma cumpliendo con el límite estricto de líneas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import type { ITransparencyPageI18n } from '../i18n/schemas/TransparencyPage.i18n.schema';
import { ENGLISH_TRANSPARENCY_FALLBACK } from './fallbacks/EnglishTransparencyFallback';
import { PORTUGUESE_TRANSPARENCY_FALLBACK } from './fallbacks/PortugueseTransparencyFallback';
import { SPANISH_TRANSPARENCY_FALLBACK } from './fallbacks/SpanishTransparencyFallback';

const DEFAULT_LANGUAGE_CODE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

const TRANSPARENCY_FALLBACKS_BY_LANGUAGE: Readonly<Record<string, ITransparencyPageI18n>> =
  Object.freeze({
    pt: PORTUGUESE_TRANSPARENCY_FALLBACK,
    es: SPANISH_TRANSPARENCY_FALLBACK,
    en: ENGLISH_TRANSPARENCY_FALLBACK,
  });

/**
 * Resuelve el respaldo lingüístico inmutable en memoria para la vista de transparencia.
 *
 * @param requestedLocaleLiteral - Código BCP 47 solicitado en la ruta.
 * @returns {ITransparencyPageI18n} Diccionario validado por `TransparencyPageI18nSchema`.
 */
export const ResolveTransparencyPageInMemoryFallback = (
  requestedLocaleLiteral: string,
): ITransparencyPageI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_LANGUAGE_CODE_LITERAL;

  return (
    TRANSPARENCY_FALLBACKS_BY_LANGUAGE[baseLanguageCodeLiteral] ??
    TRANSPARENCY_FALLBACKS_BY_LANGUAGE[DEFAULT_LANGUAGE_CODE_LITERAL] ??
    PORTUGUESE_TRANSPARENCY_FALLBACK
  );
};
