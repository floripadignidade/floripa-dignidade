/**
 * @section WhatsApp Logic - Incoming Event Orchestrator
 * @description Orquestador perimetral de entrada para webhooks de Meta WhatsApp Cloud API.
 * Valida la integridad estructural del sobre completo (`whatsapp_business_account`),
 * mide la latencia física de ejecución con `TraceExecutionTime`, delega el triaje
 * concurrente de mensajes y estados en `ProcessWhatsAppChangeValue` y emite
 * telemetría forense consolidada conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
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

import {
  type IWhatsAppWebhookPayload,
  WhatsAppWebhookPayloadSchema,
} from '../../schemas/WhatsAppWebhook.schema';
import { ProcessWhatsAppChangeValue } from './ProcessWhatsAppChangeValue';

const WHATSAPP_ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_EVENT_ORCHESTRATOR',
);

const ORCHESTRATION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_WEBHOOK_SWARM_ORCHESTRATION',
);

const CONTRACT_VIOLATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'INVALID_WEBHOOK_PAYLOAD_STRUCTURE',
);

const ORCHESTRATION_COMPLETED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'WEBHOOK_ORCHESTRATION_COMPLETED',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Valida la estructura del webhook de Meta y orquesta el procesamiento concurrente de eventos.
 *
 * @param rawWebhookEventPayload - Objeto JSON entrante capturado por el Route Handler.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para propagar la traza HTTP.
 * @returns {Promise<void>} Resuelve una vez concluido el triaje de todos los eventos del lote.
 * @throws {ValidationException} Si la estructura del paquete no cumple con `WhatsAppWebhookPayloadSchema`.
 */
export const ProcessIncomingWhatsAppEvent = async (
  rawWebhookEventPayload: unknown,
  correlationIdentifierFallback?: string,
): Promise<void> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    WHATSAPP_ORCHESTRATOR_MODULE_IDENTIFIER,
    ORCHESTRATION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const payloadValidationResult =
        WhatsAppWebhookPayloadSchema.safeParse(rawWebhookEventPayload);

      if (!payloadValidationResult.success) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: WHATSAPP_ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: CONTRACT_VIOLATION_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'La estructura del paquete de webhook de Meta no cumple el contrato de datos.',
          semanticIntentTag: 'WHATSAPP_WEBHOOK_CONTRACT_VIOLATION',
          contextMetadataSnapshot: Object.freeze({
            validationIssuesCollection: payloadValidationResult.error.flatten(),
          }),
        });

        throw new ValidationException('ADN_WEBHOOK_WHATSAPP_CORRUPTO', {
          structuralIssuesCollection: payloadValidationResult.error.flatten(),
          correlationIdentifier,
        });
      }

      const validatedPayload: IWhatsAppWebhookPayload = payloadValidationResult.data;

      let totalMessagesCountQuantity = 0;
      let totalStatusesCountQuantity = 0;
      let totalFailedItemsCountQuantity = 0;

      for (const entrySnapshot of validatedPayload.entry) {
        for (const changeSnapshot of entrySnapshot.changes) {
          const metricsSnapshot = await ProcessWhatsAppChangeValue(
            changeSnapshot.value,
            correlationIdentifier,
          );

          totalMessagesCountQuantity += metricsSnapshot.processedMessagesQuantity;
          totalStatusesCountQuantity += metricsSnapshot.processedStatusesQuantity;
          totalFailedItemsCountQuantity += metricsSnapshot.failedItemsQuantity;
        }
      }

      const isPartiallyFailedBoolean = totalFailedItemsCountQuantity > 0;

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isPartiallyFailedBoolean ? 'WARNING' : 'INFO',
        moduleIdentifierLiteral: WHATSAPP_ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral: ORCHESTRATION_COMPLETED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Triaje de eventos de WhatsApp finalizado: [${totalMessagesCountQuantity}] mensajes, [${totalStatusesCountQuantity}] estados.`,
        semanticIntentTag: 'WHATSAPP_WEBHOOK_BATCH_PROCESSED',
        contextMetadataSnapshot: Object.freeze({
          totalMessagesCountQuantity,
          totalStatusesCountQuantity,
          totalFailedItemsCountQuantity,
        }),
      });
    },
  );
};
