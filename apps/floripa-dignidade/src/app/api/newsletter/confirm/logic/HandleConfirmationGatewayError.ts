/**
 * @section Newsletter Confirm Logic - Forensic Error Handler (Atom)
 * @description Átomo encargado de normalizar excepciones en el gateway de confirmación,
 * registrar evidencia mediante `ReportForensicException`, emitir telemetría conforme a
 * `TelemetrySignalSchema` y construir la redirección segura con trazabilidad HTTP.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Edge Compatible).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';

import type { TSupportedLocale } from '@floripa-dignidade/contracts';
import {
  GlobalBaseException,
  MapHttpErrorToException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IHandleConfirmationGatewayErrorParameters
 * @description Contrato inmutable de contexto para gestionar fallos del gateway de confirmación.
 */
export interface IHandleConfirmationGatewayErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly resolvedLocaleIdentifier: TSupportedLocale;
  readonly requestUrlLiteral: string;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Procesa el fallo de confirmación, reporta la traza SRE y redirige a la vista localizada segura.
 *
 * @param parametersSnapshot - Excepción capturada, idioma activo, URL base y correlación forense.
 * @returns {NextResponse} Redirección HTTP con cabecera `X-Floripa-Correlation-ID`.
 */
export const HandleConfirmationGatewayError = (
  parametersSnapshot: IHandleConfirmationGatewayErrorParameters,
): NextResponse => {
  const {
    caughtExecutionError,
    resolvedLocaleIdentifier,
    requestUrlLiteral,
    gatewayModuleIdentifier,
    correlationIdentifier,
  } = parametersSnapshot;

  const normalizedException =
    caughtExecutionError instanceof GlobalBaseException
      ? caughtExecutionError
      : MapHttpErrorToException(500, 'UNEXPECTED_CONFIRMATION_FAULT', {
          originalErrorLiteral:
            caughtExecutionError instanceof Error
              ? caughtExecutionError.message
              : String(caughtExecutionError),
        });

  ReportForensicException(normalizedException, correlationIdentifier);

  const isTokenValidationFailureBoolean = normalizedException instanceof ValidationException;
  const isCriticalServerFaultBoolean = normalizedException.httpStatusCodeNumeric >= 500;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: isCriticalServerFaultBoolean ? 'CRITICAL' : 'WARNING',
    moduleIdentifierLiteral: gatewayModuleIdentifier,
    operationCodeLiteral: (isTokenValidationFailureBoolean
      ? 'CONFIRMATION_TOKEN_VALIDATION_REJECTED'
      : 'CONFIRMATION_GATEWAY_FAILURE') as OperationCode,
    correlationIdentifier,
    messageContentLiteral: isTokenValidationFailureBoolean
      ? `Token de confirmación rechazado en frontera para [${resolvedLocaleIdentifier}].`
      : `Fallo interno durante la confirmación de suscripción en [${resolvedLocaleIdentifier}].`,
    semanticIntentTag: isTokenValidationFailureBoolean
      ? 'SECURITY_TOKEN_VALIDATION_WARNING'
      : 'API_GATEWAY_CRITICAL_FAULT',
    contextMetadataSnapshot: Object.freeze({
      resolvedLocaleIdentifier,
      httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
      operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
    }),
  });

  const targetRelativePathLiteral = isTokenValidationFailureBoolean
    ? `/${resolvedLocaleIdentifier}/newsletter/invalid-token?trace=${correlationIdentifier}`
    : `/${resolvedLocaleIdentifier}/error?code=CONFIRMATION_FAULT&trace=${correlationIdentifier}`;

  const redirectResponse = NextResponse.redirect(
    new URL(targetRelativePathLiteral, requestUrlLiteral),
  );
  redirectResponse.headers.set('X-Floripa-Correlation-ID', correlationIdentifier);

  return redirectResponse;
};
