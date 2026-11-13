/**
 * @section CMS Infrastructure - Media Vault Access Policy (Atom)
 * @description Átomo encargado exclusivamente del control de acceso basado en roles (RBAC)
 * para el acervo multimedia institucional. Sincroniza los permisos de lectura, carga,
 * edición y eliminación contra la Única Fuente de Verdad de autoridad (@floripa-dignidade/contracts).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type UserAccessRole,
} from '@floripa-dignidade/contracts';

/** Roles autorizados para cargar nuevos activos y evidencias en la nube. */
const AUTHORIZED_UPLOAD_ROLES_COLLECTION: readonly UserAccessRole[] = [
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
  IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_OPERATOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_REGISTERED,
];

/** Roles con autoridad administrativa para editar metadatos de activos existentes. */
const AUTHORIZED_UPDATE_ROLES_COLLECTION: readonly UserAccessRole[] = [
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
  IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR,
];

/** Roles de máxima autoridad habilitados para eliminar activos multimedia. */
const AUTHORIZED_DELETION_ROLES_COLLECTION: readonly UserAccessRole[] = [
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
];

/**
 * Evalúa si el rol del usuario pertenece a una colección de roles permitidos.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión activa.
 * @param allowedRolesCollection - Catálogo inmutable de roles habilitados para la acción.
 * @returns {boolean} Verdadero si el usuario posee el privilegio requerido.
 */
const hasMatchingAuthorityRoleBoolean = (
  assignedRoleCandidate: unknown,
  allowedRolesCollection: readonly UserAccessRole[],
): boolean =>
  typeof assignedRoleCandidate === 'string' &&
  allowedRolesCollection.includes(assignedRoleCandidate as UserAccessRole);

/**
 * @name MEDIA_VAULT_ACCESS_POLICY
 * @description Matriz inmutable de control de acceso RBAC para la colección multimedia.
 * Lectura pública para transparencia activa; escritura y borrado restringidos por rango.
 */
export const MEDIA_VAULT_ACCESS_POLICY: NonNullable<CollectionConfig['access']> = Object.freeze({
  read: () => true,
  create: ({ req: { user } }) =>
    hasMatchingAuthorityRoleBoolean(
      user?.['assignedAuthorityRoleLiteral'],
      AUTHORIZED_UPLOAD_ROLES_COLLECTION,
    ),
  update: ({ req: { user } }) =>
    hasMatchingAuthorityRoleBoolean(
      user?.['assignedAuthorityRoleLiteral'],
      AUTHORIZED_UPDATE_ROLES_COLLECTION,
    ),
  delete: ({ req: { user } }) =>
    hasMatchingAuthorityRoleBoolean(
      user?.['assignedAuthorityRoleLiteral'],
      AUTHORIZED_DELETION_ROLES_COLLECTION,
    ),
});
