// libs/modules/newsletter/src/lib/logic/atomic/NormalizeCloudActivationError.ts

/**
 * @section Newsletter Logic - Cloud Activation Error Normalizer (Atom)
 * @description Átomo encargado exclusivamente de normalizar fallos ocurridos durante
 * la activación de suscripciones en la nube, clasificar timeouts HTTP 504, registrar
 * trazabilidad mediante `ReportForensicException` y emitir telemetría SRE conforme a
 * `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Observabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

const ACTIVATION_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ACTIVATION_PIPELINE_COLLAPSE',
);

/**
 * @interface INormalizeCloudActivationErrorParameters
 * @description Contrato inmutable de contexto para gestionar fallos de activación en la nube.
 */
export interface INormalizeCloudActivationErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

const isAbortOrTimeoutErrorBoolean = (caughtExecutionError: unknown): boolean => {
  return (
    caughtExecutionError instanceof Error &&
    (caughtExecutionError.name === 'TimeoutError' || caughtExecutionError.name === 'AbortError')
  );
};

const extractErrorMessageLiteral = (caughtExecutionError: unknown): string => {
  return caughtExecutionError instanceof Error
    ? caughtExecutionError.message
    : String(caughtExecutionError);
};

const resolveDomainException = (
  caughtExecutionError: unknown,
  correlationIdentifier: CorrelationIdentifier,
): GlobalBaseException => {
  if (caughtExecutionError instanceof GlobalBaseException) {
    return caughtExecutionError;
  }

  const isTimeoutBoolean = isAbortOrTimeoutErrorBoolean(caughtExecutionError);
  const httpStatusCodeNumeric = isTimeoutBoolean ? 504 : 500;
  const errorCodeLiteral = isTimeoutBoolean
    ? 'ACTIVATION_CLOUD_TIMEOUT'
    : 'UNEXPECTED_ACTIVATION_FAILURE';

  return MapHttpErrorToException(httpStatusCodeNumeric, errorCodeLiteral, {
    originalErrorLiteral: extractErrorMessageLiteral(caughtExecutionError),
    correlationIdentifier,
  });
};

/**
 * Normaliza la excepción capturada, reporta evidencia forense y retorna el error de dominio.
 *
 * @param parametersSnapshot - Error capturado, módulo emisor y correlación distribuida.
 * @returns {GlobalBaseException} Excepción normalizada lista para propagarse al gateway.
 */
export const NormalizeCloudActivationError = (
  parametersSnapshot: INormalizeCloudActivationErrorParameters,
): GlobalBaseException => {
  const { caughtExecutionError, moduleIdentifierLiteral, correlationIdentifier } =
    parametersSnapshot;

  const normalizedException = resolveDomainException(caughtExecutionError, correlationIdentifier);
  const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
    moduleIdentifierLiteral,
    operationCodeLiteral: ACTIVATION_FAULT_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Fallo durante la activación en la nube de la suscripción.',
    semanticIntentTag: isClientFaultBoolean
      ? 'NEWSLETTER_ACTIVATION_VALIDATION_WARNING'
      : 'INFRASTRUCTURE_IO_FAULT',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
      operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
    }),
  });

  ReportForensicException(normalizedException, correlationIdentifier);

  return normalizedException;
};
