/**
 * @section Health Monitor - Probe Timeout Guard Executor (Atom)
 * @description Ejecuta una sonda asíncrona de infraestructura bajo medición de
 * `TraceExecutionTime` con límite estricto de tiempo (`timeoutInMillisecondsQuantity`),
 * normalizando fallos o vencimientos mediante `MapHttpErrorToException` y registrando
 * la traza forense a través de `ReportForensicException`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IHealthProbeExecutionResult
 * @description Resultado inmutable de la ejecución cronometrada de una sonda de salud.
 */
export interface IHealthProbeExecutionResult {
  readonly isServiceAvailableBoolean: boolean;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly failureDiagnosticLiteral: string | undefined;
}

const PROBE_TIMEOUT_ERROR_MARKER_LITERAL = 'HEALTH_PROBE_TIMEOUT_EXCEEDED';

const sanitizeServiceOperationSegment = (serviceNameLiteral: string): string =>
  serviceNameLiteral
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_');

const executeActionWithTimeout = async (
  executeHealthCheckAction: () => Promise<void>,
  timeoutInMillisecondsQuantity: number,
  timeoutMessageLiteral: string,
): Promise<void> => {
  let timeoutHandleReference: ReturnType<typeof setTimeout> | undefined;

  const timeoutGuardPromise = new Promise<never>((_resolve, reject) => {
    timeoutHandleReference = setTimeout(() => {
      reject(new Error(`${PROBE_TIMEOUT_ERROR_MARKER_LITERAL}:${timeoutMessageLiteral}`));
    }, timeoutInMillisecondsQuantity);
  });

  try {
    await Promise.race([executeHealthCheckAction(), timeoutGuardPromise]);
  } finally {
    if (timeoutHandleReference !== undefined) {
      clearTimeout(timeoutHandleReference);
    }
  }
};

/**
 * Ejecuta la sonda protegida por timeout y reporta excepciones de disponibilidad.
 *
 * @param targetServiceNameLiteral - Nombre técnico del servicio auditado.
 * @param executeHealthCheckAction - Acción asíncrona de verificación física/lógica.
 * @param timeoutInMillisecondsQuantity - Límite máximo de espera en milisegundos.
 * @param timeoutMessageLiteral - Mensaje diagnóstico localizado para vencimiento de tiempo.
 * @param monitorModuleIdentifier - Identificador técnico nominal del módulo monitor.
 * @param correlationIdentifier - Identificador UUID v4 de trazabilidad distribuida.
 * @returns {Promise<IHealthProbeExecutionResult>} Snapshot con disponibilidad, latencia y diagnóstico.
 */
export const ExecuteProbeWithTimeoutGuard = async (
  targetServiceNameLiteral: string,
  executeHealthCheckAction: () => Promise<void>,
  timeoutInMillisecondsQuantity: number,
  timeoutMessageLiteral: string,
  monitorModuleIdentifier: ModuleIdentifier,
  correlationIdentifier: CorrelationIdentifier,
): Promise<IHealthProbeExecutionResult> => {
  const probeOperationCode: OperationCode = OperationCodeSchema.parse(
    `HEALTH_PROBE_${sanitizeServiceOperationSegment(targetServiceNameLiteral)}`,
  );

  const executionStartTimestampNumeric = globalThis.performance.now();

  try {
    await TraceExecutionTime(
      monitorModuleIdentifier,
      probeOperationCode,
      correlationIdentifier,
      () =>
        executeActionWithTimeout(
          executeHealthCheckAction,
          timeoutInMillisecondsQuantity,
          timeoutMessageLiteral,
        ),
    );

    const executionLatencyInMillisecondsQuantity = Math.max(
      0,
      Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
    );

    return Object.freeze({
      isServiceAvailableBoolean: true,
      executionLatencyInMillisecondsQuantity,
      failureDiagnosticLiteral: undefined,
    });
  } catch (caughtProbeExecutionError: unknown) {
    const executionLatencyInMillisecondsQuantity = Math.max(
      0,
      Math.round(globalThis.performance.now() - executionStartTimestampNumeric),
    );

    const errorDescriptionLiteral =
      caughtProbeExecutionError instanceof Error
        ? caughtProbeExecutionError.message
        : String(caughtProbeExecutionError);

    const isTimeoutErrorBoolean = errorDescriptionLiteral.startsWith(
      PROBE_TIMEOUT_ERROR_MARKER_LITERAL,
    );

    const normalizedException =
      caughtProbeExecutionError instanceof GlobalBaseException
        ? caughtProbeExecutionError
        : MapHttpErrorToException(
            isTimeoutErrorBoolean ? 504 : 503,
            `INFRASTRUCTURE_SERVICE_FAULT_${sanitizeServiceOperationSegment(targetServiceNameLiteral)}`,
            {
              targetServiceNameLiteral,
              isTimeoutErrorBoolean,
              originalErrorMessageLiteral: errorDescriptionLiteral,
              correlationIdentifier,
            },
          );

    ReportForensicException(normalizedException, correlationIdentifier);

    return Object.freeze({
      isServiceAvailableBoolean: false,
      executionLatencyInMillisecondsQuantity,
      failureDiagnosticLiteral: errorDescriptionLiteral,
    });
  }
};
