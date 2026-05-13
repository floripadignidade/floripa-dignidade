/**
 * @section Shared Utility - Enterprise Global Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el búnker de utilidades
 * transversales. Orquesta la visibilidad de algoritmos de privacidad (LGPD),
 * motores de persistencia isomórfica y sensores de hardware.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Functional Atomicity.
 * 🛡️ LEY ZENITH: Este búnker es el cimiento lógico del nivel 'Shared'. No debe
 * poseer dependencias de búnkeres superiores como 'state-store' o 'ui-foundry'.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.0
 * Estatus: Nivelación Zenith completada. Jurisdicción aplanada,
 * resolución ESM inyectada y dependencias circulares erradicadas.
 */
export const SHARED_UTILITY_VERSION = '1.2.0';

/**
 * @section 1. Seguridad y Privacidad (Privacy Guard)
 * @description Herramientas para el cumplimiento de la LGPD y blindaje de PII.
 */
export { MaskSovereignIdentity } from './logic/MaskSovereignIdentity.js';
/** 🛡️ SANEADO Zenith (Fix TS2459): El tipo ahora se exporta desde su aduana de ADN oficial. */
export type { TIdentityMaskingStrategy } from './logic/schemas/MaskSovereignIdentity.schema.js';
export { MaskIdentityParametersSchema } from './logic/schemas/MaskSovereignIdentity.schema.js';

/**
 * @section 2. Infraestructura y Estilos (UI Glue)
 * @description Utilidades para la orquestación visual y seguridad de red.
 */
export { GlobalStyleClassMerger } from './styles/GlobalStyleClassMerger.js';
export { GLOBAL_SECURITY_HEADERS_COLLECTION } from './headers/GlobalSecurityHeaders.js';
export type { ISecurityHeader } from './headers/GlobalSecurityHeaders.js';

/**
 * @section 3. Inteligencia de Presencia e Isomorfismo
 * @description Sensores de hardware para la detección de actividad ciudadana.
 */
export { DetermineTargetPresenceStatus } from './logic/DetermineTargetPresenceStatus.js';
export type { TPresenceStatusLiteral } from './logic/DetermineTargetPresenceStatus.js';

/**
 * @section 4. Bóveda Multimedia (Isomorphic Storage Engine)
 * @description Infraestructura para la gestión de evidencias en la nube (S3/Sovereign).
 */

// 4.1. ADN Estructural y Contratos
export {
  MultimediaEvidencePayloadSchema,
  EvidenceIdentifierSchema,
  EvidenceCategorySchema
} from './storage/schemas/MultimediaEvidence.schema.js';

export type {
  IMultimediaEvidencePayload,
  TEvidenceIdentifier,
  TEvidenceCategory
} from './storage/schemas/MultimediaEvidence.schema.js';

// 4.2. Orquestadores y Lógica de Persistencia
export { PersistMultimediaEvidence } from './storage/PersistMultimediaEvidence.js';
export type { IMultimediaVaultResult } from './storage/PersistMultimediaEvidence.js';

// 4.3. Átomos de Transformación e I/O
export { TransformToSovereignBinary } from './storage/logic/TransformToSovereignBinary.js';
export { GenerateSovereignStoragePath } from './storage/logic/GenerateSovereignStoragePath.js';
export { BuildStorageAccessUrl } from './storage/logic/BuildStorageAccessUrl.js';
export { ExecuteCloudStorageUpload } from './storage/logic/ExecuteCloudStorageUpload.js';
