/**
 * @section Cognitive Logic - Intelligence Provider Factory
 * @description Átomo encargado de la resolución de drivers de inferencia.
 * Desacopla el orquestador de los detalles de implementación de cada proveedor.
 *
 * Protocolo OEDP-V16.0 - Functional Atomicity & Factory Pattern.
 */

import type { TAIProvider } from '../schemas/Inference.schema';
import { executeHuggingFaceInference } from '../providers/HuggingFaceInferenceDriver';

/**
 * Firma técnica para los drivers de inferencia.
 */
type TInferenceDriverAction = (payload: unknown) => Promise<unknown>;

/**
 * Determina y retorna el driver de inteligencia correspondiente al proveedor.
 *
 * @param providerIdentifierLiteral - Identificador del proveedor solicitado.
 * @returns {TInferenceDriverAction} Función de ejecución del driver.
 */
export const DetermineIntelligenceDriver = (
  providerIdentifierLiteral: TAIProvider,
): TInferenceDriverAction => {
  /**
   * @section Registro de Drivers
   * Mapeo inmutable de proveedores autorizados.
   */
  const intelligenceDriversRegistry: Record<TAIProvider, TInferenceDriverAction> = {
    HUGGING_FACE: executeHuggingFaceInference,
    OPENAI: executeHuggingFaceInference, // Fallback temporal: Evolucionar a OpenAIAdapter
    ANTHROPIC: executeHuggingFaceInference, // Fallback temporal: Evolucionar a AnthropicAdapter
    LOCAL_SLM: executeHuggingFaceInference, // Fallback temporal: Evolucionar a LocalLlamaAdapter
  };

  return intelligenceDriversRegistry[providerIdentifierLiteral];
};
