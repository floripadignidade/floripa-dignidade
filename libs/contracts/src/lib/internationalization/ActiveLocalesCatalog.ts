/**
 * @section Internationalization Contracts - Active Locales Catalog
 * @description Catálogo de idiomas actualmente implementados, compilados por el Weaver
 * y habilitados en el enrutamiento activo de la plataforma.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO 3166-1 e ISO/IEC 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { ILocaleRegistryEntry } from './LocaleRegistryContract.schema';

/**
 * @name ACTIVE_LOCALES_CATALOG
 * @description Idiomas habilitados en producción (`isEnabledBoolean: true`).
 */
export const ACTIVE_LOCALES_CATALOG = [
  {
    localeCodeLiteral: 'pt-BR',
    iso639LanguageCodeLiteral: 'pt',
    iso3166RegionOrScriptCodeLiteral: 'BR',
    nativeLabelLiteral: 'Português (Brasil)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: true,
    isDefaultBoolean: true,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'es-ES',
    iso639LanguageCodeLiteral: 'es',
    iso3166RegionOrScriptCodeLiteral: 'ES',
    nativeLabelLiteral: 'Español (España)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: true,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
  {
    localeCodeLiteral: 'en-US',
    iso639LanguageCodeLiteral: 'en',
    iso3166RegionOrScriptCodeLiteral: 'US',
    nativeLabelLiteral: 'English (United States)',
    textDirectionLiteral: 'ltr',
    isEnabledBoolean: true,
    isDefaultBoolean: false,
    fallbackLocaleIdentifier: 'pt-BR',
  },
] as const satisfies readonly ILocaleRegistryEntry[];
