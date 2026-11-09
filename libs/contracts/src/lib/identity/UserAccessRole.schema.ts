/**
 * @section Enterprise Contracts - Authority & Role Hierarchy SSOT
 * @description Única Fuente de Verdad (SSOT) para la jerarquía de autoridad institucional.
 * Define los niveles de actuación permitidos en el ecosistema multi-tenant y deriva
 * dinámicamente el esquema de validación en tiempo de ejecución.
 *
 * Implementa la estrategia de exportación dual para garantizar compatibilidad absoluta:
 * 1. Nomenclatura ISO 11179 Estricta (IdentityAccessRoleSchema / TIdentityAccessRole).
 * 2. Alias de Compatibilidad Institucional (UserAccessRoleSchema / UserAccessRole).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO Zenith: Erradicación del error TS2305 proveyendo las exportaciones nominales
 * requeridas por las aduanas de acceso y los motores de interacción y mensajería.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @name IDENTITY_ACCESS_ROLES_COLLECTION
 * @description Catálogo inalterable de niveles de autoridad técnica e institucional.
 * Este objeto constituye la semilla de control de acceso para el ecosistema.
 */
export const IDENTITY_ACCESS_ROLES_COLLECTION = {
  /**
   * Auditor de Infraestructura Administrativa:
   * Control total de confiabilidad (SRE), ciberseguridad y auditoría forense.
   */
  INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR: 'INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR',

  /** Gestor Global de Plataforma: Administración operativa centralizada del ecosistema. */
  PLATFORM_GLOBAL_MANAGER: 'PLATFORM_GLOBAL_MANAGER',

  /** Administrador de Organización: Autoridad total sobre una institución o prefeitura específica. */
  ORGANIZATION_ADMINISTRATOR: 'ORGANIZATION_ADMINISTRATOR',

  /** Operador de Impacto Social: Gestión de datos, indicadores y triaje territorial. */
  ORGANIZATION_OPERATOR: 'ORGANIZATION_OPERATOR',

  /** Identidad Registrada: Ciudadano con identidad civil validada institucionalmente. */
  IDENTITY_REGISTERED: 'IDENTITY_REGISTERED',

  /** Identidad Anónima: Perfil temporal para visitantes o procesos de captación cívica. */
  IDENTITY_ANONYMOUS: 'IDENTITY_ANONYMOUS',
} as const;

/**
 * @name USER_ACCESS_ROLES_COLLECTION
 * @description Alias institucional para compatibilidad con módulos de negocio dependientes.
 */
export const USER_ACCESS_ROLES_COLLECTION = IDENTITY_ACCESS_ROLES_COLLECTION;

/**
 * @section Extracción Dinámica de ADN
 * Transformación de llaves del catálogo en una tupla tipada para Zod Enum.
 */
const rolesKeysCollection = Object.keys(IDENTITY_ACCESS_ROLES_COLLECTION) as [
  keyof typeof IDENTITY_ACCESS_ROLES_COLLECTION,
  ...(keyof typeof IDENTITY_ACCESS_ROLES_COLLECTION)[],
];

/**
 * @name IdentityAccessRoleSchema
 * @description Validador de integridad estructural que certifica la legitimidad de un rol institucional.
 */
export const IdentityAccessRoleSchema = z
  .enum(rolesKeysCollection)
  .describe('Jerarquía técnica de autoridad institucional bajo el estándar Multi-tenant.');

/**
 * @name UserAccessRoleSchema
 * @description Alias de compatibilidad estructural requerido por AccessIntegrityRequest y el módulo IAM.
 */
export const UserAccessRoleSchema = IdentityAccessRoleSchema;

/**
 * @section Representación de Tipos en Tiempo de Compilación
 */

/** Tipo nominal para la jerarquía de acceso institucional bajo la norma ISO 11179. */
export type TIdentityAccessRole = z.infer<typeof IdentityAccessRoleSchema>;

/** Tipo de compatibilidad histórica para los módulos consumidores del enjambre. */
export type UserAccessRole = TIdentityAccessRole;
