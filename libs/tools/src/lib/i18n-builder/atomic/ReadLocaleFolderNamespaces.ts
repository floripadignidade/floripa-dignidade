/**
 * @section Tools & Infrastructure - Locale Folder Namespaces Reader (Atom)
 * @description Átomo encargado de leer de forma concurrente y determinista todos los
 * archivos `<namespace>.json` dentro de una carpeta de idioma (`i18n/<bcp47-locale>/`),
 * ensamblando el objeto consolidado de namespaces por orden alfabético estable.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: BCP 47 (RFC 5646), ISO/IEC 11179 e ISO/IEC 25010 (Rendimiento y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { basename, join } from 'node:path';

import type { ILinguisticParityViolation } from '../constants/WeaverConfiguration';
import { ParseLinguisticJsonFile } from './ParseLinguisticJsonFile';

/**
 * @interface IReadLocaleFolderNamespacesParameters
 * @description Contrato inmutable de entrada para extraer los namespaces de un idioma.
 */
export interface IReadLocaleFolderNamespacesParameters {
  readonly localeDirectoryPathLiteral: string;
  readonly moduleIdentifierLiteral: string;
  readonly localeCodeLiteral: string;
  readonly correlationIdentifier: string;
}

/**
 * @interface IReadLocaleFolderNamespacesResult
 * @description Resultado sellado con el mapa de namespaces del idioma y violaciones sintácticas.
 */
export interface IReadLocaleFolderNamespacesResult {
  readonly namespacePayload: Readonly<Record<string, unknown>> | null;
  readonly syntaxViolationsCollection: readonly ILinguisticParityViolation[];
}

/**
 * Lee y valida concurrentemente todos los archivos JSON de namespaces de un idioma.
 *
 * @param parametersSnapshot - Ruta de la carpeta de idioma, metadatos de módulo y correlación.
 * @returns {Promise<IReadLocaleFolderNamespacesResult>} Objeto consolidado por namespace o `null`.
 */
export const ReadLocaleFolderNamespaces = async (
  parametersSnapshot: IReadLocaleFolderNamespacesParameters,
): Promise<IReadLocaleFolderNamespacesResult> => {
  const {
    localeDirectoryPathLiteral,
    moduleIdentifierLiteral,
    localeCodeLiteral,
    correlationIdentifier,
  } = parametersSnapshot;

  if (!existsSync(localeDirectoryPathLiteral)) {
    return Object.freeze({
      namespacePayload: null,
      syntaxViolationsCollection: Object.freeze([]),
    });
  }

  const directoryStat = await filesystemPromises.stat(localeDirectoryPathLiteral);
  if (!directoryStat.isDirectory()) {
    return Object.freeze({
      namespacePayload: null,
      syntaxViolationsCollection: Object.freeze([]),
    });
  }

  const entriesCollection = await filesystemPromises.readdir(localeDirectoryPathLiteral, {
    withFileTypes: true,
  });

  const sortedJsonFilesCollection = entriesCollection
    .filter((entry) => entry.isFile() && entry.name.endsWith('.json'))
    .sort((firstEntry, secondEntry) => firstEntry.name.localeCompare(secondEntry.name));

  if (sortedJsonFilesCollection.length === 0) {
    return Object.freeze({
      namespacePayload: null,
      syntaxViolationsCollection: Object.freeze([]),
    });
  }

  const parsedEntriesCollection = await Promise.all(
    sortedJsonFilesCollection.map(async (jsonFileEntry) => {
      const namespaceLiteral = basename(jsonFileEntry.name, '.json');
      const filePathLiteral = join(localeDirectoryPathLiteral, jsonFileEntry.name);
      const parseResult = await ParseLinguisticJsonFile({
        filePathLiteral,
        moduleIdentifierLiteral,
        localeCodeLiteral,
        namespaceLiteral,
        correlationIdentifier,
      });

      return { namespaceLiteral, ...parseResult };
    }),
  );

  const mergedNamespacesPayload: Record<string, unknown> = {};
  const syntaxViolationsCollection: ILinguisticParityViolation[] = [];

  for (const parsedEntry of parsedEntriesCollection) {
    if (parsedEntry.syntaxViolation) {
      syntaxViolationsCollection.push(parsedEntry.syntaxViolation);
    } else if (parsedEntry.parsedPayload) {
      mergedNamespacesPayload[parsedEntry.namespaceLiteral] = parsedEntry.parsedPayload;
    }
  }

  const hasLoadedNamespacesBoolean = Object.keys(mergedNamespacesPayload).length > 0;

  return Object.freeze({
    namespacePayload: hasLoadedNamespacesBoolean ? Object.freeze(mergedNamespacesPayload) : null,
    syntaxViolationsCollection: Object.freeze(syntaxViolationsCollection),
  });
};
