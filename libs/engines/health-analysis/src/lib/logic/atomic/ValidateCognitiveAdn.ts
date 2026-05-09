/**
 * @section Cognitive Logic - AI Response Validator Atom
 * @description Átomo encargado de la auditoría estructural de las respuestas
 * generadas por los proveedores de IA. Protege al sistema contra alucinaciones
 * o corrupciones de contrato en el Edge.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Zod Customs.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { InferenceResponseSchema } from '../../schemas/Inference.schema';
import type { IInferenceResponse } from '../../schemas/Inference.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'COGNITIVE_ADN_VALIDATOR_ATOM';

/**
 * Valida que el payload devuelto por la IA cumpla con el contrato de inferencia.
 *
 * @param rawAiPayloadSnapshot - Datos crudos del proveedor (OpenAI/HF/etc).
 * @param correlationIdentifier - ID de trazabilidad del hilo superior.
 * @returns {IInferenceResponse} Respuesta purificada y tipada.
 * @throws {InternalSystemException} Si se detecta una alucinación estructural.
 */
export const ValidateCognitiveAdn = (
  rawAiPayloadSnapshot: unknown,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): IInferenceResponse => {
  const validationResult = InferenceResponseSchema.safeParse(rawAiPayloadSnapshot);

  if (!validationResult.success) {
    void EmitTelemetrySignal({
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ATOM_IDENTIFIER,
      operationCodeLiteral: 'AI_HALLUCINATION_DETECTED',
      correlationIdentifier,
      messageContentLiteral: 'HEALTH_ANALYSIS.ERRORS.AI_CONTRACT_VIOLATION',
      contextMetadataSnapshot: {
        structuralIssuesCollection: validationResult.error.flatten(),
        rawPayloadSnapshot: rawAiPayloadSnapshot
      }
    });

    throw new InternalSystemException('ALUCINACION_O_ADN_COGNITIVO_CORRUPTO', {
      validationIssues: validationResult.error.flatten()
    });
  }

  return validationResult.data;
};
