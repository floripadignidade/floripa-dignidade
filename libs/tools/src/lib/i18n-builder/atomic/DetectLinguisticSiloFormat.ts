/**
 * @section Tools & Infrastructure - Silo Format Detector (Atom)
 * @description Átomo de lógica pura encargado de identificar la topología física de un
 * directorio `i18n/`: formato canónico ADR 0030 (`FOLDER_PER_LOCALE`) frente a formato
 * transicional plano (`LEGACY_FLAT_FILE`), escalando dinámicamente con el catálogo SSOT.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

import { type TLinguisticSiloFormat, WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration';

/**
 * Determina el formato estructural de un silo `i18n/` verificando subcarpetas BCP 47 activas.
 *
 * @param siloDirectoryPathLiteral - Ruta absoluta del directorio `i18n/`.
 * @returns {Promise<TLinguisticSiloFormat>} `FOLDER_PER_LOCALE` o `LEGACY_FLAT_FILE`.
 */
export const DetectLinguisticSiloFormat = async (
  siloDirectoryPathLiteral: string,
): Promise<TLinguisticSiloFormat> => {
  const sourceLocaleFolderPathLiteral = join(
    siloDirectoryPathLiteral,
    WEAVER_CONFIGURATION.SOURCE_LOCALE_IDENTIFIER,
  );

  if (existsSync(sourceLocaleFolderPathLiteral)) {
    const folderStat = await filesystemPromises.stat(sourceLocaleFolderPathLiteral);
    if (folderStat.isDirectory()) {
      return 'FOLDER_PER_LOCALE';
    }
  }

  const activeLocaleCodesSet = new Set<string>(WEAVER_CONFIGURATION.SUPPORTED_LOCALES_COLLECTION);
  const entriesCollection = await filesystemPromises.readdir(siloDirectoryPathLiteral, {
    withFileTypes: true,
  });

  const hasLocaleSubfolderBoolean = entriesCollection.some(
    (entry) => entry.isDirectory() && activeLocaleCodesSet.has(entry.name),
  );

  return hasLocaleSubfolderBoolean ? 'FOLDER_PER_LOCALE' : 'LEGACY_FLAT_FILE';
};
