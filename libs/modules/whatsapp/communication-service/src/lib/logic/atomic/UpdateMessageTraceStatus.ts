/**
 * @section WhatsApp Logic - Message Delivery Trace Status Orchestrator
 * @description Orquestador encargado de procesar actualizaciones de entrega de Meta
 * (sent, delivered, read, failed, deleted), aplicar anonimización de destinatario bajo LGPD
 * con `MaskCitizenIdentity`, medir la latencia con `TraceExecutionTime` y emitir
 * telemetría forense conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MaskCitizenIdentity } from '@floripa-dignidade/shared-utility';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { NormalizeWhatsAppDeliveryStatus } from './NormalizeWhatsAppDeliveryStatus';
import type { IWhatsAppStatusUpdate } from './schemas/WhatsAppStatusUpdate.schema';

export { type IWhatsAppStatusUpdate };

const STATUS_ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_STATUS_ORCHESTRATOR',
);

const UPDATE_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'UPDATE_MESSAGE_TRACE_OPERATION',
);

const MESSAGE_TRACE_UPDATED_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('MESSAGE_TRACE_UPDATED');

const DELIVERY_FAILURE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MESSAGE_DELIVERY_FAILURE_DETECTED',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Procesa la actualización de estado de un mensaje, anonimiza al destinatario y emite telemetría SRE.
 *
 * @param statusSnapshot - Evento de estado de entrega de Meta (validado por `WhatsAppStatusUpdateSchema`).
 * @param correlationIdentifierFallback - Identificador de correlación para trazabilidad distribuida.
 * @returns {Promise<void>} Resuelve una vez emitido el rastro forense.
 */
export const UpdateMessageTraceStatus = async (
  statusSnapshot: IWhatsAppStatusUpdate,
  correlationIdentifierFallback?: string,
): Promise<void> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    STATUS_ORCHESTRATOR_MODULE_IDENTIFIER,
    UPDATE_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const normalizedStatus = NormalizeWhatsAppDeliveryStatus(statusSnapshot);

      const maskedRecipientIdentifier = await MaskCitizenIdentity({
        rawIdentityLiteral: normalizedStatus.rawRecipientIdentifierLiteral,
        maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT',
      });

      const operationCodeLiteral: OperationCode = normalizedStatus.isDeliveryFailureBoolean
        ? DELIVERY_FAILURE_OPERATION_CODE
        : MESSAGE_TRACE_UPDATED_OPERATION_CODE;

      void EmitTelemetrySignal({
        occurrenceTimestampISO: normalizedStatus.occurrenceTimestampISO,
        severityLevelLiteral: normalizedStatus.suggestedSeverityLevelLiteral,
        moduleIdentifierLiteral: STATUS_ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral,
        correlationIdentifier,
        messageContentLiteral: normalizedStatus.isDeliveryFailureBoolean
          ? `Fallo de entrega reportado por Meta WhatsApp: [${normalizedStatus.errorDetailsLiteral ?? 'ERROR_NO_ESPECIFICADO'}].`
          : `Actualización de entrega de mensaje procesada: [${normalizedStatus.deliveryStatusLiteral}].`,
        semanticIntentTag: normalizedStatus.isDeliveryFailureBoolean
          ? 'WHATSAPP_MESSAGE_DELIVERY_FAILED'
          : 'WHATSAPP_MESSAGE_STATUS_UPDATED',
        contextMetadataSnapshot: Object.freeze({
          metaMessageIdentifier: normalizedStatus.metaMessageIdentifier,
          deliveryStatusLiteral: normalizedStatus.deliveryStatusLiteral,
          recipientIdentifierMask: maskedRecipientIdentifier,
          ...(normalizedStatus.errorCodeNumeric !== undefined && {
            errorCodeNumeric: normalizedStatus.errorCodeNumeric,
          }),
          ...(normalizedStatus.conversationCategoryLiteral !== undefined && {
            conversationCategoryLiteral: normalizedStatus.conversationCategoryLiteral,
          }),
        }),
      });
    },
  );
};
