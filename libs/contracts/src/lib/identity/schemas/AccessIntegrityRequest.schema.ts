/**
 * @section User Management & Identity - Access Control Contracts
 * @description Define el contrato de integridad estructural para las peticiones de acceso
 * institucional. Garantiza que toda consulta al almacén de datos incluya la
 * jurisdicción (Tenant) del recurso, impidiendo fugas de información entre
 * diferentes organizaciones o prefeituras.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad Perimetral).
 * SANEADO Turbopack: Erradicación de extensiones '.js' y purga de metáforas informales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Contratos Centralizados de Identidad y Roles (Clean Paths) */
import {
  OrganizationIdentifierSchema,
  type TOrganizationIdentifier,
} from './IdentityIdentifiers.schema';

import { UserAccessRoleSchema } from '../UserAccessRole.schema';

/**
 * @section Identificadores de Jurisdicción (Branding & SSOT)
 * Re-exportación nominal para garantizar compatibilidad absoluta con consumidores existentes.
 */
export { OrganizationIdentifierSchema };
export type OrganizationIdentifier = TOrganizationIdentifier;

/**
 * @name AccessIntegrityRequestSchema
 * @description Validador estructural para la autorización de transacciones multi-tenant.
 *
 * Regla de Oro: 'targetOrganizationIdentifier' debe ser validado físicamente
 * contra el 'organizationIdentifier' de la identidad del actor en el orquestador
 * de lógica para certificar la jurisdicción de la operación.
 */
export const AccessIntegrityRequestSchema = z
  .object({
    /**
     * Identificador nominal de la organización propietaria del recurso.
     * Representación: UUID v4 con sello de marca (Branded Type).
     */
    targetOrganizationIdentifier: OrganizationIdentifierSchema.describe(
      'Identificador nominal de la organización o tenant propietaria del recurso.',
    ),

    /**
     * Nivel de jerarquía mínimo exigido para ejecutar la acción.
     * Representación: Literal sincronizado con IDENTITY_ACCESS_ROLES_COLLECTION.
     */
    requiredAccessRoleLiteral: UserAccessRoleSchema.describe(
      'Nivel de autoridad mínimo exigido en la jerarquía institucional.',
    ),

    /**
     * Identificador de seguimiento para la trazabilidad forense del hilo.
     * Representación: UUID v4 inalterable.
     */
    correlationIdentifier: z
      .string()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_CORRELACION_DEBE_SER_UUID_V4' })
      .describe('Identificador único para trazabilidad forense cruzada en el bus de eventos.'),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IAccessIntegrityRequest = z.infer<typeof AccessIntegrityRequestSchema>;
