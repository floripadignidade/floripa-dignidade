/**
 * @section Tools & Infrastructure - Locale Dictionaries Disk Writer (Atom)
 * @description Valida mediante `LinguisticModulePayloadSchema`, ordena alfabéticamente
 * las claves de módulo para garantizar salidas 100% deterministas entre sistemas operativos
 * y persiste físicamente cada diccionario `<locale>.json` en el destino compilado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Confiabilidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

import {
  type ILinguisticModulePayload,
  LinguisticModulePayloadSchema,
  WEAVER_CONFIGURATION,
} from '../constants/WeaverConfiguration';

const sortModuleKeysDeterministically = (
  payloadSnapshot: Readonly<Record<string, Record<string, unknown>>>,
): ILinguisticModulePayload => {
  const sortedEntriesCollection = Object.keys(payloadSnapshot)
    .sort((firstKeyLiteral, secondKeyLiteral) => firstKeyLiteral.localeCompare(secondKeyLiteral))
    .map((moduleKeyLiteral) => [moduleKeyLiteral, payloadSnapshot[moduleKeyLiteral] ?? {}]);

  return LinguisticModulePayloadSchema.parse(Object.fromEntries(sortedEntriesCollection));
};

/**
 * Valida y escribe en disco todos los diccionarios consolidados por idioma activo.
 *
 * @param aggregatedLinguisticDictionaries - Diccionarios compilados indexados por código BCP 47.
 * @returns {Promise<number>} Cantidad de archivos de idioma escritos exitosamente.
 */
export const WriteLocaleDictionariesToDisk = async (
  aggregatedLinguisticDictionaries: Readonly<Record<string, ILinguisticModulePayload>>,
): Promise<number> => {
  await Promise.all(
    WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.map(async (localeCodeLiteral: string) => {
      const outputFilePathLiteral = join(
        WEAVER_CONFIGURATION.TARGET_OUTPUT_DIRECTORY_LITERAL,
        `${localeCodeLiteral}.json`,
      );

      const rawDictionarySnapshot = aggregatedLinguisticDictionaries[localeCodeLiteral] ?? {};
      const validatedDictionarySnapshot = sortModuleKeysDeterministically(rawDictionarySnapshot);

      await filesystemPromises.writeFile(
        outputFilePathLiteral,
        `${JSON.stringify(validatedDictionarySnapshot, null, 2)}\n`,
        'utf-8',
      );
    }),
  );

  return WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION.length;
};
