/**
 * @section Shared Utility - Package Master Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el módulo de utilidades
 * transversales de Floripa Dignidade. Centraliza privacidad ciudadana (LGPD),
 * seguridad HTTP perimetral, sensores de hardware y almacenamiento cloud en Supabase.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión de paquete sincronizada tras la atomización integral de almacenamiento y privacidad. */
export const SHARED_UTILITY_VERSION = '1.3.0';

/**
 * ============================================================================
 * @section 1. SEGURIDAD Y PRIVACIDAD CIUDADANA (LGPD & PII Shield)
 * ============================================================================
 */
export {
  MaskCitizenIdentity,
  MaskedIdentityLiteralSchema,
  MaskSovereignIdentity,
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
 * @section 4. ALMACENAMIENTO MULTIMEDIA CLOUD (Supabase Storage / S3-Compatible)
 * ============================================================================
 */

/* 4.1. Contratos Estructurales, Cuotas y Tipado Nominal */
export {
  EvidenceCategorySchema,
  EvidenceIdentifierSchema,
  MultimediaEvidencePayloadSchema,
} from './storage/schemas/MultimediaEvidence.schema';

export type {
  IMultimediaEvidencePayload,
  TEvidenceCategory,
  TEvidenceIdentifier,
} from './storage/schemas/MultimediaEvidence.schema';

export {
  EnterpriseStoragePathLiteralSchema,
  GenerateEnterpriseStoragePathParametersSchema,
  InstitutionalContextMetadataContractSchema,
} from './storage/schemas/EnterpriseStoragePath.schema';

export type {
  IGenerateEnterpriseStoragePathParameters,
  TEnterpriseStoragePathLiteral,
} from './storage/schemas/EnterpriseStoragePath.schema';

export { MultimediaVaultResultSchema } from './storage/schemas/MultimediaVaultResult.schema';
export type { IMultimediaVaultResult } from './storage/schemas/MultimediaVaultResult.schema';

export {
  CloudStorageUploadParametersSchema,
  DEFAULT_STORAGE_CACHE_CONTROL_SECONDS_LITERAL,
  DEFAULT_STORAGE_UPLOAD_TIMEOUT_IN_MILLISECONDS_QUANTITY,
  MAXIMUM_STORAGE_UPLOAD_BYTES_QUANTITY,
} from './storage/schemas/CloudStorageUpload.schema';

export type {
  ICloudStorageUploadParameters,
  IValidatedCloudStorageUploadParameters,
} from './storage/schemas/CloudStorageUpload.schema';

/* 4.2. Orquestador de Persistencia Multimedia */
export { PersistMultimediaEvidence } from './storage/PersistMultimediaEvidence';

/* 4.3. Átomos de Transformación, Sanitización, Direccionamiento e I/O */
export {
  TransformToSovereignBinary,
  TransformToStandardBinaryBuffer,
} from './storage/logic/TransformToSovereignBinary';

export {
  GenerateEnterpriseStoragePath,
  GenerateSovereignStoragePath,
} from './storage/logic/GenerateSovereignStoragePath';

export { SanitizeOrganizationPathSegment } from './storage/logic/SanitizeOrganizationPathSegment';
export { SanitizeStorageFileName } from './storage/logic/SanitizeStorageFileName';
export { BuildStorageAccessUrl } from './storage/logic/BuildStorageAccessUrl';
export { BuildStorageUploadEndpointUrl } from './storage/logic/BuildStorageUploadEndpointUrl';
export { BuildCloudStorageUploadHeaders } from './storage/logic/BuildCloudStorageUploadHeaders';
export type { ICloudStorageUploadHeadersInput } from './storage/logic/BuildCloudStorageUploadHeaders';
export { ConvertUint8ArrayToExactArrayBuffer } from './storage/logic/ConvertUint8ArrayToExactArrayBuffer';
export { NormalizeCloudStorageUploadError } from './storage/logic/NormalizeCloudStorageUploadError';
export { ExecuteCloudStorageUpload } from './storage/logic/ExecuteCloudStorageUpload';
