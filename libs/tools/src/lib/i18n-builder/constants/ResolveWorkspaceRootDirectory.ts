/**
 * @section Tools & Infrastructure - Monorepo Root Resolver (Atom)
 * @description Resuelve de forma determinista la raíz física del monorepo localizando
 * `pnpm-workspace.yaml` o `nx.json` en la jerarquía ascendente, protegiendo las tareas
 * del Weaver contra variaciones de `process.cwd()` en Vercel, Nx o subdirectorios locales.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { existsSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

const WORKSPACE_ROOT_MARKERS_COLLECTION: readonly string[] = Object.freeze([
  'pnpm-workspace.yaml',
  'nx.json',
]);

/**
 * Localiza el directorio raíz físico del monorepo ascendiendo desde el directorio inicial.
 *
 * @param startingDirectoryPathLiteral - Directorio de partida (por defecto `process.cwd()`).
 * @returns {string} Ruta absoluta normalizada de la raíz del monorepo.
 */
export const ResolveWorkspaceRootDirectory = (
  startingDirectoryPathLiteral: string = process.cwd(),
): string => {
  let currentDirectoryLiteral = resolve(startingDirectoryPathLiteral);

  while (true) {
    const isWorkspaceRootBoolean = WORKSPACE_ROOT_MARKERS_COLLECTION.some((markerFileNameLiteral) =>
      existsSync(join(currentDirectoryLiteral, markerFileNameLiteral)),
    );

    if (isWorkspaceRootBoolean) {
      return currentDirectoryLiteral;
    }

    const parentDirectoryLiteral = dirname(currentDirectoryLiteral);
    if (parentDirectoryLiteral === currentDirectoryLiteral) {
      return resolve(startingDirectoryPathLiteral);
    }

    currentDirectoryLiteral = parentDirectoryLiteral;
  }
};
