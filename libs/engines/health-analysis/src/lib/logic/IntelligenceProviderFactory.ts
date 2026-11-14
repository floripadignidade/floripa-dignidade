// libs/engines/health-analysis/src/lib/logic/IntelligenceProviderFactory.ts

/**
 * @section Cognitive Logic - Intelligence Provider Factory (Atom)
 * @description Átomo encargado de la resolución y vinculación de drivers de inferencia
 * cognitiva. Desacopla a los orquestadores de la lógica física de cada proveedor de IA
 * (Google Gemini, Hugging Face Router, adaptadores locales y futuros fallbacks), aplicando
 * validación perimetral y despacho determinista.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Modularidad y Portabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import { type ModuleIdentifier, ModuleIdentifierSchema } from '@floripa-dignidade/telemetry';

import { ExecuteGoogleGeminiInference } from '../providers/GoogleGeminiInferenceDriver';
import { ExecuteHuggingFaceInference } from '../providers/HuggingFaceInferenceDriver';
import { AIProviderSchema, type TAIProvider } from '../schemas/Inference.schema';

const FACTORY_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'INTELLIGENCE_PROVIDER_FACTORY',
);

/**
 * Firma técnica estandarizada para todos los drivers de inferencia cognitiva.
 */
export type TInferenceDriverAction = (payloadSnapshot: unknown) => Promise<unknown>;

/**
 * @name INTELLIGENCE_DRIVERS_REGISTRY
 * @description Mapeo inmutable y tipado que asocia cada identificador de proveedor con su driver ejecutor.
 */
const INTELLIGENCE_DRIVERS_REGISTRY: Readonly<Record<TAIProvider, TInferenceDriverAction>> =
  Object.freeze({
    GOOGLE_GEMINI: ExecuteGoogleGeminiInference,
    HUGGING_FACE: ExecuteHuggingFaceInference,
    OPENAI: ExecuteGoogleGeminiInference, // Fallback elástico a Gemini (Tier Gratuito rápido)
    ANTHROPIC: ExecuteGoogleGeminiInference, // Fallback elástico a Gemini
    LOCAL_SLM: ExecuteHuggingFaceInference, // Fallback al enrutador SLM
  });

/**
 * Determina y retorna el driver de inteligencia correspondiente al proveedor solicitado.
 * Implementa resolución Fail-Closed con validación de contrato Zod.
 *
 * @param providerIdentifierCandidate - Identificador del proveedor cognitivo solicitado.
 * @returns {TInferenceDriverAction} Función pura de ejecución del driver de inferencia.
 * @throws {ValidationException} Si el proveedor solicitado no pertenece al catálogo autorizado.
 * @throws {InternalSystemException} Si no existe un driver asignado para el proveedor.
 */
export const DetermineIntelligenceDriver = (
  providerIdentifierCandidate: unknown,
): TInferenceDriverAction => {
  const providerValidationResult = AIProviderSchema.safeParse(providerIdentifierCandidate);

  if (!providerValidationResult.success) {
    throw new ValidationException('PROVEEDOR_COGNITIVO_NO_RECONOCIDO', {
      attemptedProvider: String(providerIdentifierCandidate),
      validationIssuesCollection: providerValidationResult.error.flatten(),
      factoryModuleIdentifier: FACTORY_MODULE_IDENTIFIER,
    });
  }

  const validatedProviderLiteral = providerValidationResult.data;
  const resolvedDriverAction = INTELLIGENCE_DRIVERS_REGISTRY[validatedProviderLiteral];

  if (!resolvedDriverAction) {
    throw new InternalSystemException('DRIVER_COGNITIVO_NO_CONFIGURADO', {
      providerLiteral: validatedProviderLiteral,
      factoryModuleIdentifier: FACTORY_MODULE_IDENTIFIER,
    });
  }

  return resolvedDriverAction;
};

/**
 * @name determineIntelligenceDriver
 * @description Alias institucional en camelCase para compatibilidad con código existente.
 */
export const determineIntelligenceDriver = DetermineIntelligenceDriver;
