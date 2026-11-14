/**
 * @section User Management & Identity - Package Entry Point (Master Barrel)
 * @description Único punto de exportación autorizado para el módulo de identidad
 * y autoridad institucional. Orquesta el acceso unificado a los motores de control
 * de acceso basado en roles (RBAC), sincronización de confianza bayesiana, privacidad
 * cívica (LGPD) y gobernanza multi-tenant bajo la doctrina Source-First (Rutas Limpias).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.2
 * Estatus: Nivelación de rutas limpias (Extensionless) para Next.js 16 y Turbopack.
 */
export const MODULE_IDENTITY_VERSION = '1.3.2';

/**
 * @section 1. Orquestadores de Negocio Multi-tenant
 * Flujos principales de autorización y sincronización con el Ledger Cloud.
 */
export { ValidateAccessIntegrity } from './lib/logic/ValidateAccessIntegrity';
export { SynchronizeIdentityAuthority } from './lib/logic/SynchronizeIdentityAuthority';

/**
 * @section 2. Átomos de Lógica Pura (Identity & Authority)
 * Funciones determinísticas para cálculo de confianza, privacidad y seguridad administrativa.
 */
export { AnonymizeIdentityName } from './lib/logic/atomic/AnonymizeIdentityName';
export { CalculateIdentityAuthority } from './lib/logic/atomic/CalculateIdentityAuthority';
export { CalculateIdentitySeniorityBonus } from './lib/logic/atomic/CalculateIdentitySeniorityBonus';
export { EvaluateIdentityAuthorityHierarchy } from './lib/logic/atomic/EvaluateIdentityAuthorityHierarchy';
export { MapIdentityAuthorityBonuses } from './lib/logic/atomic/MapIdentityAuthorityBonuses';
export { MapIdentityAuthorityToPhysicalRecord } from './lib/logic/atomic/MapIdentityAuthorityToPhysicalRecord';
export {
  TransmitIdentityAuthorityLedgerPatch,
  TransmitIdentityAuthorityLedgerPatch as TransmitIdentityLedgerPatch,
} from './lib/logic/atomic/TransmitIdentityAuthorityLedgerPatch';
export { ValidateInfrastructureAdministrativeAuthority } from './lib/logic/atomic/ValidateInfrastructureAdministrativeAuthority';

/**
 * @section 3. Infraestructura de Referencia (Ground Truth)
 * Constantes institucionales inmutables para calibración de algoritmos y políticas de acceso.
 */
export { AUTHORITY_WEIGHT_GROUND_TRUTH } from './lib/constants/AuthorityWeightGroundTruth';
export { IDENTITY_SECURITY_STANDARDS } from './lib/constants/IdentitySecurityStandards';

/**
 * @section 4. Contratos de Identidad y Tipos de Autoridad (SSOT Bridges)
 * Re-exportación institucional desde `@floripa-dignidade/contracts` para garantizar compatibilidad
 * absoluta con los módulos consumidores (messaging-engine, interaction-engine, CMS).
 */
export {
  IdentityAccessRoleSchema,
  IdentityAccessRoleSchema as UserAccessRoleSchema,
  IdentityProfileSchema,
  IdentityProfileSchema as UserIdentitySchema,
  IdentityTrustLevelEnum,
} from '@floripa-dignidade/contracts';

export type {
  IIdentityProfile,
  IIdentityProfile as IUserIdentity,
  TIdentityAccessRole,
  TIdentityAccessRole as UserAccessRole,
  TIdentityTrustLevel,
} from '@floripa-dignidade/contracts';
