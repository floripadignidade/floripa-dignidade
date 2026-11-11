/**
 * @section Tools & Infrastructure - Workspace Directories Discovery Atom
 * @description Átomo encargado de rastrear recursivamente el árbol de directorios
 * del monorepo e identificar aquellos que contienen un manifiesto 'project.json'.
 * Utiliza un conjunto de exclusión inmutable para mitigar la complejidad ciclomática.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Eficiencia).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync, promises as filesystemPromises } from 'node:fs';
import { join } from 'node:path';

/**
 * @constant IGNORED_DIRECTORIES_SET
 * Conjunto de carpetas que deben omitirse durante el escaneo para preservar rendimiento.
 */
const IGNORED_DIRECTORIES_SET: ReadonlySet<string> = new Set([
  'node_modules',
  'dist',
  'out-tsc',
  '.nx',
  '.git',
  '.next',
  'tmp',
  'reports',
  '.cache',
]);

/**
 * Determina si un subdirectorio debe ser explorado recursivamente.
 */
const shouldTraverseDirectoryBoolean = (directoryNameLiteral: string): boolean => {
  return (
    !directoryNameLiteral.startsWith('.') && !IGNORED_DIRECTORIES_SET.has(directoryNameLiteral)
  );
};

/**
 * Descubre de forma recursiva todas las carpetas que constituyen workspaces de Nx.
 *
 * @param workspaceRootAbsolutePath - Ruta absoluta a la raíz física del monorepo.
 * @returns {Promise<string[]>} Lista de rutas absolutas de workspaces encontrados.
 */
export const DiscoverWorkspaceDirectories = async (
  workspaceRootAbsolutePath: string,
): Promise<string[]> => {
  const discoveredDirectoriesCollection: string[] = [];

  const searchRecursivelyAction = async (currentDirectoryAbsolutePath: string): Promise<void> => {
    const directoryEntriesCollection = await filesystemPromises.readdir(
      currentDirectoryAbsolutePath,
      { withFileTypes: true },
    );

    const hasProjectJsonBoolean = directoryEntriesCollection.some(
      (entry) => entry.isFile() && entry.name === 'project.json',
    );

    if (hasProjectJsonBoolean && currentDirectoryAbsolutePath !== workspaceRootAbsolutePath) {
      discoveredDirectoriesCollection.push(currentDirectoryAbsolutePath);
      return;
    }

    for (const entry of directoryEntriesCollection) {
      if (entry.isDirectory() && shouldTraverseDirectoryBoolean(entry.name)) {
        await searchRecursivelyAction(join(currentDirectoryAbsolutePath, entry.name));
      }
    }
  };

  await searchRecursivelyAction(join(workspaceRootAbsolutePath, 'apps'));
  await searchRecursivelyAction(join(workspaceRootAbsolutePath, 'libs'));

  const scriptsProjectPath = join(workspaceRootAbsolutePath, 'scripts', 'project.json');
  if (existsSync(scriptsProjectPath)) {
    discoveredDirectoriesCollection.push(join(workspaceRootAbsolutePath, 'scripts'));
  }

  const testsProjectPath = join(workspaceRootAbsolutePath, 'tests', 'project.json');
  if (existsSync(testsProjectPath)) {
    discoveredDirectoriesCollection.push(join(workspaceRootAbsolutePath, 'tests'));
  }

  return discoveredDirectoriesCollection;
};
