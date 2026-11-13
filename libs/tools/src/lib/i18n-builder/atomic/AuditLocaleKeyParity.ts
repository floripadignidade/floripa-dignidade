/**
 * @section Tools & Infrastructure - Locale Key Parity Auditor (Atom)
 * @description Verifica la simetría estructural exacta de archivos, namespaces y claves
 * de traducción en todos los idiomas activos frente al idioma fuente canónico
 * (`SOURCE_LOCALE_IDENTIFIER`), soportando tanto silos `FOLDER_PER_LOCALE` como
 * `LEGACY_FLAT_FILE` sin falsos negativos cuando falta el idioma raíz.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';

import {
  type ILinguisticParityViolation,
  type TLinguisticSiloFormat,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';
import { CollectLinguisticLeafKeyPaths } from './CollectLinguisticLeafKeyPaths';

const AuditParityParametersSchema = z
  .object({
    moduleIdentifierLiteral: z.string().trim().min(1),
  })
  .readonly();

const compareNamespaceDictionariesAction = (
  moduleIdentifierLiteral: string,
  targetLocaleCodeLiteral: string,
  namespaceLiteral: string,
  sourceKeysCollection: readonly string[],
  targetNamespaceDictionary: Readonly<Record<string, unknown>> | undefined,
): readonly ILinguisticParityViolation[] => {
  if (targetNamespaceDictionary === undefined) {
    return [
      Object.freeze({
        moduleIdentifierLiteral,
        localeCodeLiteral: targetLocaleCodeLiteral,
        namespaceLiteral,
        violationTypeLiteral: 'MISSING_LOCALE_FILE',
        missingKeysCollection: sourceKeysCollection,
      }),
    ];
  }

  const sourceKeysSet = new Set(sourceKeysCollection);
  const targetKeysCollection = CollectLinguisticLeafKeyPaths(targetNamespaceDictionary);
  const targetKeysSet = new Set(targetKeysCollection);
  const violationsCollection: ILinguisticParityViolation[] = [];

  const missingKeysCollection = sourceKeysCollection.filter(
    (keyPathLiteral) => !targetKeysSet.has(keyPathLiteral),
  );
  if (missingKeysCollection.length > 0) {
    violationsCollection.push(
      Object.freeze({
        moduleIdentifierLiteral,
        localeCodeLiteral: targetLocaleCodeLiteral,
        namespaceLiteral,
        violationTypeLiteral: 'MISSING_TRANSLATION_KEY',
        missingKeysCollection: Object.freeze(missingKeysCollection),
      }),
    );
  }

  const extraKeysCollection = targetKeysCollection.filter(
    (keyPathLiteral) => !sourceKeysSet.has(keyPathLiteral),
  );
  if (extraKeysCollection.length > 0) {
    violationsCollection.push(
      Object.freeze({
        moduleIdentifierLiteral,
        localeCodeLiteral: targetLocaleCodeLiteral,
        namespaceLiteral,
        violationTypeLiteral: 'EXTRA_TRANSLATION_KEY',
        missingKeysCollection: Object.freeze(extraKeysCollection),
      }),
    );
  }

  return violationsCollection;
};

const extractNamespaceEntriesMapping = (
  dictionarySnapshot: Readonly<Record<string, unknown>>,
  siloFormatLiteral: TLinguisticSiloFormat,
): Readonly<Record<string, Readonly<Record<string, unknown>>>> => {
  if (siloFormatLiteral === 'LEGACY_FLAT_FILE') {
    return { default: dictionarySnapshot };
  }

  const namespacesMapping: Record<string, Readonly<Record<string, unknown>>> = {};
  for (const [namespaceLiteral, namespaceContent] of Object.entries(dictionarySnapshot)) {
    if (
      typeof namespaceContent === 'object' &&
      namespaceContent !== null &&
      !Array.isArray(namespaceContent)
    ) {
      namespacesMapping[namespaceLiteral] = namespaceContent as Readonly<Record<string, unknown>>;
    }
  }

  return namespacesMapping;
};

/**
 * Audita la paridad completa de archivos, namespaces y claves frente al idioma fuente (`pt-BR`).
 *
 * @param moduleIdentifierLiteral - Identificador lógico normalizado del módulo o ruta.
 * @param dictionariesByLocaleMapping - Diccionarios extraídos indexados por código BCP 47.
 * @param siloFormatLiteral - Formato del silo (`FOLDER_PER_LOCALE` o `LEGACY_FLAT_FILE`).
 * @returns {readonly ILinguisticParityViolation[]} Colección inmutable de divergencias detectadas.
 * @throws {ValidationException} Si el identificador del módulo está vacío.
 */
export const AuditLocaleKeyParity = (
  moduleIdentifierLiteral: string,
  dictionariesByLocaleMapping: Readonly<Record<string, Record<string, unknown>>>,
  siloFormatLiteral: TLinguisticSiloFormat = 'LEGACY_FLAT_FILE',
): readonly ILinguisticParityViolation[] => {
  const parameterValidationResult = AuditParityParametersSchema.safeParse({
    moduleIdentifierLiteral,
  });

  if (!parameterValidationResult.success) {
    throw new ValidationException('PARAMETRO_MODULO_PARIDAD_INVALIDO', {
      validationIssuesCollection: parameterValidationResult.error.flatten(),
    });
  }

  const validatedModuleIdentifier = parameterValidationResult.data.moduleIdentifierLiteral;
  const sourceLocaleLiteral = WEAVER_CONFIGURATION.SOURCE_LOCALE_IDENTIFIER;
  const sourceDictionarySnapshot = dictionariesByLocaleMapping[sourceLocaleLiteral];

  if (!sourceDictionarySnapshot) {
    return Object.freeze([
      Object.freeze({
        moduleIdentifierLiteral: validatedModuleIdentifier,
        localeCodeLiteral: sourceLocaleLiteral,
        namespaceLiteral: 'all',
        violationTypeLiteral: 'MISSING_LOCALE_FILE',
        missingKeysCollection: Object.freeze([]),
      }),
    ]);
  }

  const sourceNamespacesMapping = extractNamespaceEntriesMapping(
    sourceDictionarySnapshot,
    siloFormatLiteral,
  );
  const detectedViolationsCollection: ILinguisticParityViolation[] = [];

  for (const targetLocaleCodeLiteral of WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION) {
    if (targetLocaleCodeLiteral === sourceLocaleLiteral) {
      continue;
    }

    const targetDictionarySnapshot = dictionariesByLocaleMapping[targetLocaleCodeLiteral];
    const targetNamespacesMapping = targetDictionarySnapshot
      ? extractNamespaceEntriesMapping(targetDictionarySnapshot, siloFormatLiteral)
      : {};

    for (const [namespaceLiteral, sourceNamespaceContent] of Object.entries(
      sourceNamespacesMapping,
    )) {
      const sourceKeysCollection = CollectLinguisticLeafKeyPaths(sourceNamespaceContent);
      detectedViolationsCollection.push(
        ...compareNamespaceDictionariesAction(
          validatedModuleIdentifier,
          targetLocaleCodeLiteral,
          namespaceLiteral,
          sourceKeysCollection,
          targetNamespacesMapping[namespaceLiteral],
        ),
      );
    }
  }

  return Object.freeze(detectedViolationsCollection);
};
