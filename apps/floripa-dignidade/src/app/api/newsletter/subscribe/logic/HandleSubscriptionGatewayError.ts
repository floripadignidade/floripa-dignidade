/**
 * @section Newsletter Gateway Logic - Forensic Error Handler (Atom)
 * @description Átomo encargado de normalizar excepciones capturadas en el gateway de
 * suscripción, emitir trazabilidad forense vía `ReportForensicException`, despachar
 * señales críticas conformes a `TelemetrySignalSchema` y construir respuestas HTTP
 * seguras que evitan exponer detalles internos en errores de servidor (`5xx`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Edge Compatible).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IHandleSubscriptionGatewayErrorParameters
 * @description Contrato inmutable de contexto para gestionar fallos del gateway de suscripción.
 */
export interface IHandleSubscriptionGatewayErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Normaliza un fallo del gateway de suscripción, registra evidencia forense y construye la respuesta HTTP.
 *
 * @param parametersSnapshot - Excepción capturada, identificador del módulo y correlación forense.
 * @returns {NextResponse} Respuesta JSON con estado HTTP normalizado y cabecera de correlación.
 */
export const HandleSubscriptionGatewayError = (
  parametersSnapshot: IHandleSubscriptionGatewayErrorParameters,
): NextResponse => {
  const { caughtExecutionError, gatewayModuleIdentifier, correlationIdentifier } =
    parametersSnapshot;

  const normalizedException =
    caughtExecutionError instanceof GlobalBaseException
      ? caughtExecutionError
      : MapHttpErrorToException(500, 'UNEXPECTED_GATEWAY_FAILURE', {
          originalErrorLiteral:
            caughtExecutionError instanceof Error
              ? caughtExecutionError.message
              : String(caughtExecutionError),
        });

  ReportForensicException(normalizedException, correlationIdentifier);

  const isInternalServerFailureBoolean = normalizedException.httpStatusCodeNumeric >= 500;

  if (isInternalServerFailureBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: gatewayModuleIdentifier,
      operationCodeLiteral: 'GATEWAY_PROCESS_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'TELEMETRY.SIGNALS.PROCESS_FAULT_DETECTED',
      semanticIntentTag: 'API_GATEWAY_CRITICAL_FAULT',
      contextMetadataSnapshot: Object.freeze({
        ...normalizedException.runtimeContextSnapshot,
        httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
      }),
    });
  }

  return NextResponse.json(
    {
      isOperationSuccessfulBoolean: false,
      errorIdentifierLiteral: normalizedException.operationalErrorCodeLiteral,
      trackingIdentifier: correlationIdentifier,
      ...(!isInternalServerFailureBoolean && {
        forensicSnapshot: normalizedException.runtimeContextSnapshot,
      }),
    },
    {
      status: normalizedException.httpStatusCodeNumeric,
      headers: { 'X-Floripa-Correlation-ID': correlationIdentifier },
    },
  );
};
