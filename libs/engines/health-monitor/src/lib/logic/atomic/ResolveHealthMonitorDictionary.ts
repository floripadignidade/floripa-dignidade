/**
 * @section Health Monitor - Linguistic Dictionary Resolver (Atom)
 * @description Resuelve y valida contra `HealthMonitorI18nSchema` el diccionario
 * localizado del monitor de salud aplicando cascada determinista hacia el idioma base
 * y el idioma fuente institucional (`pt-BR`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Disponibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DEFAULT_LOCALE_IDENTIFIER } from '@floripa-dignidade/contracts';

import englishDictionarySnapshot from '../../i18n/en-US/healthMonitor.json';
import spanishDictionarySnapshot from '../../i18n/es-ES/healthMonitor.json';
import portugueseDictionarySnapshot from '../../i18n/pt-BR/healthMonitor.json';
import {
  HealthMonitorI18nSchema,
  type IHealthMonitorI18n,
} from '../../i18n/schemas/HealthMonitor.i18n.schema';

const PORTUGUESE_DICTIONARY: IHealthMonitorI18n = HealthMonitorI18nSchema.parse(
  portugueseDictionarySnapshot,
);

const SPANISH_DICTIONARY: IHealthMonitorI18n =
  HealthMonitorI18nSchema.parse(spanishDictionarySnapshot);

const ENGLISH_DICTIONARY: IHealthMonitorI18n =
  HealthMonitorI18nSchema.parse(englishDictionarySnapshot);

const DICTIONARIES_BY_BASE_LANGUAGE: Readonly<Record<string, IHealthMonitorI18n>> = Object.freeze({
  pt: PORTUGUESE_DICTIONARY,
  es: SPANISH_DICTIONARY,
  en: ENGLISH_DICTIONARY,
});

const DEFAULT_BASE_LANGUAGE_LITERAL = DEFAULT_LOCALE_IDENTIFIER.split('-')[0] ?? 'pt';

/**
 * Resuelve el diccionario validado para un código BCP 47 dado.
 *
 * @param requestedLocaleLiteral - Código BCP 47 activo en la invocación.
 * @returns {IHealthMonitorI18n} Diccionario inmutable y certificado por Zod.
 */
export const ResolveHealthMonitorDictionary = (
  requestedLocaleLiteral: string = DEFAULT_LOCALE_IDENTIFIER,
): IHealthMonitorI18n => {
  const baseLanguageCodeLiteral =
    requestedLocaleLiteral.split('-')[0]?.toLowerCase() ?? DEFAULT_BASE_LANGUAGE_LITERAL;

  return (
    DICTIONARIES_BY_BASE_LANGUAGE[baseLanguageCodeLiteral] ??
    DICTIONARIES_BY_BASE_LANGUAGE[DEFAULT_BASE_LANGUAGE_LITERAL] ??
    PORTUGUESE_DICTIONARY
  );
};
