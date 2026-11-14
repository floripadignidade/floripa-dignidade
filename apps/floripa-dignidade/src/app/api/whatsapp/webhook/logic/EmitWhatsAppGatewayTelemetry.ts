/**
 * @section WhatsApp Webhook Logic - Gateway Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales telemétricas
 * conformes a `TelemetrySignalSchema` para los eventos perimetrales del
 * gateway de WhatsApp Business (verificación de Meta, rechazos HMAC y recepción).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Node.js Runtime).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

/**
 * @interface IEmitWhatsAppGatewayTelemetryParameters
 * @description Contrato inmutable de entrada para despachar señales SRE del gateway WhatsApp.
 */
export interface IEmitWhatsAppGatewayTelemetryParameters {
  readonly severityLevelLiteral: SeverityLevel;
  readonly gatewayModuleIdentifier: ModuleIdentifier;
  readonly operationCodeLiteral: OperationCode;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
  readonly contextMetadataSnapshot?: Readonly<Record<string, unknown>>;
}

/**
 * Emite de forma no bloqueante una señal telemétrica validada por contrato Zod.
 *
 * @param parametersSnapshot - Severidad, código operativo, correlación y metadatos seguros.
 */
export const EmitWhatsAppGatewayTelemetry = (
  parametersSnapshot: IEmitWhatsAppGatewayTelemetryParameters,
): void => {
  const {
    severityLevelLiteral,
    gatewayModuleIdentifier,
    operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral,
    semanticIntentTag,
    contextMetadataSnapshot,
  } = parametersSnapshot;

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral,
    moduleIdentifierLiteral: gatewayModuleIdentifier,
    operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral,
    semanticIntentTag,
    ...(contextMetadataSnapshot !== undefined && {
      contextMetadataSnapshot: Object.freeze({ ...contextMetadataSnapshot }),
    }),
  });
};
