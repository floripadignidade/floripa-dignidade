/**
 * @section CMS Identity - Citizen Users Access Policy (Atom)
 * @description Átomo encargado exclusivamente del control de acceso basado en roles (RBAC)
 * para la colección de ciudadanos y operadores en Payload CMS. Protege contra lecturas
 * anónimas, escalada de privilegios y mutaciones cruzadas, sincronizándose con la Única
 * Fuente de Verdad de autoridad (`@floripa-dignidade/contracts`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad) y LGPD (Lei 13.709/2018).
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

/** Roles institucionales autorizados para gestionar roles y verificaciones de identidad. */
const AUTHORIZED_IDENTITY_MANAGEMENT_ROLES_COLLECTION: readonly UserAccessRole[] = Object.freeze([
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
]);

/**
 * Evalúa si el rol asignado al operador posee autoridad administrativa o de gestión global
 * para modificar niveles de acceso o certificaciones de verificación legal.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión autenticada.
 * @returns {boolean} Verdadero si posee privilegios de gestión sobre identidades.
 */
export const hasIdentityRoleManagementAuthorityBoolean = (
  assignedRoleCandidate: unknown,
): boolean =>
  typeof assignedRoleCandidate === 'string' &&
  AUTHORIZED_IDENTITY_MANAGEMENT_ROLES_COLLECTION.includes(assignedRoleCandidate as UserAccessRole);

/**
 * Evalúa si el operador posee el rango máximo de auditoría administrativa de infraestructura.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión autenticada.
 * @returns {boolean} Verdadero únicamente para auditores administrativos de infraestructura.
 */
const isInfrastructureAdministrativeAuditorBoolean = (assignedRoleCandidate: unknown): boolean =>
  assignedRoleCandidate === IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR;

/**
 * @name CITIZEN_USERS_ACCESS_POLICY
 * @description Matriz inmutable de control de acceso RBAC para la colección `citizen-users`.
 */
export const CITIZEN_USERS_ACCESS_POLICY: NonNullable<CollectionConfig['access']> = Object.freeze({
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

  create: () => true,

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
