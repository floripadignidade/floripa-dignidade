/**
 * @section Shared Utility - Enterprise Global Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el módulo de utilidades
 * transversales del ecosistema Floripa Dignidade. Orquesta la visibilidad de algoritmos
 * de privacidad (LGPD), motores de persistencia isomórfica, cabeceras de seguridad y
 * sensores de hardware.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 * SANEADO Zenith:
 * 1. Exportación canónica de 'MaskCitizenIdentity' y 'MaskSovereignIdentity' para sanar TS2305.
 * 2. Re-exportación completa de contratos de privacidad, esquemas y tipos bridados.
 * 3. Rutas limpias (Extensionless) para compatibilidad total con Turbopack y Next.js 16.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.2
 * Estatus: Nivelación Zenith y simetría total de exportaciones de privacidad y almacenamiento.
 */
export const SHARED_UTILITY_VERSION = '1.2.2';

/**
 * ============================================================================
 * @section 1. SEGURIDAD Y PRIVACIDAD CIUDADANA (LGPD & PII Shield)
 * ============================================================================
 */
export {
  MaskCitizenIdentity,
  MaskSovereignIdentity,
  MaskedIdentityLiteralSchema,
} from './logic/MaskSovereignIdentity';

export type { TMaskedIdentityLiteral } from './logic/MaskSovereignIdentity';

export {
  IdentityMaskingStrategySchema,
  MaskIdentityParametersSchema,
} from './logic/schemas/MaskSovereignIdentity.schema';

export type {
  IMaskIdentityParameters,
  TIdentityMaskingStrategy,
} from './logic/schemas/MaskSovereignIdentity.schema';

/**
 * ============================================================================
 * @section 2. INFRAESTRUCTURA DE ESTILOS Y SEGURIDAD HTTP PERIMETRAL
 * ============================================================================
 */
export { GlobalStyleClassMerger } from './styles/GlobalStyleClassMerger';
export { GLOBAL_SECURITY_HEADERS_COLLECTION } from './headers/GlobalSecurityHeaders';
export type { ISecurityHeader } from './headers/GlobalSecurityHeaders';

/**
 * ============================================================================
 * @section 3. SENSORES DE PRESENCIA E ISOMORFISMO DE HARDWARE
 * ============================================================================
 */
export { DetermineTargetPresenceStatus } from './logic/DetermineTargetPresenceStatus';
export type { TPresenceStatusLiteral } from './logic/DetermineTargetPresenceStatus';

/**
 * ============================================================================
 * @section 4. BÓVEDA MULTIMEDIA E INFRAESTRUCTURA CLOUD (S3 / Supabase)
 * ============================================================================
 */

// 4.1. ADN Estructural, Categorías y Tipado Nominal
export {
  MultimediaEvidencePayloadSchema,
  EvidenceIdentifierSchema,
  EvidenceCategorySchema,
} from './storage/schemas/MultimediaEvidence.schema';

export type {
  IMultimediaEvidencePayload,
  TEvidenceIdentifier,
  TEvidenceCategory,
} from './storage/schemas/MultimediaEvidence.schema';

// 4.2. Orquestador Superior de Persistencia Multimedia
export { PersistMultimediaEvidence } from './storage/PersistMultimediaEvidence';
export type { IMultimediaVaultResult } from './storage/PersistMultimediaEvidence';

// 4.3. Átomos de Transformación, Direccionamiento e I/O
export {
  TransformToStandardBinaryBuffer,
  TransformToSovereignBinary,
} from './storage/logic/TransformToSovereignBinary';

export {
  GenerateEnterpriseStoragePath,
  GenerateSovereignStoragePath,
  EnterpriseStoragePathLiteralSchema,
} from './storage/logic/GenerateSovereignStoragePath';

export type { TEnterpriseStoragePathLiteral } from './storage/logic/GenerateSovereignStoragePath';

export { BuildStorageAccessUrl } from './storage/logic/BuildStorageAccessUrl';
export { ExecuteCloudStorageUpload } from './storage/logic/ExecuteCloudStorageUpload';
