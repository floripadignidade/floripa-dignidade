/**
 * @section WhatsApp Webhook Logic - Incoming Event Processor (Atom)
 * @description Átomo encargado del pipeline POST de recepción de eventos de Meta
 * WhatsApp: extracción de cabecera criptográfica, verificación HMAC-SHA256 en
 * tiempo constante, validación de cuerpo no vacío, parseo JSON y delegación en
 * `ProcessIncomingWhatsAppEvent` con telemetría SRE y correlación HTTP.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Node.js Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { type NextRequest, NextResponse } from 'next/server';

import { MapHttpErrorToException } from '@floripa-dignidade/exceptions';
import type {
  CorrelationIdentifier,
  ModuleIdentifier,
  OperationCode,
} from '@floripa-dignidade/telemetry';
import {
  ProcessIncomingWhatsAppEvent,
  ValidateMetaSignature,
} from '@floripa-dignidade/whatsapp-communication-service';

import { EmitWhatsAppGatewayTelemetry } from './EmitWhatsAppGatewayTelemetry';
import { ExtractWebhookSecurityHeaders } from './ExtractWebhookSecurityHeaders';
import { ParseWhatsAppEventPayload } from './ParseWhatsAppEventPayload';

/**
 * @interface IProcessWhatsAppWebhookPostParameters
 * @description Contrato inmutable de entrada para procesar notificaciones POST de Meta.
 */
export interface IProcessWhatsAppWebhookPostParameters {
  readonly incomingRequest: NextRequest;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Autentica la firma criptográfica HMAC, parsea el evento entrante y dispara el procesamiento.
 *
 * @param parametersSnapshot - Solicitud HTTP POST, identificador del gateway y correlación.
 * @returns {Promise<NextResponse>} Respuesta `200` al reconocer el evento o `401` si falla la firma.
 */
export const ProcessWhatsAppWebhookPostRequest = async (
  parametersSnapshot: IProcessWhatsAppWebhookPostParameters,
): Promise<NextResponse> => {
  const { incomingRequest, gatewayModuleIdentifier, correlationIdentifier } = parametersSnapshot;

  const xHubSignatureHeaderLiteral = ExtractWebhookSecurityHeaders(incomingRequest.headers);
  const rawRequestBodyLiteral = await incomingRequest.text();

  if (rawRequestBodyLiteral.trim().length === 0) {
    throw MapHttpErrorToException(400, 'WHATSAPP_WEBHOOK_EMPTY_BODY');
  }

  const isIdentityLegitimateBoolean = await ValidateMetaSignature({
    rawRequestBodyLiteral,
    xHubSignatureHeaderLiteral,
  });

  if (!isIdentityLegitimateBoolean) {
    EmitWhatsAppGatewayTelemetry({
      severityLevelLiteral: 'CRITICAL',
      gatewayModuleIdentifier,
      operationCodeLiteral: 'UNAUTHORIZED_WEBHOOK_ATTEMPT' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Fallo de firma criptográfica detectado en la frontera de WhatsApp.',
      semanticIntentTag: 'SECURITY_CRYPTOGRAPHIC_SIGNATURE_MISMATCH',
      contextMetadataSnapshot: {
        httpStatusCodeNumeric: 401,
      },
    });

    return new NextResponse('UNAUTHORIZED_SIGNAL', {
      status: 401,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Floripa-Correlation-ID': correlationIdentifier,
      },
    });
  }

  const eventPayloadSnapshot = ParseWhatsAppEventPayload(rawRequestBodyLiteral);
  await ProcessIncomingWhatsAppEvent(eventPayloadSnapshot);

  EmitWhatsAppGatewayTelemetry({
    severityLevelLiteral: 'INFO',
    gatewayModuleIdentifier,
    operationCodeLiteral: 'WEBHOOK_EVENT_ACKNOWLEDGED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: 'Evento ciudadano de WhatsApp autenticado y procesado nominalmente.',
    semanticIntentTag: 'WHATSAPP_WEBHOOK_EVENT_ACCEPTED',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: 200,
      payloadByteLengthQuantity: rawRequestBodyLiteral.length,
    },
  });

  return new NextResponse('EVENT_ACKNOWLEDGED', {
    status: 200,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Floripa-Correlation-ID': correlationIdentifier,
    },
  });
};
