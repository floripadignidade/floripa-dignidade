/**
 * @section Internationalization Contracts - Registry Integrity Schema (Atom)
 * @description Átomo de validación estructural y referencial para el catálogo consolidado
 * de idiomas BCP 47. Certifica unicidad de códigos, existencia única de idioma por defecto
 * activo y validez de referencias de respaldo sin dependencias externas a Zod (`type:schema`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  type ILocaleRegistryEntry,
  LocaleRegistryEntrySchema,
} from './LocaleRegistryContract.schema';

const validateUniqueLocaleCodesAction = (
  registryEntriesCollection: readonly ILocaleRegistryEntry[],
  validationContext: z.RefinementCtx,
): void => {
  const seenCodesSet = new Set<string>();

  registryEntriesCollection.forEach((entrySnapshot, entryIndexNumeric) => {
    const normalizedCodeLiteral = entrySnapshot.localeCodeLiteral.toLowerCase();
    const isDuplicateCodeBoolean = seenCodesSet.has(normalizedCodeLiteral);

    if (isDuplicateCodeBoolean) {
      validationContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: [entryIndexNumeric, 'localeCodeLiteral'],
        message: `DUPLICATE_LOCALE_CODE_IN_REGISTRY:${entrySnapshot.localeCodeLiteral}`,
      });
    }

    seenCodesSet.add(normalizedCodeLiteral);
  });
};

const validateActiveAndDefaultLocalesAction = (
  registryEntriesCollection: readonly ILocaleRegistryEntry[],
  validationContext: z.RefinementCtx,
): void => {
  const enabledEntriesCollection = registryEntriesCollection.filter(
    (entrySnapshot) => entrySnapshot.isEnabledBoolean,
  );
  const activeDefaultsCollection = enabledEntriesCollection.filter(
    (entrySnapshot) => entrySnapshot.isDefaultBoolean,
  );

  if (enabledEntriesCollection.length === 0) {
    validationContext.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SUPPORTED_LOCALES_REGISTRY_REQUIRES_AT_LEAST_ONE_ENABLED_LOCALE',
    });
  }

  if (activeDefaultsCollection.length !== 1) {
    validationContext.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'SUPPORTED_LOCALES_REGISTRY_REQUIRES_EXACTLY_ONE_ACTIVE_DEFAULT_LOCALE',
    });
  }
};

const validateFallbackReferencesAction = (
  registryEntriesCollection: readonly ILocaleRegistryEntry[],
  validationContext: z.RefinementCtx,
): void => {
  const catalogedCodesSet = new Set(
    registryEntriesCollection.map((entrySnapshot) => entrySnapshot.localeCodeLiteral),
  );

  registryEntriesCollection.forEach((entrySnapshot, entryIndexNumeric) => {
    const hasValidFallbackBoolean = catalogedCodesSet.has(entrySnapshot.fallbackLocaleIdentifier);

    if (!hasValidFallbackBoolean) {
      validationContext.addIssue({
        code: z.ZodIssueCode.custom,
        path: [entryIndexNumeric, 'fallbackLocaleIdentifier'],
        message: `INVALID_FALLBACK_LOCALE_REFERENCE:${entrySnapshot.fallbackLocaleIdentifier}`,
      });
    }
  });
};

/**
 * @name LocalesRegistryCollectionSchema
 * @description Contrato maestro que valida la consistencia interna completa de `SUPPORTED_LOCALES_REGISTRY`.
 */
export const LocalesRegistryCollectionSchema = z
  .array(LocaleRegistryEntrySchema)
  .min(1, { message: 'SUPPORTED_LOCALES_REGISTRY_MUST_NOT_BE_EMPTY' })
  .superRefine((registryEntriesCollection, validationContext) => {
    validateUniqueLocaleCodesAction(registryEntriesCollection, validationContext);
    validateActiveAndDefaultLocalesAction(registryEntriesCollection, validationContext);
    validateFallbackReferencesAction(registryEntriesCollection, validationContext);
  })
  .readonly();
