/**
 * @section WhatsApp Logic - Incoming Event Orchestrator
 * @description Orquestador superior de frontera. Valida la integridad del paquete
 * de datos de Meta y dirige el triaje mediante un enjambre de átomos funcionales.
 *
 * Protocolo OEDP-V16.0 - Swarm Intelligence & High Performance.
 * SANEADO Zenith: Erradicación total de 'any' y alineación de contratos de tipos.
 *
 * @author Engineering Department - Floripa Dignidade
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Zod Schemas & Types) */
import { WhatsAppWebhookPayloadSchema } from '../../schemas/WhatsAppWebhook.schema';
import type { IWhatsAppWebhookPayload } from '../../schemas/WhatsAppWebhook.schema';

/* 2. Enjambre de Átomos Funcionales */
import { HandleIndividualWhatsAppMessage } from '../atomic/HandleIndividualWhatsAppMessage';
import { UpdateMessageTraceStatus } from '../atomic/UpdateMessageTraceStatus';

/**
 * @interface IWhatsAppStatusSignal
 * @description Reflejo técnico del contrato de estados de entrega de Meta.
 */
interface IWhatsAppStatusSignal {
  readonly id: string;
  readonly status: 'sent' | 'delivered' | 'read' | 'failed' | 'deleted';
  readonly recipient_id: string;
  readonly timestamp: string;
}

/** Identificador técnico para el Neural Sentinel. */
const WHATSAPP_ORCHESTRATOR_IDENTIFIER = 'WHATSAPP_EVENT_ORCHESTRATOR';

/**
 * Recibe señales físicas de Meta, valida su ADN y orquesta el triaje del enjambre.
 *
 * @param rawWebhookEventPayload - Objeto JSON recibido en el Gateway de la App.
 * @throws {ValidationException} Si el contrato de datos es ilegítimo.
 * @returns {Promise<void>}
 */
export const ProcessIncomingWhatsAppEvent = async (
  rawWebhookEventPayload: unknown,
): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    WHATSAPP_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_WEBHOOK_SWARM_ORCHESTRATION',
    correlationIdentifier,
    async () => {
      // 1. ADUANA DE ADN (Safe Parsing)
      const payloadValidationResult =
        WhatsAppWebhookPayloadSchema.safeParse(rawWebhookEventPayload);

      if (!payloadValidationResult.success) {
        /** Reporte inmediato de violación de integridad estructural */
        EmitTelemetrySignal({
          severityLevel: 'CRITICAL',
          moduleIdentifier: WHATSAPP_ORCHESTRATOR_IDENTIFIER,
          operationCode: 'INVALID_WEBHOOK_PAYLOAD_STRUCTURE',
          correlationIdentifier,
          message: 'El paquete de Meta no cumple con el esquema soberano.',
          contextMetadata: {
            issuesCollection: payloadValidationResult.error.flatten(),
          },
        });

        throw new ValidationException('ADN_WEBHOOK_WHATSAPP_CORRUPTO', {
          structuralIssuesCollection: payloadValidationResult.error.flatten(),
          correlationIdentifier,
        });
      }

      const validatedPayload: IWhatsAppWebhookPayload = payloadValidationResult.data;

      // 2. DESCOMPOSICIÓN Y TRIAJE (Swarm Iteration)
      for (const entrySnapshot of validatedPayload.entry) {
        for (const changeSnapshot of entrySnapshot.changes) {
          const incomingChangeValue = changeSnapshot.value;

          // A. PROCESAMIENTO DE MENSAJES (Señales Ciudadanas)
          const messagesCollection = incomingChangeValue.messages ?? [];

          for (const messageItem of messagesCollection) {
            /** Delegación al átomo de procesamiento individual */
            await HandleIndividualWhatsAppMessage(messageItem, correlationIdentifier);
          }

          // B. PROCESAMIENTO DE ESTADOS (Rastro de Entrega)
          /**
           * SANEADO Zenith: Erradicación de 'any'.
           * Se utiliza un casteo hacia la interfaz técnica 'IWhatsAppStatusSignal'
           * para garantizar la integridad del flujo hacia el átomo de rastro.
           */
          const statusesCollection =
            (incomingChangeValue.statuses as unknown as IWhatsAppStatusSignal[]) ?? [];

          for (const statusItem of statusesCollection) {
            await UpdateMessageTraceStatus(statusItem, correlationIdentifier);
          }
        }
      }

      // 3. SEÑAL DE FINALIZACIÓN NOMINAL
      EmitTelemetrySignal({
        severityLevel: 'INFO',
        moduleIdentifier: WHATSAPP_ORCHESTRATOR_IDENTIFIER,
        operationCode: 'WEBHOOK_ORCHESTRATION_COMPLETED',
        correlationIdentifier,
        message: 'Triaje de señales de WhatsApp finalizado con éxito.',
      });
    },
  );
};
