/**
 * @section AI Providers - Google Gemini Dictionary Resolver (Atom)
 * @description Resuelve y valida contra `GeminiDriverI18nSchema` el diccionario localizado
 * para el adaptador Google Gemini aplicando cascada determinista hacia el idioma fuente (`pt-BR`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import englishDictionarySnapshot from '../../i18n/en-US/geminiDriver.json';
import spanishDictionarySnapshot from '../../i18n/es-ES/geminiDriver.json';
import portugueseDictionarySnapshot from '../../i18n/pt-BR/geminiDriver.json';
import {
  GeminiDriverI18nSchema,
  type IGeminiDriverI18n,
} from '../../i18n/schemas/GeminiDriver.i18n.schema';

const PORTUGUESE_DICTIONARY: IGeminiDriverI18n = GeminiDriverI18nSchema.parse(
  portugueseDictionarySnapshot,
);

const SPANISH_DICTIONARY: IGeminiDriverI18n =
  GeminiDriverI18nSchema.parse(spanishDictionarySnapshot);

const ENGLISH_DICTIONARY: IGeminiDriverI18n =
  GeminiDriverI18nSchema.parse(englishDictionarySnapshot);

const DICTIONARIES_BY_BASE_LANGUAGE: Readonly<Record<string, IGeminiDriverI18n>> = Object.freeze({
  pt: PORTUGUESE_DICTIONARY,
  es: SPANISH_DICTIONARY,
  en: ENGLISH_DICTIONARY,
});

const DEFAULT_BASE_LANGUAGE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

/**
 * Resuelve el diccionario validado de Google Gemini para un código BCP 47 dado.
 *
 * @param requestedLocaleLiteral - Identificador BCP 47 activo en la invocación.
 * @returns {IGeminiDriverI18n} Diccionario inmutable y sellado contra mutaciones.
 */
export const ResolveGeminiDriverDictionary = (
  requestedLocaleLiteral: string = DEFAULT_LOCALE_IDENTIFIER,
): IGeminiDriverI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_BASE_LANGUAGE_LITERAL;

  return (
    DICTIONARIES_BY_BASE_LANGUAGE[baseLanguageCodeLiteral] ??
    DICTIONARIES_BY_BASE_LANGUAGE[DEFAULT_BASE_LANGUAGE_LITERAL] ??
    PORTUGUESE_DICTIONARY
  );
};
