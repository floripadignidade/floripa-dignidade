/**
 * @section AI Providers - Hugging Face Driver Dictionary Resolver (Atom)
 * @description Átomo de lógica pura encargado de resolver y validar contra
 * `HuggingFaceDriverI18nSchema` el diccionario localizado del adaptador en función
 * del idioma BCP 47 solicitado, aplicando cascada resiliente hacia el idioma base e
 * idioma fuente institucional (`pt-BR`) sin bloquear por fallos de I/O.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import englishDictionarySnapshot from '../../i18n/en-US/huggingFaceDriver.json';
import spanishDictionarySnapshot from '../../i18n/es-ES/huggingFaceDriver.json';
import portugueseDictionarySnapshot from '../../i18n/pt-BR/huggingFaceDriver.json';
import {
  HuggingFaceDriverI18nSchema,
  type IHuggingFaceDriverI18n,
} from '../../i18n/schemas/HuggingFaceDriver.i18n.schema';

const PORTUGUESE_DICTIONARY: IHuggingFaceDriverI18n = HuggingFaceDriverI18nSchema.parse(
  portugueseDictionarySnapshot,
);

const SPANISH_DICTIONARY: IHuggingFaceDriverI18n =
  HuggingFaceDriverI18nSchema.parse(spanishDictionarySnapshot);

const ENGLISH_DICTIONARY: IHuggingFaceDriverI18n =
  HuggingFaceDriverI18nSchema.parse(englishDictionarySnapshot);

const DICTIONARIES_BY_BASE_LANGUAGE: Readonly<Record<string, IHuggingFaceDriverI18n>> =
  Object.freeze({
    pt: PORTUGUESE_DICTIONARY,
    es: SPANISH_DICTIONARY,
    en: ENGLISH_DICTIONARY,
  });

const DEFAULT_BASE_LANGUAGE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

/**
 * Resuelve de forma determinista el diccionario validado para un código BCP 47 dado.
 *
 * @param requestedLocaleLiteral - Identificador de idioma BCP 47 activo en la solicitud.
 * @returns {IHuggingFaceDriverI18n} Diccionario inmutable y certificado por Zod.
 */
export const ResolveHuggingFaceDriverDictionary = (
  requestedLocaleLiteral: string = DEFAULT_LOCALE_IDENTIFIER,
): IHuggingFaceDriverI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_BASE_LANGUAGE_LITERAL;

  return (
    DICTIONARIES_BY_BASE_LANGUAGE[baseLanguageCodeLiteral] ??
    DICTIONARIES_BY_BASE_LANGUAGE[DEFAULT_BASE_LANGUAGE_LITERAL] ??
    PORTUGUESE_DICTIONARY
  );
};
