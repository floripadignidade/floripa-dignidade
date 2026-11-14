/**
 * @section Search Engine Logic - Authority Rank Resolver (Atom)
 * @description Átomo de lógica pura encargado de traducir cualquier rango de autoridad
 * institucional (canónico de `@floripa-dignidade/contracts` o alias transicional legado)
 * a su peso numérico jerárquico (`0` a `100`), aplicando estrategia Fail-Closed ante
 * valores desconocidos y previniendo contaminación de prototipos mediante `Map`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { IDENTITY_ACCESS_ROLES_COLLECTION } from '@floripa-dignidade/contracts';

/**
 * Mapa inmutable de pesos jerárquicos alineado con la escala institucional de `modules/identity`.
 */
const AUTHORITY_ROLE_RANKS_MAP: ReadonlyMap<string, number> = new Map<string, number>([
  [IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR, 100],
  ['INFRASTRUCTURE_SOVEREIGN_AUDITOR', 100],
  [IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER, 90],
  [IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR, 80],
  [IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_OPERATOR, 70],
  [IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_REGISTERED, 20],
  ['CITIZEN_REGISTERED', 20],
  [IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_ANONYMOUS, 0],
  ['CITIZEN_ANONYMOUS', 0],
]);

/**
 * Resuelve el rango jerárquico numérico de un rol institucional reconocido.
 *
 * @param authorityRoleLiteral - Identificador literal del rol a evaluar.
 * @param fallbackRankNumeric - Rango de respaldo Fail-Closed si el rol no está catalogado.
 * @returns {number} Peso numérico jerárquico del rol o el respaldo proporcionado.
 */
export const ResolveSearchAuthorityRank = (
  authorityRoleLiteral: string,
  fallbackRankNumeric: number,
): number => {
  return AUTHORITY_ROLE_RANKS_MAP.get(authorityRoleLiteral) ?? fallbackRankNumeric;
};
