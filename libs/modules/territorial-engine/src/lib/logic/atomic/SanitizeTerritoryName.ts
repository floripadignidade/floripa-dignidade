/**
 * @section Territorial Logic - Toponymic Sanitizer
 * @description Átomo encargado de la normalización técnica de nombres geográficos.
 * Transforma nombres con acentuación y formatos variables en firmas
 * estandarizadas (Uppercase + ASCII) para búsqueda y analítica.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Data Purity.
 * @author Raz Podestá - MetaShark Tech
 */

/**
 * Normaliza un nombre de territorio eliminando acentos y caracteres especiales.
 *
 * @param territoryNameLiteral - Nombre crudo (ej: "Florianópolis" o "Tapera ").
 * @returns {string} Nombre purificado (ej: "FLORIANOPOLIS" o "TAPERA").
 */
export const SanitizeTerritoryName = (territoryNameLiteral: string): string => {
  if (!territoryNameLiteral) {
    return 'TERRITORIO_DESCONOCIDO';
  }

  /**
   * @section Algoritmo de Normalización ISO
   * 1. NFD: Descompone caracteres combinados (e.g., 'ó' -> 'o' + '´').
   * 2. Regex: Elimina los componentes de acentuación (Non-Spacing Marks).
   * 3. Trim & Upper: Limpieza final de ruidos.
   */
  return territoryNameLiteral
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .trim()
    .toUpperCase();
};
