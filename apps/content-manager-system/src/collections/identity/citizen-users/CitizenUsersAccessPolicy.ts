/**
 * @file apps/content-manager-system/src/collections/identity/citizen-users/CitizenUsersAccessPolicy.ts
 * @section CMS Identity - Citizen Users Access Policy (Atom)
 * @description Controla el acceso basado en roles (RBAC) para `citizen-users` en Payload CMS:
 * restringe el panel `/admin` a roles institucionales autorizados, bloquea el registro público
 * una vez completado el bootstrap inicial (`totalDocs === 0`) y protege contra lecturas anónimas
 * o mutaciones cruzadas conforme a ISO/IEC 27001 y LGPD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type UserAccessRole,
} from '@floripa-dignidade/contracts';

const AUTHORIZED_IDENTITY_MANAGEMENT_ROLES_COLLECTION: readonly UserAccessRole[] = Object.freeze([
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
]);

const AUTHORIZED_ADMIN_PANEL_ROLES_COLLECTION: readonly UserAccessRole[] = Object.freeze([
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
  IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_OPERATOR,
]);

/**
 * Evalúa si el rol asignado al operador posee autoridad para gestionar identidades y roles.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión autenticada.
 * @returns {boolean} Verdadero si posee privilegios de gestión sobre identidades.
 */
export const hasIdentityRoleManagementAuthorityBoolean = (
  assignedRoleCandidate: unknown,
): boolean =>
  typeof assignedRoleCandidate === 'string' &&
  AUTHORIZED_IDENTITY_MANAGEMENT_ROLES_COLLECTION.includes(assignedRoleCandidate as UserAccessRole);

const hasAdminPanelAuthorityBoolean = (assignedRoleCandidate: unknown): boolean =>
  typeof assignedRoleCandidate === 'string' &&
  AUTHORIZED_ADMIN_PANEL_ROLES_COLLECTION.includes(assignedRoleCandidate as UserAccessRole);

const isInfrastructureAdministrativeAuditorBoolean = (assignedRoleCandidate: unknown): boolean =>
  assignedRoleCandidate === IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR;

/**
 * @name CITIZEN_USERS_ACCESS_POLICY
 * @description Matriz inmutable de control de acceso RBAC para la colección `citizen-users`.
 */
export const CITIZEN_USERS_ACCESS_POLICY: NonNullable<CollectionConfig['access']> = Object.freeze({
  admin: (accessArgumentsSnapshot) =>
    hasAdminPanelAuthorityBoolean(
      accessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
    ),

  read: (accessArgumentsSnapshot) => {
    const authenticatedUser = accessArgumentsSnapshot.req.user;
    if (!authenticatedUser) {
      return false;
    }

    if (
      isInfrastructureAdministrativeAuditorBoolean(
        authenticatedUser['assignedAuthorityRoleLiteral'],
      )
    ) {
      return true;
    }

    return {
      id: {
        equals: authenticatedUser.id,
      },
    };
  },

  create: async (accessArgumentsSnapshot) => {
    const authenticatedUser = accessArgumentsSnapshot.req.user;

    if (
      hasIdentityRoleManagementAuthorityBoolean(authenticatedUser?.['assignedAuthorityRoleLiteral'])
    ) {
      return true;
    }

    if (authenticatedUser) {
      return false;
    }

    const { totalDocs } = await accessArgumentsSnapshot.req.payload.count({
      collection: 'citizen-users',
      req: accessArgumentsSnapshot.req,
      overrideAccess: true,
    });

    return totalDocs === 0;
  },

  update: (accessArgumentsSnapshot) => {
    const authenticatedUser = accessArgumentsSnapshot.req.user;
    if (!authenticatedUser) {
      return false;
    }

    if (
      hasIdentityRoleManagementAuthorityBoolean(authenticatedUser['assignedAuthorityRoleLiteral'])
    ) {
      return true;
    }

    return {
      id: {
        equals: authenticatedUser.id,
      },
    };
  },

  delete: (accessArgumentsSnapshot) =>
    isInfrastructureAdministrativeAuditorBoolean(
      accessArgumentsSnapshot.req.user?.['assignedAuthorityRoleLiteral'],
    ),
});
