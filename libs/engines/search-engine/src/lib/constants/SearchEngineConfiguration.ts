/**
 * @section Search Engine - Configuration Constants
 * @description Única Fuente de Verdad (SSOT) para los parámetros del motor
 * de búsqueda difusa. Define la sensibilidad, los pesos de relevancia y
 * las claves de indexación bajo estándares de alta precisión técnica.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Resolución de TS2315 (Non-generic IFuseOptions), inyección
 * de extensiones ESM (.js) y cumplimiento de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IFuseOptions } from 'fuse.js';

/* 1. ADN Estructural (Verbatim Module Syntax) */
/** 🛡️ SANEADO Zenith: Inyección de extensión '.js' para resolución de Grafo. */
// import type { ISearchableEntity } from '../schemas/SearchEngine.schema.js';

/**
 * @name GLOBAL_FUSE_CONFIGURATION_OPTIONS
 * @description Manifiesto de calibración para el algoritmo de coincidencia.
 *
 * 🛡️ LEY DE IDENTIDAD (Fix TS2315):
 * Se remueve el parámetro genérico <ISearchableEntity> ya que el ADN del búnker
 * ha evolucionado hacia una interfaz de configuración agnóstica para optimizar
 * el motor de tipos ambiental.
 */
export const GLOBAL_FUSE_CONFIGURATION_OPTIONS: IFuseOptions = {
  /**
   * @section Matriz de Relevancia (Weighting System)
   * Define la importancia jerárquica de cada campo en el cálculo del score.
   */
  keys: [
    {
      name: 'titleLiteral',
      weight: 1.0
    },
    {
      name: 'indexKeywordsCollection',
      weight: 0.8
    },
    {
      name: 'contentDescriptionSnippet',
      weight: 0.5
    }
  ],

  /**
   * Umbral de coincidencia (Threshold).
   * 0.0 exige coincidencia perfecta; 1.0 acepta cualquier rastro de ruido.
   * Valor nominal: 0.35 para balancear precisión y usabilidad ciudadana.
   */
  threshold: 0.35,

  /**
   * @section Capacidades del Motor
   */
  includeScore: true,
  ignoreLocation: true,
  minMatchCharLength: 2,

} as const; // Sellado inmutable para el enjambre.
