/**
 * @section Cognitive Health Analysis - Master Entry Point (Barrel)
 * @description Único punto de exportación autorizado para el motor de inferencia
 * cognitiva y análisis de salud algorítmica. Orquesta la visibilidad de los contratos
 * Zod de entrada y salida, el orquestador cerebral de razonamiento y el validador
 * de consistencia estructural bajo arquitectura Source-First.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/** Versión técnica sincronizada tras la purga de extensiones sintéticas para Turbopack. */
export const MODULE_HEALTH_ANALYSIS_ENGINE_VERSION = '1.5.1';

/**
 * @section 1. Contratos Estructurales de Inferencia (SSOT)
 */
export { AIProviderSchema, InferenceResponseSchema } from './lib/schemas/Inference.schema';

export type { IInferenceResponse, TAIProvider } from './lib/schemas/Inference.schema';

export { InferenceRequestSchema } from './lib/schemas/InferenceRequest.schema';

export type { IInferenceRequest } from './lib/schemas/InferenceRequest.schema';

/**
 * @section 2. Orquestadores Cognitivos y Motores de Razonamiento
 */
export { BrainOrchestrator } from './lib/logic/BrainOrchestrator';
export { AnalyzeSystemHealthInference } from './lib/logic/AnalyzeSystemHealthInference';

/**
 * @section 3. Átomos de Verificación de Integridad
 */
export { ValidateCognitiveAdn } from './lib/logic/atomic/ValidateCognitiveAdn';
