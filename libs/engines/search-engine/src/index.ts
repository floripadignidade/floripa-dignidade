/**
 * @section Search Engine - Package Entry Point (Barrel)
 * @description Orquestador soberano del motor de búsqueda difusa institucional.
 * Centraliza la exportación de contratos de ADN, esquemas de validación y
 * lógica de descubrimiento con control de acceso (RBAC).
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution.
 * SANEADO Zenith: Inyección de declaración externa (index.d.ts) para evitar TS2665.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.0
 * Estatus: Nivelación Zenith completada. Grafo de tipos saneado.
 */
export const MODULE_SEARCH_ENGINE_VERSION = '1.2.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 */
export * from './lib/schemas/SearchEngine.schema';

/**
 * @section Capa 2: Almas Lingüísticas (i18n)
 */
export * from './lib/i18n/SearchEngineI18n.schema';

/**
 * @section Capa 3: Lógica de Motor (Discovery Logic)
 */
export { ExecuteFuzzySearch } from './lib/logic/ExecuteFuzzySearch';
