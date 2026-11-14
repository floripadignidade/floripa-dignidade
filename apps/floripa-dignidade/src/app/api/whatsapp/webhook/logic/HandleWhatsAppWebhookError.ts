/**
 * @section WhatsApp Webhook Logic - Forensic Error Handler (Atom)
 * @description Átomo encargado de normalizar excepciones del gateway WhatsApp,
 * reportar evidencia mediante `ReportForensicException`, emitir alerta crítica
 * cuando corresponda (`5xx`) y retornar la respuesta HTTP con el código RFC 9110
 * exacto y la cabecera de correlación forense sin filtrar detalles internos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Node.js Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';

import { GlobalBaseException, MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import { EmitWhatsAppGatewayTelemetry } from './EmitWhatsAppGatewayTelemetry';

/**
 * @interface IHandleWhatsAppWebhookErrorParameters
 * @description Contrato inmutable de contexto para gestionar fallos del webhook de Meta.
 */
export interface IHandleWhatsAppWebhookErrorParameters {
  readonly caughtExecutionError: unknown;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

const HTTP_ERROR_RESPONSE_BODIES_MAPPING: Readonly<Record<number, string>> = Object.freeze({
  400: 'BAD_REQUEST_SIGNAL',
  401: 'UNAUTHORIZED_SIGNAL',
  403: 'FORBIDDEN_SIGNAL',
});

/**
 * Normaliza la excepción capturada, emite trazabilidad SRE y construye la respuesta HTTP segura.
 *
 * @param parametersSnapshot - Error capturado, identificador de módulo y correlación forense.
 * @returns {NextResponse} Respuesta textual con estatus HTTP real y cabecera `X-Floripa-Correlation-ID`.
 */
export const HandleWhatsAppWebhookError = (
  parametersSnapshot: IHandleWhatsAppWebhookErrorParameters,
): NextResponse => {
  const { caughtExecutionError, gatewayModuleIdentifier, correlationIdentifier } =
    parametersSnapshot;

  const normalizedException =
    caughtExecutionError instanceof GlobalBaseException
      ? caughtExecutionError
      : MapHttpErrorToException(500, 'UNEXPECTED_WEBHOOK_ORCHESTRATION_FAULT', {
          originalErrorLiteral:
            caughtExecutionError instanceof Error
              ? caughtExecutionError.message
              : String(caughtExecutionError),
        });

  ReportForensicException(normalizedException, correlationIdentifier);

  const statusCodeNumeric = normalizedException.httpStatusCodeNumeric;
  const isCriticalServerFaultBoolean = statusCodeNumeric >= 500;

  if (isCriticalServerFaultBoolean) {
    EmitWhatsAppGatewayTelemetry({
      severityLevelLiteral: 'CRITICAL',
      gatewayModuleIdentifier,
      operationCodeLiteral: 'WHATSAPP_WEBHOOK_GATEWAY_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Fallo interno durante el procesamiento de señal en el gateway de WhatsApp.',
      semanticIntentTag: 'API_GATEWAY_CRITICAL_FAULT',
      contextMetadataSnapshot: {
        httpStatusCodeNumeric: statusCodeNumeric,
        operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
      },
    });
  }

  const responseBodyLiteral = isCriticalServerFaultBoolean
    ? 'INTERNAL_SERVICE_ERROR'
    : (HTTP_ERROR_RESPONSE_BODIES_MAPPING[statusCodeNumeric] ?? 'REJECTED_SIGNAL');

  return new NextResponse(responseBodyLiteral, {
    status: statusCodeNumeric,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Floripa-Correlation-ID': correlationIdentifier,
    },
  });
};
