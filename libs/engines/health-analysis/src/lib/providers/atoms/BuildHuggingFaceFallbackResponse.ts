/**
 * @section AI Providers - Hugging Face Fallback Response Builder (Atom)
 * @description Átomo de lógica pura encargado de ensamblar, sellar inmutablemente
 * y certificar contra `InferenceResponseSchema` las respuestas de contingencia cuando
 * faltan credenciales o colapsa el transporte con Hugging Face Router.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';

/**
 * @interface IBuildHuggingFaceFallbackParameters
 * @description Parámetros inmutables requeridos para construir una respuesta degradada válida.
 */
export interface IBuildHuggingFaceFallbackParameters {
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly observationLiteral: string;
  readonly suggestedActionLiteral: IInferenceResponse['suggestedAction'];
  readonly detectedAnomaliesCollection: readonly string[];
  readonly metadataSnapshot: Readonly<Record<string, unknown>>;
}

/**
 * Construye y valida contra `InferenceResponseSchema` una respuesta degradada sellada.
 *
 * @param parametersSnapshot - Correlación, observación localizada, acción sugerida y metadatos.
 * @returns {IInferenceResponse} Contrato inmutable certificado por Zod.
 */
export const BuildHuggingFaceFallbackResponse = (
  parametersSnapshot: IBuildHuggingFaceFallbackParameters,
): IInferenceResponse => {
  const validatedResponse = InferenceResponseSchema.parse({
    analysisId: parametersSnapshot.correlationIdentifier,
    confidenceScore: 0,
    observation: parametersSnapshot.observationLiteral,
    suggestedAction: parametersSnapshot.suggestedActionLiteral,
    detectedAnomalies: [...parametersSnapshot.detectedAnomaliesCollection],
    metadata: Object.freeze({ ...parametersSnapshot.metadataSnapshot }),
  });

  return Object.freeze(validatedResponse);
};
