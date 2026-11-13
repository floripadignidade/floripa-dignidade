/**
 * @section Internationalization Contracts - Supported Locales Registry (SSOT)
 * @description Única Fuente de Verdad (SSOT) que consolida el catálogo completo de idiomas
 * BCP 47 (activos y planificados para futuras implementaciones) y deriva dinámicamente los
 * validadores Zod, el idioma por defecto y las colecciones de soporte en tiempo de ejecución.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO 639-1, ISO 3166-1, ISO 15924 e ISO/IEC 11179.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ACTIVE_LOCALES_CATALOG } from './ActiveLocalesCatalog';
import {
  type ILocaleRegistryEntry,
  LocaleRegistryEntrySchema,
  LocaleTextDirectionSchema,
  type TLocaleTextDirection,
} from './LocaleRegistryContract.schema';
import { LocalesRegistryCollectionSchema } from './LocalesRegistryIntegrity.schema';
import { PLANNED_GLOBAL_LOCALES_CATALOG } from './PlannedGlobalLocalesCatalog';
import { PLANNED_REGIONAL_VARIANTS_CATALOG } from './PlannedRegionalVariantsCatalog';

export { LocaleRegistryEntrySchema, LocaleTextDirectionSchema, LocalesRegistryCollectionSchema };
export type { ILocaleRegistryEntry, TLocaleTextDirection };

const UNFROZEN_LOCALES_REGISTRY = [
  ...ACTIVE_LOCALES_CATALOG,
  ...PLANNED_REGIONAL_VARIANTS_CATALOG,
  ...PLANNED_GLOBAL_LOCALES_CATALOG,
] as const;

/**
 * @name SUPPORTED_LOCALES_REGISTRY
 * @description Registro consolidado inmutable de todos los idiomas y variantes regionales BCP 47.
 */
export const SUPPORTED_LOCALES_REGISTRY = Object.freeze(UNFROZEN_LOCALES_REGISTRY);

/** Auditoría preventiva de integridad estructural, unicidad y referencias al cargar el módulo. */
LocalesRegistryCollectionSchema.parse(SUPPORTED_LOCALES_REGISTRY);

type TRegistryEntryUnion = (typeof SUPPORTED_LOCALES_REGISTRY)[number];
type TActiveRegistryEntryUnion = Extract<TRegistryEntryUnion, { readonly isEnabledBoolean: true }>;

export type TActiveLocaleCodeLiteral = TActiveRegistryEntryUnion['localeCodeLiteral'];
export type TCatalogedLocaleCodeLiteral = TRegistryEntryUnion['localeCodeLiteral'];

const isRegistryEntryEnabledGuard = (
  localeEntrySnapshot: TRegistryEntryUnion,
): localeEntrySnapshot is TActiveRegistryEntryUnion =>
  localeEntrySnapshot.isEnabledBoolean === true;

const activeRegistryEntriesList = SUPPORTED_LOCALES_REGISTRY.filter(isRegistryEntryEnabledGuard);

/**
 * @name ACTIVE_LOCALES_ENTRIES_COLLECTION
 * @description Metadatos completos e inmutables de idiomas habilitados (etiqueta nativa, dirección LTR/RTL).
 */
export const ACTIVE_LOCALES_ENTRIES_COLLECTION: readonly ILocaleRegistryEntry[] =
  Object.freeze(activeRegistryEntriesList);

const enabledLocaleCodesCollection: TActiveLocaleCodeLiteral[] = activeRegistryEntriesList.map(
  (localeEntrySnapshot) => localeEntrySnapshot.localeCodeLiteral,
);

const [firstEnabledLocaleCodeLiteral, ...remainingEnabledLocaleCodesCollection] =
  enabledLocaleCodesCollection;

if (firstEnabledLocaleCodeLiteral === undefined) {
  throw new Error('SUPPORTED_LOCALES_REGISTRY_REQUIRES_AT_LEAST_ONE_ENABLED_LOCALE');
}

/**
 * @name SupportedLocaleSchema
 * @description Validador Zod derivado dinámicamente de los idiomas activos (`isEnabledBoolean: true`).
 */
export const SupportedLocaleSchema = z
  .enum([firstEnabledLocaleCodeLiteral, ...remainingEnabledLocaleCodesCollection])
  .describe('Identificador de localización BCP 47 habilitado actualmente en el ecosistema.')
  .brand<'SupportedLocale'>();

export type TSupportedLocale = z.infer<typeof SupportedLocaleSchema>;

/** Alias de compatibilidad nominal consumido por `@floripa-dignidade/routing`. */
export type ISupportedLocale = TSupportedLocale;

const catalogedLocaleCodesCollection: TCatalogedLocaleCodeLiteral[] =
  SUPPORTED_LOCALES_REGISTRY.map((localeEntrySnapshot) => localeEntrySnapshot.localeCodeLiteral);

const [firstCatalogedLocaleCodeLiteral, ...remainingCatalogedLocaleCodesCollection] =
  catalogedLocaleCodesCollection;

if (firstCatalogedLocaleCodeLiteral === undefined) {
  throw new Error('SUPPORTED_LOCALES_REGISTRY_MUST_NOT_BE_EMPTY');
}

/**
 * @name CatalogedLocaleSchema
 * @description Validador Zod para cualquier código BCP 47 catalogado (activo o planificado).
 */
export const CatalogedLocaleSchema = z
  .enum([firstCatalogedLocaleCodeLiteral, ...remainingCatalogedLocaleCodesCollection])
  .describe('Identificador de localización BCP 47 reconocido en el catálogo ISO institucional.')
  .brand<'CatalogedLocale'>();

export type TCatalogedLocale = z.infer<typeof CatalogedLocaleSchema>;
export type ICatalogedLocale = TCatalogedLocale;

const defaultRegistryEntrySnapshot =
  activeRegistryEntriesList.find((localeEntrySnapshot) => localeEntrySnapshot.isDefaultBoolean) ??
  ACTIVE_LOCALES_CATALOG[0];

/**
 * @name DEFAULT_LOCALE_IDENTIFIER
 * @description Código BCP 47 canónico por defecto validado y sellado nominalmente.
 */
export const DEFAULT_LOCALE_IDENTIFIER: TSupportedLocale = SupportedLocaleSchema.parse(
  defaultRegistryEntrySnapshot.localeCodeLiteral,
);

/**
 * @name SUPPORTED_LOCALE_CODES_COLLECTION
 * @description Colección inmutable de códigos BCP 47 activos para rutas, Weaver y selector de idioma.
 */
export const SUPPORTED_LOCALE_CODES_COLLECTION: readonly TSupportedLocale[] = Object.freeze(
  enabledLocaleCodesCollection.map((localeCodeLiteral) =>
    SupportedLocaleSchema.parse(localeCodeLiteral),
  ),
);

/**
 * @name CATALOGED_LOCALE_CODES_COLLECTION
 * @description Colección inmutable de todos los códigos BCP 47 catalogados (activos y futuros).
 */
export const CATALOGED_LOCALE_CODES_COLLECTION: readonly TCatalogedLocale[] = Object.freeze(
  catalogedLocaleCodesCollection.map((localeCodeLiteral) =>
    CatalogedLocaleSchema.parse(localeCodeLiteral),
  ),
);
