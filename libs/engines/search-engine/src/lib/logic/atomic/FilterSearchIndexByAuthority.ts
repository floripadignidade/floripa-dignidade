/**
 * @section Search Engine - Search Index RBAC Guard
 * @description Átomo de lógica pura encargado de filtrar el índice de búsqueda
 * basándose en la jerarquía de soberanía del ciudadano.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Security by Design.
 */

import type { ISearchableEntity, SearchAuthorityRole } from '../../schemas/SearchEngine.schema';

/**
 * Filtra la colección de búsqueda asegurando que el ciudadano solo descubra
 * contenidos para los cuales posee autoridad institucional.
 *
 * @param indexCollection - El universo total de datos indexados.
 * @param actorRoleLiteral - Rango de autoridad del solicitante.
 * @returns {ISearchableEntity[]} Colección filtrada y segura.
 */
export const FilterSearchIndexByAuthority = (
  indexCollection: ISearchableEntity[],
  actorRoleLiteral: SearchAuthorityRole,
): ISearchableEntity[] => {
  return indexCollection.filter((entitySnapshot) => {
    /**
     * @section Matriz de Decisión de Acceso (Bypass Protocol)
     * Los auditores SRE y gestores globales poseen visión omnisciente.
     */
    const hasAdministrativeBypassBoolean =
      actorRoleLiteral === 'INFRASTRUCTURE_SOVEREIGN_AUDITOR' ||
      actorRoleLiteral === 'PLATFORM_GLOBAL_MANAGER';

    if (hasAdministrativeBypassBoolean) return true;

    // Acceso público nominal para ciudadanos no identificados.
    if (entitySnapshot.requiredAuthorityRole === 'CITIZEN_ANONYMOUS') return true;

    // Coincidencia exacta de rango institucional.
    return entitySnapshot.requiredAuthorityRole === actorRoleLiteral;
  });
};
