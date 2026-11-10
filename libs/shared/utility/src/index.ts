/**
 * @section Shared Utility - Enterprise Global Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el módulo de utilidades
 * transversales. Orquesta la visibilidad de algoritmos de privacidad (LGPD),
 * motores de persistencia isomórfica y sensores de hardware.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad).
 * SANEADO Turbopack: Erradicación definitiva de extensiones '.js' a favor de Rutas Limpias (Extensionless).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.1
 * Estatus: Nivelación Turbopack completada. Rutas limpias deterministas para Next.js 16.
 */
export const SHARED_UTILITY_VERSION = '1.2.1';

/**
 * @section 1. Seguridad y Privacidad (Privacy Guard)
 * @description Herramientas para el cumplimiento de la LGPD y blindaje de PII.
 */
export { MaskSovereignIdentity } from './logic/MaskSovereignIdentity';
export type { TIdentityMaskingStrategy } from './logic/schemas/MaskSovereignIdentity.schema';
export { MaskIdentityParametersSchema } from './logic/schemas/MaskSovereignIdentity.schema';

/**
 * @section 2. Infraestructura y Estilos (UI Glue)
 * @description Utilidades para la orquestación visual y seguridad de red.
 */
export { GlobalStyleClassMerger } from './styles/GlobalStyleClassMerger';
export { GLOBAL_SECURITY_HEADERS_COLLECTION } from './headers/GlobalSecurityHeaders';
export type { ISecurityHeader } from './headers/GlobalSecurityHeaders';

/**
 * @section 3. Inteligencia de Presencia e Isomorfismo
 * @description Sensores de hardware para la detección de actividad ciudadana.
 */
export { DetermineTargetPresenceStatus } from './logic/DetermineTargetPresenceStatus';
export type { TPresenceStatusLiteral } from './logic/DetermineTargetPresenceStatus';

/**
 * @section 4. Bóveda Multimedia (Isomorphic Storage Engine)
 * @description Infraestructura para la gestión de evidencias en la nube (S3/Enterprise).
 */

// 4.1. ADN Estructural y Contratos
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

// 4.2. Orquestadores y Lógica de Persistencia
export { PersistMultimediaEvidence } from './storage/PersistMultimediaEvidence';
export type { IMultimediaVaultResult } from './storage/PersistMultimediaEvidence';

// 4.3. Átomos de Transformación e I/O
export { TransformToSovereignBinary } from './storage/logic/TransformToSovereignBinary';
export { GenerateSovereignStoragePath } from './storage/logic/GenerateSovereignStoragePath';
export { BuildStorageAccessUrl } from './storage/logic/BuildStorageAccessUrl';
export { ExecuteCloudStorageUpload } from './storage/logic/ExecuteCloudStorageUpload';
