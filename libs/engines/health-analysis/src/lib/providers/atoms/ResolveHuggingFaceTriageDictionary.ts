/**
 * @section AI Providers - Hugging Face Triage Dictionary Resolver (Atom)
 * @description Resuelve y valida contra `HuggingFaceTriageI18nSchema` el diccionario
 * localizado de triaje HTTP aplicando cascada hacia idioma base e idioma fuente (`pt-BR`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import englishDictionarySnapshot from '../../i18n/en-US/huggingFaceTriage.json';
import spanishDictionarySnapshot from '../../i18n/es-ES/huggingFaceTriage.json';
import portugueseDictionarySnapshot from '../../i18n/pt-BR/huggingFaceTriage.json';
import {
  HuggingFaceTriageI18nSchema,
  type IHuggingFaceTriageI18n,
} from '../../i18n/schemas/HuggingFaceTriage.i18n.schema';

const PORTUGUESE_DICTIONARY: IHuggingFaceTriageI18n = HuggingFaceTriageI18nSchema.parse(
  portugueseDictionarySnapshot,
);

const SPANISH_DICTIONARY: IHuggingFaceTriageI18n =
  HuggingFaceTriageI18nSchema.parse(spanishDictionarySnapshot);

const ENGLISH_DICTIONARY: IHuggingFaceTriageI18n =
  HuggingFaceTriageI18nSchema.parse(englishDictionarySnapshot);

const DICTIONARIES_BY_BASE_LANGUAGE: Readonly<Record<string, IHuggingFaceTriageI18n>> =
  Object.freeze({
    pt: PORTUGUESE_DICTIONARY,
    es: SPANISH_DICTIONARY,
    en: ENGLISH_DICTIONARY,
  });

const DEFAULT_BASE_LANGUAGE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

/**
 * Resuelve de forma determinista el diccionario de triaje para un código BCP 47 dado.
 *
 * @param requestedLocaleLiteral - Identificador BCP 47 activo en la invocación.
 * @returns {IHuggingFaceTriageI18n} Diccionario inmutable y validado por Zod.
 */
export const ResolveHuggingFaceTriageDictionary = (
  requestedLocaleLiteral: string = DEFAULT_LOCALE_IDENTIFIER,
): IHuggingFaceTriageI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_BASE_LANGUAGE_LITERAL;

  return (
    DICTIONARIES_BY_BASE_LANGUAGE[baseLanguageCodeLiteral] ??
    DICTIONARIES_BY_BASE_LANGUAGE[DEFAULT_BASE_LANGUAGE_LITERAL] ??
    PORTUGUESE_DICTIONARY
  );
};
