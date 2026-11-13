/**
 * @section Health Analysis Engine - Package Entry Point (Barrel Master)
 * @description Único punto de exportación autorizado para el cerebro de
 * Inteligencia Artificial (Neural Sentinel). Orquesta la visibilidad de los
 * contratos de inferencia y el acceso al motor de razonamiento predictivo.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ESM Strict Syntax.
 * SANEADO Zenith: Resolución de TS2305 (Sincronización de Identidad Funcional),
 * inyección de extensiones '.js' y exposición de contratos de solicitud.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.5.0
 * Estatus: Nivelación Zenith completada. Grafo de tipos sincronizado con
 * el orquestador cerebral nivelado.
 */
export const MODULE_HEALTH_ANALYSIS_ENGINE_VERSION = '1.5.0';

/**
 * @section Capa 1: ADN Estructural (Schemas & Types)
 * @description Exportación de contratos inmutables para la validación de
 * solicitudes y respuestas del motor de IA.
 */
/** 🛡️ SANEADO Zenith: Inyección de extensiones obligatorias para resolución ESM. */
export { InferenceResponseSchema, AIProviderSchema } from './lib/schemas/Inference.schema.js';

export type { IInferenceResponse, TAIProvider } from './lib/schemas/Inference.schema.js';

export { InferenceRequestSchema } from './lib/schemas/InferenceRequest.schema.js';

export type { IInferenceRequest } from './lib/schemas/InferenceRequest.schema.js';

/**
 * @section Capa 2: Motores de Lógica y Orquestación (AI Brain)
 * @description Punto de entrada al orquestador supremo de razonamiento.
 */

/**
 * 🛡️ SANEADO Zenith (Fix TS2305):
 * Exportación nominal del orquestador nivelado bajo la nueva identidad.
 */
export { BrainOrchestrator } from './lib/logic/BrainOrchestrator.js';

/**
 * @section Capa 3: Átomos de Verificación (Integrity Atoms)
 */
export { ValidateCognitiveAdn } from './lib/logic/atomic/ValidateCognitiveAdn.js';
