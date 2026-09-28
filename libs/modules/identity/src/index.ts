/**
 * @section User Management & Identity - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para la lógica de identidad
 * y autoridad institucional. Orquestra el acceso a los motores de cumplimiento (RBAC),
 * sincronización de confianza y auditoría administrativa bajo el estándar Multi-tenant.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * @author Raz Podestá - MetaShark Tech
 */

/** @section 1. Orquestadores de Negocio Multi-tenant */
export { ValidateAccessIntegrity } from './lib/logic/ValidateAccessIntegrity.js';
export { SynchronizeIdentityAuthority } from './lib/logic/SynchronizeIdentityAuthority.js';

/** @section 2. Átomos de Lógica Pura (Identity & Authority) */
export { AnonymizeIdentityName } from './lib/logic/atomic/AnonymizeIdentityName.js';
export { CalculateIdentityAuthority } from './lib/logic/atomic/CalculateIdentityAuthority.js';
export { CalculateIdentitySeniorityBonus } from './lib/logic/atomic/CalculateIdentitySeniorityBonus.js';
export { MapIdentityAuthorityBonuses } from './lib/logic/atomic/MapIdentityAuthorityBonuses.js';
export { MapIdentityAuthorityToPhysicalRecord } from './lib/logic/atomic/MapIdentityAuthorityToPhysicalRecord.js';
export { TransmitIdentityLedgerPatch } from './lib/logic/atomic/TransmitIdentityLedgerPatch.js';
export { ValidateInfrastructureAdministrativeAuthority } from './lib/logic/atomic/ValidateInfrastructureAdministrativeAuthority.js';

/** @section 3. Infraestructura de Referencia (Ground Truth) */
export { AUTHORITY_WEIGHT_GROUND_TRUTH } from './lib/constants/AuthorityWeightGroundTruth.js';
export { IDENTITY_SECURITY_STANDARDS } from './lib/constants/IdentitySecurityStandards.js';
