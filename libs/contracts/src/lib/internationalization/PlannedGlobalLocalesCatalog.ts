/**
 * @section Internationalization Contracts - Planned Global and Humanitarian Locales Catalog
 * @description Catálogo de idiomas humanitarios, de migración regional en Santa Catarina
 * e idiomas internacionales (incluyendo soporte RTL y scripts ISO 15924) para expansión futura.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO 3166-1, ISO 15924 e ISO/IEC 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ILocaleRegistryEntry } from './LocaleRegistryContract.schema';

/**
 * @name PLANNED_GLOBAL_LOCALES_CATALOG
 * @description Idiomas internacionales y humanitarios catalogados (`isEnabledBoolean: false`).
 */
export const PLANNED_GLOBAL_LOCALES_CATALOG = [
  {
    localeCodeLiteral: 'ht-HT',
    iso639LanguageCodeLiteral: 'ht',
    iso3166RegionOrScriptCodeLiteral: 'HT',
    nativeLabelLiteral: 'Kreyòl Ayisyen (Ayiti)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'fr-FR',
    iso639LanguageCodeLiteral: 'fr',
    iso3166RegionOrScriptCodeLiteral: 'FR',
    nativeLabelLiteral: 'Français (France)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'fr-CA',
    iso639LanguageCodeLiteral: 'fr',
    iso3166RegionOrScriptCodeLiteral: 'CA',
    nativeLabelLiteral: 'Français (Canada)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'de-DE',
    iso639LanguageCodeLiteral: 'de',
    iso3166RegionOrScriptCodeLiteral: 'DE',
    nativeLabelLiteral: 'Deutsch (Deutschland)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'it-IT',
    iso639LanguageCodeLiteral: 'it',
    iso3166RegionOrScriptCodeLiteral: 'IT',
    nativeLabelLiteral: 'Italiano (Italia)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'gn-PY',
    iso639LanguageCodeLiteral: 'gn',
    iso3166RegionOrScriptCodeLiteral: 'PY',
    nativeLabelLiteral: "Avañe'ẽ (Paraguái)",
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'ar-SA',
    iso639LanguageCodeLiteral: 'ar',
    iso3166RegionOrScriptCodeLiteral: 'SA',
    nativeLabelLiteral: 'العربية (السعودية)',
    textDirectionLiteral: 'rtl',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'zh-Hans-CN',
    iso639LanguageCodeLiteral: 'zh',
    iso3166RegionOrScriptCodeLiteral: 'Hans-CN',
    nativeLabelLiteral: '简体中文 (中国)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'zh-Hant-TW',
    iso639LanguageCodeLiteral: 'zh',
    iso3166RegionOrScriptCodeLiteral: 'Hant-TW',
    nativeLabelLiteral: '繁體中文 (台灣)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'ja-JP',
    iso639LanguageCodeLiteral: 'ja',
    iso3166RegionOrScriptCodeLiteral: 'JP',
    nativeLabelLiteral: '日本語 (日本)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'ko-KR',
    iso639LanguageCodeLiteral: 'ko',
    iso3166RegionOrScriptCodeLiteral: 'KR',
    nativeLabelLiteral: '한국어 (대한민국)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'uk-UA',
    iso639LanguageCodeLiteral: 'uk',
    iso3166RegionOrScriptCodeLiteral: 'UA',
    nativeLabelLiteral: 'Українська (Україна)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
] as const satisfies readonly ILocaleRegistryEntry[];
