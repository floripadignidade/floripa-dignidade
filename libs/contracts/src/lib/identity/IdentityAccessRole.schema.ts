/**
 * @section User Management & Identity - Authority Integrity Contracts
 * @description Única Fuente de Verdad (SSOT) para la jerarquía de autoridad institucional.
 * Define los niveles de actuación permitidos y deriva dinámicamente el esquema de
 * validación para garantizar simetría absoluta entre las constantes y el ADN de datos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad) & ISO 11179 (Nomenclatura).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IDENTITY_ACCESS_ROLES_COLLECTION
 * @description Catálogo inalterable de niveles de autoridad técnica.
 * Este objeto es la semilla de control de acceso para el ecosistema Multi-tenant.
 */
export const IDENTITY_ACCESS_ROLES_COLLECTION = {
  /**
   * Auditor de Infraestructura Administrativa:
   * Control total de SRE, Seguridad y Kernel. Máxima autoridad de auditoría forense.
   */
  INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR: 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR',

  /** Gestor Global de Plataforma: Administración operativa centralizada de la instancia. */
  PLATFORM_GLOBAL_MANAGER: 'PLATFORM_GLOBAL_MANAGER',

  /** Administrador de Organización: Autoridad total sobre un Tenant (Institución específica). */
  ORGANIZATION_ADMINISTRATOR: 'ORGANIZATION_ADMINISTRATOR',

  /** Operador de Impacto Social: Gestión de datos, indicadores y triaje territorial. */
  ORGANIZATION_OPERATOR: 'ORGANIZATION_OPERATOR',

  /** Identidad Registrada: Ciudadano con identidad validada institucionalmente. */
  IDENTITY_REGISTERED: 'IDENTITY_REGISTERED',

  /** Identidad Anónima: Perfil temporal para visitantes o procesos de captación inicial. */
  IDENTITY_ANONYMOUS: 'IDENTITY_ANONYMOUS',
} as const;

/**
 * @section Extracción Dinámica de ADN
 * Transformamos las llaves del catálogo en un Enum de Zod para asegurar que
 * el sistema de tipos y la validación en runtime sean siempre simétricos,
 * eliminando la duplicidad manual de literales.
 */
const rolesKeysCollection = Object.keys(IDENTITY_ACCESS_ROLES_COLLECTION) as [
  keyof typeof IDENTITY_ACCESS_ROLES_COLLECTION,
  ...(keyof typeof IDENTITY_ACCESS_ROLES_COLLECTION)[]
];

/**
 * @name IdentityAccessRoleSchema
 * @description Validador de integridad que certifica la legitimidad de un rol institucional.
 *
 * @prompt_ia: "Cualquier modificación en esta jerarquía debe ser notificada al
 * Inference Engine para recalibrar los pesos bayesianos en el motor de impacto social."
 */
export const IdentityAccessRoleSchema = z.enum(rolesKeysCollection)
  .describe('Jerarquía técnica de autoridad institucional bajo el estándar Multi-tenant.');

/**
 * @section ADN Tipado (Verbatim Module Syntax)
 * Representación en tiempo de compilación del contrato de acceso.
 */
export type TIdentityAccessRole = z.infer<typeof IdentityAccessRoleSchema>;
