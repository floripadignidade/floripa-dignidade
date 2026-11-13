/**
 * @section User Management & Identity - Operational Contracts (Atom)
 * @description Consolida los contratos Zod inmutables para proveedores de identidad
 * federada, evaluación jerárquica de autoridad RBAC y sincronización en el Ledger.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { UserAccessRoleSchema } from '../UserAccessRole.schema';
import { IdentityAuthorityResultSchema } from './IdentityAuthorityAudit.schema';
import {
  IdentityIdentifierSchema,
  OrganizationIdentifierSchema,
} from './IdentityIdentifiers.schema';

/**
 * @name SocialIdentityProviderSchema
 * @description Proveedores de autenticación federada o interna autorizados en la plataforma.
 */
export const SocialIdentityProviderSchema = z
  .enum(['GOOGLE_IDENTITY', 'APPLE_ID', 'INTERNAL_INFRASTRUCTURE'])
  .describe('Identificador técnico de proveedor de autenticación federada o interna.');

export type SocialIdentityProvider = z.infer<typeof SocialIdentityProviderSchema>;

/**
 * @name EvaluateIdentityAuthoritySchema
 * @description Contrato de entrada para la evaluación de jerarquía de autoridad institucional (RBAC).
 */
export const EvaluateIdentityAuthoritySchema = z
  .object({
    activeRoleLiteral: UserAccessRoleSchema.describe(
      'Rol institucional asignado actualmente al actor solicitante.',
    ),
    requiredRoleLiteral: UserAccessRoleSchema.describe(
      'Rol mínimo exigido para ejecutar la operación protegida.',
    ),
  })
  .readonly()
  .describe('Contrato para la evaluación de jerarquía de autoridad institucional.');

export type IEvaluateIdentityAuthorityParameters = z.infer<typeof EvaluateIdentityAuthoritySchema>;

/**
 * @name SynchronizeIdentityAuthoritySchema
 * @description Contrato de entrada para persistir la sincronización de autoridad en el Ledger relacional.
 */
export const SynchronizeIdentityAuthoritySchema = z
  .object({
    identityIdentifier: IdentityIdentifierSchema.describe(
      'Identificador nominal UUID del ciudadano sujeto a sincronización.',
    ),
    organizationIdentifier: OrganizationIdentifierSchema.describe(
      'Identificador nominal UUID de la organización propietaria (tenant).',
    ),
    authorityResultSnapshot: IdentityAuthorityResultSchema.describe(
      'Resultado calculado de autoridad y verificación humana a persistir.',
    ),
    correlationIdentifier: z
      .string()
      .uuid({ message: 'CORRELATION_IDENTIFIER_MUST_BE_UUID_V4' })
      .describe('Identificador único de correlación para trazabilidad forense.'),
  })
  .readonly()
  .describe('Contrato para la sincronización de autoridad institucional en el Ledger.');

export type ISynchronizeIdentityAuthorityParameters = z.infer<
  typeof SynchronizeIdentityAuthoritySchema
>;
