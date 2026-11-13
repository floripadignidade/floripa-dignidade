/**
 * @section Search Engine - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el búnker de búsqueda
 * difusa institucional. Orquesta la visibilidad de los contratos de ADN,
 * esquemas de validación y lógica de descubrimiento con control de acceso (RBAC).
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ISO Technical Naming.
 * SANEADO Zenith: Elevación a v1.3.0, sincronización asíncrona y purga de rastro muerto.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.0
 * Estatus: Nivelación Zenith completada. Motor de búsqueda transformado a
 * flujo asíncrono con observabilidad omnisciente y blindaje de tipos ambientales.
 */
export const MODULE_SEARCH_ENGINE_VERSION = '1.3.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 * @description Exportación de contratos inmutables para la indexación y
 * recuperación de entidades.
 */
export {
  SearchIndexSchema,
  SearchResponseSchema,
  SearchAuthorityRoleSchema,
  SearchEntityCategorySchema,
  SearchableEntityIdentifierSchema,
} from './lib/schemas/SearchEngine.schema';

export type {
  ISearchableEntity,
  ISearchResponse,
  SearchAuthorityRole,
  SearchEntityCategory,
  SearchableEntityIdentifier,
} from './lib/schemas/SearchEngine.schema';

/**
 * @section Capa 2: Almas Lingüísticas (i18n)
 * @description Esquemas de traducción para la interfaz de búsqueda.
 */
export { SearchEngineI18nSchema } from './lib/i18n/SearchEngineI18n.schema';

export type { ISearchEngineI18n } from './lib/i18n/SearchEngineI18n.schema';

/**
 * @section Capa 3: Lógica de Descubrimiento (Discovery Logic)
 * @description Orquestador soberano para el hallazgo de información institucional.
 */
export { ExecuteFuzzySearch } from './lib/logic/ExecuteFuzzySearch';

/**
 * 🛡️ NOTA DE ARQUITECTURA:
 * El átomo 'ExecuteTechnicalFuzzySearch' permanece encapsulado dentro del búnker
 * para forzar que toda búsqueda externa pase por la aduana de seguridad (RBAC)
 * definida en el orquestador 'ExecuteFuzzySearch'.
 */
