// libs/engines/health-analysis/src/lib/logic/atomic/ValidateCognitiveAdn.ts

/**
 * @section Cognitive Logic - AI Response Validator Atom
 * @description Átomo encargado de la auditoría estructural de las respuestas
 * generadas por los proveedores externos de inteligencia artificial. Protege al
 * ecosistema contra alucinaciones o desviaciones de contrato mediante validación
 * estricta Zod, acotamiento seguro de evidencia diagnóstica, reporte forense y
 * sellado inmutable de salida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { type IInferenceResponse, InferenceResponseSchema } from '../../schemas/Inference.schema';

const VALIDATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'COGNITIVE_ADN_VALIDATOR_ATOM',
);

const HALLUCINATION_DETECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'AI_HALLUCINATION_DETECTED',
);

const MAXIMUM_DIAGNOSTIC_PREVIEW_LENGTH_QUANTITY = 512;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const serializeBoundedDiagnosticPreview = (rawAiPayloadSnapshot: unknown): string => {
  try {
    const serializedLiteral =
      typeof rawAiPayloadSnapshot === 'string'
        ? rawAiPayloadSnapshot
        : (JSON.stringify(rawAiPayloadSnapshot) ?? String(rawAiPayloadSnapshot));

    return serializedLiteral.length > MAXIMUM_DIAGNOSTIC_PREVIEW_LENGTH_QUANTITY
      ? `${serializedLiteral.slice(0, MAXIMUM_DIAGNOSTIC_PREVIEW_LENGTH_QUANTITY)}...`
      : serializedLiteral;
  } catch {
    return 'UNSERIALIZABLE_AI_PAYLOAD_SNAPSHOT';
  }
};

/**
 * Valida que el payload devuelto por el proveedor de IA cumpla con `InferenceResponseSchema`.
 *
 * @param rawAiPayloadSnapshot - Datos crudos devueltos por el proveedor externo de inferencia.
 * @param correlationIdentifierFallback - Identificador UUID v4 de trazabilidad del flujo superior.
 * @returns {IInferenceResponse} Respuesta certificada, tipada y sellada inmutablemente.
 * @throws {InternalSystemException} Si la respuesta viola el contrato estructural esperado.
 */
export const ValidateCognitiveAdn = (
  rawAiPayloadSnapshot: unknown,
  correlationIdentifierFallback?: string,
): IInferenceResponse => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const validationResult = InferenceResponseSchema.safeParse(rawAiPayloadSnapshot);

  if (!validationResult.success) {
    const validationIssuesCollection = validationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: VALIDATOR_MODULE_IDENTIFIER,
      operationCodeLiteral: HALLUCINATION_DETECTED_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: 'HEALTH_ANALYSIS.ERRORS.AI_CONTRACT_VIOLATION',
      semanticIntentTag: 'AI_RESPONSE_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({
        validationIssuesCollection,
        rawPayloadTypeLiteral: typeof rawAiPayloadSnapshot,
        rawPayloadPreviewLiteral: serializeBoundedDiagnosticPreview(rawAiPayloadSnapshot),
      }),
    });

    const systemException = new InternalSystemException('ALUCINACION_O_ADN_COGNITIVO_CORRUPTO', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(systemException, correlationIdentifier);
    throw systemException;
  }

  return Object.freeze(validationResult.data);
};
