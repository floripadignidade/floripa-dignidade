/**
 * @section Search Engine - Configuration Constants
 * @description Única Fuente de Verdad (SSOT) para los parámetros del motor
 * de búsqueda difusa institucional. Define la sensibilidad, los pesos de relevancia y
 * las claves de indexación bajo estándares de alta precisión técnica.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Mantenibilidad).
 * SANEADO Zenith: Erradicación del error TS2314 parametrizando genéricamente IFuseOptions
 * con el contrato ISearchableEntity e inyectando resolución ESM estricta (.js).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IFuseOptions } from 'fuse.js';

/* 1. Contratos de ADN Estructural de Dominio */
import type { ISearchableEntity } from '../schemas/SearchEngine.schema.js';

/**
 * @name GLOBAL_FUSE_CONFIGURATION_OPTIONS
 * @description Manifiesto de calibración para el algoritmo de coincidencia semántica difusa.
 * Parametrizado explícitamente con ISearchableEntity para garantizar que los pesos y campos
 * de búsqueda correspondan al esquema auditado por la aduana Zod.
 */
export const GLOBAL_FUSE_CONFIGURATION_OPTIONS: IFuseOptions<ISearchableEntity> = {
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
};
