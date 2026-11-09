/**
 * @section User Management & Identity - Package Entry Point (Barrel Master)
 * @description Único punto de exportación autorizado para el búnker de identidad
 * y autoridad institucional. Orquesta el acceso unificado a los motores de cumplimiento (RBAC),
 * sincronización de confianza bayesiana, privacidad cívica (LGPD) y gobernanza Multi-tenant.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO Zenith: Erradicación definitiva de TS2307 corrigiendo el nombre del átomo
 * TransmitIdentityAuthorityLedgerPatch y erradicación de TS2305 re-exportando los contratos
 * institucionales IUserIdentity y UserAccessRole requeridos por el enjambre.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.1
 * Estatus: Nivelación Zenith y simetría total de exportaciones de identidad.
 */
export const MODULE_IDENTITY_VERSION = '1.3.1';

/**
 * @section 1. Orquestadores de Negocio Multi-tenant
 * Flujos principales de autorización y sincronización con el Ledger Cloud.
 */
export { ValidateAccessIntegrity } from './lib/logic/ValidateAccessIntegrity.js';
export { SynchronizeIdentityAuthority } from './lib/logic/SynchronizeIdentityAuthority.js';

/**
 * @section 2. Átomos de Lógica Pura (Identity & Authority)
 * Funciones determinísticas para cálculo de confianza, privacidad y seguridad administrativa.
 */
export { AnonymizeIdentityName } from './lib/logic/atomic/AnonymizeIdentityName.js';
export { CalculateIdentityAuthority } from './lib/logic/atomic/CalculateIdentityAuthority.js';
export { CalculateIdentitySeniorityBonus } from './lib/logic/atomic/CalculateIdentitySeniorityBonus.js';
export { EvaluateIdentityAuthorityHierarchy } from './lib/logic/atomic/EvaluateIdentityAuthorityHierarchy.js';
export { MapIdentityAuthorityBonuses } from './lib/logic/atomic/MapIdentityAuthorityBonuses.js';
export { MapIdentityAuthorityToPhysicalRecord } from './lib/logic/atomic/MapIdentityAuthorityToPhysicalRecord.js';
export {
  TransmitIdentityAuthorityLedgerPatch,
  TransmitIdentityAuthorityLedgerPatch as TransmitIdentityLedgerPatch,
} from './lib/logic/atomic/TransmitIdentityAuthorityLedgerPatch.js';
export { ValidateInfrastructureAdministrativeAuthority } from './lib/logic/atomic/ValidateInfrastructureAdministrativeAuthority.js';

/**
 * @section 3. Infraestructura de Referencia (Ground Truth)
 * Constantes institucionales inmutables para calibración de algoritmos y políticas de acceso.
 */
export { AUTHORITY_WEIGHT_GROUND_TRUTH } from './lib/constants/AuthorityWeightGroundTruth.js';
export { IDENTITY_SECURITY_STANDARDS } from './lib/constants/IdentitySecurityStandards.js';

/**
 * @section 4. Contratos de Identidad y Tipos de Autoridad (SSOT Bridges)
 * Re-exportación soberana desde @floripa-dignidade/contracts para garantizar compatibilidad
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
