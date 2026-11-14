/**
 * @section Search Engine Logic - Search Error Normalizer (Atom)
 * @description Átomo encargado exclusivamente de normalizar excepciones ocurridas durante
 * la orquestación de búsqueda difusa, emitiendo alertas SRE de severidad CRITICAL conformes
 * a `TelemetrySignalSchema` y reportando la evidencia a través de `ReportForensicException`.
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

const ORCHESTRATION_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SEARCH_ORCHESTRATION_COLLAPSE',
);

/**
 * Normaliza cualquier error capturado en el orquestador de búsqueda hacia una excepción tipada de dominio.
 *
 * @param caughtExecutionError - Excepción cruda capturada en el bloque try/catch.
 * @param orchestratorModuleIdentifier - Identificador técnico del orquestador emisor.
 * @param correlationIdentifier - Identificador UUID v4 de trazabilidad distribuida.
 * @param searchQueryLiteral - Cadena de búsqueda consultada para contexto forense.
 * @returns {GlobalBaseException} Excepción normalizada lista para ser propagada.
 */
export const NormalizeSearchOrchestrationError = (
  caughtExecutionError: unknown,
  orchestratorModuleIdentifier: ModuleIdentifier,
  correlationIdentifier: CorrelationIdentifier,
  searchQueryLiteral: string,
): GlobalBaseException => {
  if (caughtExecutionError instanceof ValidationException) {
    return caughtExecutionError;
  }

  const normalizedException =
    caughtExecutionError instanceof GlobalBaseException
      ? caughtExecutionError
      : new InternalSystemException('FALLO_CRITICO_EN_MOTOR_DE_BUSQUEDA_SRE', {
          originalErrorLiteral:
            caughtExecutionError instanceof Error
              ? caughtExecutionError.message
              : String(caughtExecutionError),
          correlationIdentifier,
        });

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: orchestratorModuleIdentifier,
    operationCodeLiteral: ORCHESTRATION_COLLAPSE_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral:
      'Fallo crítico durante la ejecución del orquestador de búsqueda institucional.',
    semanticIntentTag: 'SEARCH_ENGINE_FAULT',
    contextMetadataSnapshot: Object.freeze({
      errorTraceLiteral: normalizedException.message,
      searchQuerySnapshot: searchQueryLiteral,
      operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
    }),
  });

  ReportForensicException(normalizedException, correlationIdentifier);
  return normalizedException;
};
