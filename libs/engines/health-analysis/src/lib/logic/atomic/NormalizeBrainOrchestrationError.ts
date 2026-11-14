// libs/engines/health-analysis/src/lib/logic/atomic/NormalizeBrainOrchestrationError.ts

/**
 * @section Cognitive Logic - Reasoning Error Normalizer (Atom)
 * @description Átomo encargado exclusivamente de normalizar fallos ocurridos durante
 * la sesión de razonamiento cognitivo, registrar la traza mediante `ReportForensicException`
 * y emitir señales SRE críticas conformes a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Observabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GlobalBaseException,
  InternalSystemException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import type { TAIProvider } from '../../schemas/Inference.schema';

const REASONING_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'COGNITIVE_PIPELINE_FAILURE',
);

/**
 * @interface INormalizeBrainOrchestrationErrorParameters
 * @description Contrato inmutable de contexto para gestionar fallos de razonamiento.
 */
export interface INormalizeBrainOrchestrationErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly targetAiProviderLiteral: TAIProvider;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Normaliza la excepción capturada, emite telemetría forense y retorna el error tipado.
 *
 * @param parametersSnapshot - Error capturado, módulo emisor, proveedor y correlación.
 * @returns {GlobalBaseException} Excepción tipada de dominio lista para propagación.
 */
export const NormalizeBrainOrchestrationError = (
  parametersSnapshot: INormalizeBrainOrchestrationErrorParameters,
): GlobalBaseException => {
  const {
    caughtExecutionError,
    moduleIdentifierLiteral,
    targetAiProviderLiteral,
    correlationIdentifier,
  } = parametersSnapshot;

  if (caughtExecutionError instanceof ValidationException) {
    ReportForensicException(caughtExecutionError, correlationIdentifier);
    return caughtExecutionError;
  }

  if (caughtExecutionError instanceof InternalSystemException) {
    ReportForensicException(caughtExecutionError, correlationIdentifier);
    return caughtExecutionError;
  }

  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  const normalizedException =
    caughtExecutionError instanceof GlobalBaseException
      ? caughtExecutionError
      : MapHttpErrorToException(500, 'COLAPSO_EN_SISTEMA_DE_RAZONAMIENTO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          providerLiteral: targetAiProviderLiteral,
          correlationIdentifier,
        });

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral,
    operationCodeLiteral: REASONING_FAILURE_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Fallo crítico en el orquestador de razonamiento cognitivo.',
    semanticIntentTag: 'COGNITIVE_ENGINE_COLLAPSE',
    contextMetadataSnapshot: Object.freeze({
      errorTraceLiteral: errorDescriptionLiteral,
      providerLiteral: targetAiProviderLiteral,
      operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
    }),
  });

  ReportForensicException(normalizedException, correlationIdentifier);

  return normalizedException;
};
