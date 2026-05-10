/**
 * @section Search Engine - Configuration Constants
 * @description Define los parámetros inmutables para el motor de búsqueda difusa.
 * Protocolo OEDP-V17.0 - ISO Technical Naming.
 */

import type { IFuseOptions } from 'fuse.js';
import type { ISearchableEntity } from '../schemas/SearchEngine.schema';

/**
 * @name GLOBAL_FUSE_CONFIGURATION_OPTIONS
 * @description Configuración de sensibilidad y pesos para el algoritmo Fuse.js.
 */
export const GLOBAL_FUSE_CONFIGURATION_OPTIONS: IFuseOptions<ISearchableEntity> = {
  keys: [
    { name: 'titleLiteral', weight: 1.0 },
    { name: 'indexKeywordsCollection', weight: 0.8 },
    { name: 'contentDescriptionSnippet', weight: 0.5 }
  ],
  threshold: 0.35,
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
};
