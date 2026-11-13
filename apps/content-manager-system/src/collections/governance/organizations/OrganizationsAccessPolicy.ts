/**
 * @section CMS Governance - Organizations Access Policy (Atom)
 * @description Átomo encargado exclusivamente del control de acceso basado en roles (RBAC)
 * para la colección de organizaciones institucionales. Sincroniza los permisos contra la
 * Única Fuente de Verdad de autoridad (@floripa-dignidade/contracts).
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

/** Roles institucionales autorizados para crear y modificar organizaciones. */
const AUTHORIZED_GOVERNANCE_ROLES_COLLECTION: readonly UserAccessRole[] = [
  IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
  IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
];

/**
 * Evalúa si el rol asignado al operador permite gestionar entidades institucionales.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión del usuario.
 * @returns {boolean} Verdadero si posee privilegios de gestión organizacional.
 */
const hasOrganizationManagementAuthorityBoolean = (assignedRoleCandidate: unknown): boolean =>
  typeof assignedRoleCandidate === 'string' &&
  AUTHORIZED_GOVERNANCE_ROLES_COLLECTION.includes(assignedRoleCandidate as UserAccessRole);

/**
 * Evalúa si el operador posee el rango máximo de auditoría administrativa de infraestructura.
 *
 * @param assignedRoleCandidate - Valor crudo del rol leído desde la sesión del usuario.
 * @returns {boolean} Verdadero únicamente para auditores administrativos de infraestructura.
 */
const isInfrastructureAdministrativeAuditorBoolean = (assignedRoleCandidate: unknown): boolean =>
  assignedRoleCandidate === IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR;

/**
 * @name ORGANIZATIONS_ACCESS_POLICY
 * @description Matriz inmutable de control de acceso RBAC para organizaciones en el CMS.
 * Acceso mediante signatura de índice para cumplir con 'noPropertyAccessFromIndexSignature'.
 */
export const ORGANIZATIONS_ACCESS_POLICY: NonNullable<CollectionConfig['access']> = Object.freeze({
  read: () => true,
  create: ({ req: { user } }) =>
    hasOrganizationManagementAuthorityBoolean(user?.['assignedAuthorityRoleLiteral']),
  update: ({ req: { user } }) =>
    hasOrganizationManagementAuthorityBoolean(user?.['assignedAuthorityRoleLiteral']),
  delete: ({ req: { user } }) =>
    isInfrastructureAdministrativeAuditorBoolean(user?.['assignedAuthorityRoleLiteral']),
});
