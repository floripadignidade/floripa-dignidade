/**
 * @section Tools & Infrastructure - Linguistic Silo Directory Discovery (Atom)
 * @description Átomo encargado exclusivamente de validar la existencia del directorio
 * raíz objetivo, aplicar las políticas de exclusión definidas en `WEAVER_CONFIGURATION`
 * y descubrir de forma concurrente y determinista todos los directorios `i18n` válidos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Eficiencia y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join, normalize } from 'node:path';

import { WEAVER_CONFIGURATION } from '../constants/WeaverConfiguration';

/**
 * Evalúa si un directorio debe omitirse durante el rastreo por nombre reservado o ruta excluida.
 *
 * @param directoryNameLiteral - Nombre base del directorio bajo evaluación.
 * @param directoryFullPathLiteral - Ruta física absoluta del directorio evaluado.
 * @returns {boolean} Verdadero si el directorio está excluido del escaneo lingüístico.
 */
const isExcludedDirectoryBoolean = (
  directoryNameLiteral: string,
  directoryFullPathLiteral: string,
): boolean => {
  const normalizedFullPathLiteral = normalize(directoryFullPathLiteral);

  const isExcludedPathBoolean = WEAVER_CONFIGURATION.EXCLUDED_DIRECTORY_PATHS_COLLECTION.some(
    (excludedPathLiteral) => normalize(excludedPathLiteral) === normalizedFullPathLiteral,
  );

  const isExcludedNameBoolean =
    directoryNameLiteral.startsWith('.') ||
    WEAVER_CONFIGURATION.EXCLUDED_DIRECTORY_NAMES_COLLECTION.includes(directoryNameLiteral);

  return isExcludedPathBoolean || isExcludedNameBoolean;
};

/**
 * Explora concurrentemente un directorio y retorna las rutas de todos los silos `i18n` hallados.
 *
 * @param currentDirectoryPathLiteral - Ruta normalizada actual bajo recorrido.
 * @returns {Promise<string[]>} Colección acumulada de rutas a directorios `i18n`.
 */
const traverseDirectoryConcurrentlyAction = async (
  currentDirectoryPathLiteral: string,
): Promise<string[]> => {
  const directoryEntriesCollection = await filesystemPromises.readdir(currentDirectoryPathLiteral, {
    withFileTypes: true,
  });

  const directSiloPathsCollection: string[] = [];
  const childDirectoriesCollection: string[] = [];

  for (const directoryEntry of directoryEntriesCollection) {
    if (!directoryEntry.isDirectory()) {
      continue;
    }

    const entryFullPathLiteral = join(currentDirectoryPathLiteral, directoryEntry.name);
    if (isExcludedDirectoryBoolean(directoryEntry.name, entryFullPathLiteral)) {
      continue;
    }

    if (directoryEntry.name === 'i18n') {
      directSiloPathsCollection.push(entryFullPathLiteral);
      continue;
    }

    childDirectoriesCollection.push(entryFullPathLiteral);
  }

  const nestedDiscoveryResultsCollection = await Promise.all(
    childDirectoriesCollection.map((childDirectoryPathLiteral) =>
      traverseDirectoryConcurrentlyAction(childDirectoryPathLiteral),
    ),
  );

  return [...directSiloPathsCollection, ...nestedDiscoveryResultsCollection.flat()];
};

/**
 * Descubre y ordena de forma determinista todos los directorios `i18n` bajo una raíz física.
 *
 * @param rootDirectoryPathLiteral - Directorio base de búsqueda (`libs/` o `apps/`).
 * @returns {Promise<readonly string[]>} Colección inmutable y ordenada de rutas absolutas a silos.
 */
export const DiscoverLinguisticSiloDirectories = async (
  rootDirectoryPathLiteral: string,
): Promise<readonly string[]> => {
  const normalizedRootPathLiteral = normalize(rootDirectoryPathLiteral);

  if (!existsSync(normalizedRootPathLiteral)) {
    return Object.freeze([]);
  }

  const discoveredPathsCollection =
    await traverseDirectoryConcurrentlyAction(normalizedRootPathLiteral);

  return Object.freeze(discoveredPathsCollection.sort());
};
