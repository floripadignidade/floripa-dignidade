/**
 * @section User Management & Identity - Access Control Contracts
 * @description Define el contrato de integridad para las peticiones de acceso
 * institucional. Garantiza que toda consulta al búnker de datos incluya la
 * jurisdicción (Tenant) del recurso, impidiendo fugas de información entre
 * diferentes organizaciones o prefeituras.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Mantenibilidad: ISO/IEC 25010 (Seguridad Perimetral).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { UserAccessRoleSchema } from '../UserAccessRole.schema.js';

/**
 * @section Identificadores de Jurisdicción (Branding)
 */
export const OrganizationIdentifierSchema = z.string().uuid().brand<'OrganizationIdentifier'>();
export type OrganizationIdentifier = z.infer<typeof OrganizationIdentifierSchema>;

/**
 * @name AccessIntegrityRequestSchema
 * @description Validador estructural para la autorización de transacciones Multi-tenant.
 *
 * @prompt_ia: "Asegura que 'targetOrganizationIdentifier' sea comparado físicamente
 * contra el 'organizationIdentifier' de la identidad del actor en el orquestador
 * de lógica para certificar la jurisdicción de la operación."
 */
export const AccessIntegrityRequestSchema = z.object({
  /**
   * Identificador nominal de la organización propietaria del recurso.
   * Representación: UUID v4 con sello de marca.
   */
  targetOrganizationIdentifier: OrganizationIdentifierSchema,

  /**
   * Nivel de jerarquía mínimo exigido para ejecutar la acción.
   * Representación: Literal (Sincronizado con USER_ACCESS_ROLES_COLLECTION).
   */
  requiredAccessRoleLiteral: UserAccessRoleSchema,

  /**
   * Identificador de seguimiento para la trazabilidad forense del hilo.
   * Representación: UUID v4.
   */
  correlationIdentifier: z.string().uuid()
    .describe('Semilla para la reconstrucción del flujo sanguíneo digital.'),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IAccessIntegrityRequest = z.infer<typeof AccessIntegrityRequestSchema>;
