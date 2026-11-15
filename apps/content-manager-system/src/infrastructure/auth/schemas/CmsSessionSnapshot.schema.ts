/**
 * @file apps/content-manager-system/src/infrastructure/auth/schemas/CmsSessionSnapshot.schema.ts
 * @section CMS Authentication Contracts - Session Snapshot Schema (Atom)
 * @description Define el contrato Zod inmutable para el resultado de verificación de sesión
 * en servidor mediante cookie `HttpOnly` (`payload-token`) y control RBAC en el CMS.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  IdentityAccessRoleSchema,
  type TIdentityAccessRole,
} from '@floripa-dignidade/contracts';

/**
 * @name CMS_AUTHORIZED_OPERATOR_ROLES_COLLECTION
 * @description Roles institucionales habilitados para ingresar al panel administrativo y al dashboard del CMS.
 */
export const CMS_AUTHORIZED_OPERATOR_ROLES_COLLECTION: readonly TIdentityAccessRole[] =
  Object.freeze([
    IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
    IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
    IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR,
    IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_OPERATOR,
  ]);

/**
 * @name CmsSessionStatusSchema
 * @description Estados ontológicos posibles tras validar la cookie de sesión en el servidor.
 */
export const CmsSessionStatusSchema = z
  .enum([
    'AUTHENTICATED_OPERATOR',
    'BOOTSTRAP_REQUIRED',
    'UNAUTHENTICATED_VISITOR',
    'INSUFFICIENT_AUTHORITY',
  ])
  .describe('Estado de autorización resuelto por el servidor para el solicitante.');

export type TCmsSessionStatus = z.infer<typeof CmsSessionStatusSchema>;

/**
 * @name CmsSessionSnapshotSchema
 * @description Aduana Zod inmutable para el snapshot de sesión expuesto a las vistas `(app)`.
 */
export const CmsSessionSnapshotSchema = z
  .object({
    sessionStatusLiteral: CmsSessionStatusSchema,
    isAuthenticatedBoolean: z.boolean(),
    isAuthorizedForAdminBoolean: z.boolean(),
    userIdentifierLiteral: z.string().trim().min(1).nullable(),
    assignedAuthorityRoleLiteral: IdentityAccessRoleSchema.nullable(),
    operatorDisplayNameLiteral: z.string().trim().min(1).nullable(),
    correlationIdentifier: z.string().uuid(),
    verifiedAtTimestampISO: z.string().datetime(),
  })
  .readonly();

export type ICmsSessionSnapshot = z.infer<typeof CmsSessionSnapshotSchema>;
