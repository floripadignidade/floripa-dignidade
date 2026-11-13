/**
 * @section Tools & Infrastructure - Dual Silo Dictionary Extractor (Orchestrator Atom)
 * @description Orquestador de extracción dual ADR 0030 por silo `i18n/`. Valida los
 * parámetros de entrada mediante Zod, delega detección de formato (`DetectLinguisticSiloFormat`),
 * lectura multi-namespace (`ReadLocaleFolderNamespaces`) y parseo plano (`ParseLinguisticJsonFile`),
 * garantizando orden determinista sobre `SUPPORTED_LOCALES_COLLECTION`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad y Escalabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

import {
  type ILinguisticParityViolation,
  type TLinguisticSiloFormat,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';
import { DetectLinguisticSiloFormat } from './DetectLinguisticSiloFormat';
import { ParseLinguisticJsonFile } from './ParseLinguisticJsonFile';
import { ReadLocaleFolderNamespaces } from './ReadLocaleFolderNamespaces';

const ExtractSiloParametersSchema = z
  .object({
    siloDirectoryPathLiteral: z.string().trim().min(1),
    moduleIdentifierLiteral: z.string().trim().min(1),
    correlationIdentifier: CorrelationIdentifierSchema,
  })
  .readonly();

/**
 * @interface ISiloExtractionOutcome
 * @description Resultado inmutable y determinista con diccionarios extraídos y trazabilidad.
 */
export interface ISiloExtractionOutcome {
  readonly siloFormatLiteral: TLinguisticSiloFormat;
  readonly dictionariesByLocaleMapping: Readonly<Record<string, Record<string, unknown>>>;
  readonly processedLocalesCollection: readonly string[];
  readonly missingLocalesCollection: readonly string[];
  readonly syntaxViolationsCollection: readonly ILinguisticParityViolation[];
}

interface ISingleLocaleExtractionResult {
  readonly localeCodeLiteral: string;
  readonly dictionaryPayload: Readonly<Record<string, unknown>> | null;
  readonly syntaxViolationsCollection: readonly ILinguisticParityViolation[];
}

const extractSingleLocaleEntryAction = async (
  siloFormatLiteral: TLinguisticSiloFormat,
  siloDirectoryPathLiteral: string,
  moduleIdentifierLiteral: string,
  localeCodeLiteral: string,
  correlationIdentifier: string,
): Promise<ISingleLocaleExtractionResult> => {
  if (siloFormatLiteral === 'FOLDER_PER_LOCALE') {
    const folderResult = await ReadLocaleFolderNamespaces({
      localeDirectoryPathLiteral: join(siloDirectoryPathLiteral, localeCodeLiteral),
      moduleIdentifierLiteral,
      localeCodeLiteral,
      correlationIdentifier,
    });

    return {
      localeCodeLiteral,
      dictionaryPayload: folderResult.namespacePayload,
      syntaxViolationsCollection: folderResult.syntaxViolationsCollection,
    };
  }

  const flatFilePathLiteral = join(siloDirectoryPathLiteral, `${localeCodeLiteral}.json`);
  if (!existsSync(flatFilePathLiteral)) {
    return {
      localeCodeLiteral,
      dictionaryPayload: null,
      syntaxViolationsCollection: [],
    };
  }

  const flatFileResult = await ParseLinguisticJsonFile({
    filePathLiteral: flatFilePathLiteral,
    moduleIdentifierLiteral,
    localeCodeLiteral,
    namespaceLiteral: 'default',
    correlationIdentifier,
  });

  return {
    localeCodeLiteral,
    dictionaryPayload: flatFileResult.parsedPayload,
    syntaxViolationsCollection: flatFileResult.syntaxViolation
      ? [flatFileResult.syntaxViolation]
      : [],
  };
};

/**
 * Extrae los diccionarios de todos los idiomas activos para un directorio `i18n/` concreto.
 *
 * @param siloDirectoryPathLiteral - Ruta absoluta de la carpeta `i18n/`.
 * @param moduleIdentifierLiteral - Identificador lógico normalizado del módulo o ruta.
 * @param correlationIdentifier - Identificador UUID único de correlación para telemetría.
 * @returns {Promise<ISiloExtractionOutcome>} Resultado completo con diccionarios y errores sintácticos.
 * @throws {ValidationException} Si la ruta, identificador o correlación violan el contrato de entrada.
 */
export const ExtractSiloLocaleDictionaries = async (
  siloDirectoryPathLiteral: string,
  moduleIdentifierLiteral: string,
  correlationIdentifier: string,
): Promise<ISiloExtractionOutcome> => {
  const validationResult = ExtractSiloParametersSchema.safeParse({
    siloDirectoryPathLiteral,
    moduleIdentifierLiteral,
    correlationIdentifier,
  });

  if (!validationResult.success) {
    throw new ValidationException('PARAMETROS_EXTRACCION_SILO_INVALIDOS', {
      validationIssuesCollection: validationResult.error.flatten(),
    });
  }

  const validatedInput = validationResult.data;
  const siloFormatLiteral = await DetectLinguisticSiloFormat(
    validatedInput.siloDirectoryPathLiteral,
  );

  const localeResultsCollection = await Promise.all(
    WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map((localeCodeLiteral: string) =>
      extractSingleLocaleEntryAction(
        siloFormatLiteral,
        validatedInput.siloDirectoryPathLiteral,
        validatedInput.moduleIdentifierLiteral,
        localeCodeLiteral,
        validatedInput.correlationIdentifier,
      ),
    ),
  );

  const dictionariesByLocaleMapping: Record<string, Record<string, unknown>> = {};
  const processedLocalesCollection: string[] = [];
  const missingLocalesCollection: string[] = [];
  const syntaxViolationsCollection: ILinguisticParityViolation[] = [];

  for (const localeResult of localeResultsCollection) {
    syntaxViolationsCollection.push(...localeResult.syntaxViolationsCollection);

    if (localeResult.dictionaryPayload) {
      dictionariesByLocaleMapping[localeResult.localeCodeLiteral] = {
        ...localeResult.dictionaryPayload,
      };
      processedLocalesCollection.push(localeResult.localeCodeLiteral);
    } else {
      missingLocalesCollection.push(localeResult.localeCodeLiteral);
    }
  }

  return Object.freeze({
    siloFormatLiteral,
    dictionariesByLocaleMapping: Object.freeze(dictionariesByLocaleMapping),
    processedLocalesCollection: Object.freeze(processedLocalesCollection),
    missingLocalesCollection: Object.freeze(missingLocalesCollection),
    syntaxViolationsCollection: Object.freeze(syntaxViolationsCollection),
  });
};
