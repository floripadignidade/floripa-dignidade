/**
 * @section Search Engine - Configuration Constants (SSOT)
 * @description Única Fuente de Verdad (SSOT) para los parámetros de calibración del
 * motor de búsqueda difusa institucional (Fuse.js). Define la sensibilidad algorítmica,
 * los pesos de relevancia y las claves de indexación bajo estándares de alta precisión técnica.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IFuseOptions } from 'fuse.js';

import type { ISearchableEntity } from '../schemas/SearchEngine.schema';

/**
 * @name GLOBAL_FUSE_CONFIGURATION_OPTIONS
 * @description Configuración inmutable y tipada para el algoritmo de coincidencia semántica difusa.
 * Parametrizada explícitamente con `ISearchableEntity` para certificar que las claves y pesos
 * correspondan estrictamente al contrato estructural auditado.
 */
export const GLOBAL_FUSE_CONFIGURATION_OPTIONS: IFuseOptions<ISearchableEntity> = Object.freeze({
  /**
   * @section Matriz de Relevancia (Weighting System)
   * Define la jerarquía de ponderación de cada propiedad en el cálculo de coincidencia.
   */
  keys: [
    {
      name: 'titleLiteral',
      weight: 1.0,
    },
    {
      name: 'indexKeywordsCollection',
      weight: 0.8,
    },
    {
      name: 'contentDescriptionSnippet',
      weight: 0.5,
    },
  ],

  /**
   * Umbral de coincidencia (Threshold).
   * 0.0 exige coincidencia matemática perfecta; 1.0 acepta cualquier rastro de ruido.
   * Valor nominal: 0.35 para balancear tolerancia a errores tipográficos y precisión cívica.
   */
  threshold: 0.35,

  /**
   * @section Capacidades y Filtros de Búsqueda
   */
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,
});
