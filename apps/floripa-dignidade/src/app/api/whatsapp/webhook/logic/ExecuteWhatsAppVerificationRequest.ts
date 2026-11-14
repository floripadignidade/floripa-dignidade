/**
 * @section WhatsApp Webhook Logic - Verification Request Handler (Atom)
 * @description Átomo encargado de validar la solicitud GET de suscripción enviada
 * por los servidores de Meta Developers contra el secreto `WHATSAPP_VERIFY_TOKEN`
 * obtenido de `ValidateEnvironmentContract`, retornando el desafío oficial con
 * trazabilidad SRE y cabecera de correlación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Node.js Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { NextResponse } from 'next/server';

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import type {
  CorrelationIdentifier,
  ModuleIdentifier,
  OperationCode,
} from '@floripa-dignidade/telemetry';

import { EmitWhatsAppGatewayTelemetry } from './EmitWhatsAppGatewayTelemetry';
import { ValidateWhatsAppHandshake } from './ValidateWhatsAppHandshake';

/**
 * @interface IExecuteWhatsAppVerificationParameters
 * @description Contrato inmutable de entrada para procesar la verificación GET de Meta.
 */
export interface IExecuteWhatsAppVerificationParameters {
  readonly searchParameters: URLSearchParams;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly correlationIdentifier: CorrelationIdentifier;
}

/**
 * Ejecuta la verificación del token de suscripción del webhook y responde el desafío `hub.challenge`.
 *
 * @param parametersSnapshot - Parámetros de consulta URL, módulo y correlación forense.
 * @returns {Promise<NextResponse>} Respuesta `200` con el desafío o `403` ante token inválido.
 */
export const ExecuteWhatsAppVerificationRequest = async (
  parametersSnapshot: IExecuteWhatsAppVerificationParameters,
): Promise<NextResponse> => {
  const { searchParameters, gatewayModuleIdentifier, correlationIdentifier } = parametersSnapshot;

  const { WHATSAPP_VERIFY_TOKEN: systemVerifyTokenSecret } = await ValidateEnvironmentContract();

  const { isAuthorizedBoolean, challengeLiteral } = ValidateWhatsAppHandshake(
    searchParameters,
    systemVerifyTokenSecret,
  );

  if (isAuthorizedBoolean && challengeLiteral) {
    EmitWhatsAppGatewayTelemetry({
      severityLevelLiteral: 'INFO',
      gatewayModuleIdentifier,
      operationCodeLiteral: 'WEBHOOK_VERIFICATION_SUCCESS' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Canal de Meta WhatsApp verificado y nominal.',
      semanticIntentTag: 'WEBHOOK_VERIFICATION_CONFIRMED',
      contextMetadataSnapshot: {
        httpStatusCodeNumeric: 200,
      },
    });

    return new NextResponse(challengeLiteral, {
      status: 200,
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'X-Floripa-Correlation-ID': correlationIdentifier,
      },
    });
  }

  EmitWhatsAppGatewayTelemetry({
    severityLevelLiteral: 'WARNING',
    gatewayModuleIdentifier,
    operationCodeLiteral: 'WEBHOOK_VERIFICATION_REJECTED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: 'Intento de suscripción de Webhook rechazado por token inválido.',
    semanticIntentTag: 'SECURITY_WEBHOOK_VERIFICATION_REJECTED',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: 403,
      hasChallengeParameterBoolean: Boolean(challengeLiteral),
    },
  });

  return new NextResponse('FORBIDDEN_SIGNAL', {
    status: 403,
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'X-Floripa-Correlation-ID': correlationIdentifier,
    },
  });
};
