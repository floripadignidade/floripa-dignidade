/**
 * @section Internationalization Contracts - Planned Regional Variants Catalog
 * @description Catálogo de variantes regionales lusófonas, hispanohablantes (incluyendo
 * estándar UN M.49 y países del Mercosur) y anglófonas reservadas para futura expansión.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO 3166-1, UN M.49 e ISO/IEC 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ILocaleRegistryEntry } from './LocaleRegistryContract.schema';

/**
 * @name PLANNED_REGIONAL_VARIANTS_CATALOG
 * @description Variantes regionales catalogadas (`isEnabledBoolean: false`). Para activar
 * cualquiera de ellas, cambiar `isEnabledBoolean` a `true` tras crear su silo `i18n/`.
 */
export const PLANNED_REGIONAL_VARIANTS_CATALOG = [
  {
    localeCodeLiteral: 'pt-PT',
    iso639LanguageCodeLiteral: 'pt',
    iso3166RegionOrScriptCodeLiteral: 'PT',
    nativeLabelLiteral: 'Português (Portugal)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'pt-AO',
    iso639LanguageCodeLiteral: 'pt',
    iso3166RegionOrScriptCodeLiteral: 'AO',
    nativeLabelLiteral: 'Português (Angola)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'pt-MZ',
    iso639LanguageCodeLiteral: 'pt',
    iso3166RegionOrScriptCodeLiteral: 'MZ',
    nativeLabelLiteral: 'Português (Moçambique)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'es-419',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: '419',
    nativeLabelLiteral: 'Español (América Latina)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-AR',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'AR',
    nativeLabelLiteral: 'Español (Argentina)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-UY',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'UY',
    nativeLabelLiteral: 'Español (Uruguay)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-PY',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'PY',
    nativeLabelLiteral: 'Español (Paraguay)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-CL',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'CL',
    nativeLabelLiteral: 'Español (Chile)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-CO',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'CO',
    nativeLabelLiteral: 'Español (Colombia)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-VE',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'VE',
    nativeLabelLiteral: 'Español (Venezuela)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'es-MX',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'MX',
    nativeLabelLiteral: 'Español (México)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'es-ES',
  },
  {
    localeCodeLiteral: 'en-GB',
    iso639LanguageCodeLiteral: 'en',
    iso3166RegionOrScriptCodeLiteral: 'GB',
    nativeLabelLiteral: 'English (United Kingdom)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: false,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'en-US',
  },
] as const satisfies readonly ILocaleRegistryEntry[];
