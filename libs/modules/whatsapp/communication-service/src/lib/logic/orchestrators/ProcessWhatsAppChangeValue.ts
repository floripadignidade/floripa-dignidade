/**
 * @section WhatsApp Logic - Change Value Concurrent Dispatcher (Atom)
 * @description Átomo encargado de extraer y despachar concurrentemente los mensajes
 * entrantes (`messages[]`) y actualizaciones de entrega (`statuses[]`) contenidos en
 * un cambio individual (`changes[].value`) de Meta WhatsApp Cloud API.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import { HandleIndividualWhatsAppMessage } from '../atomic/HandleIndividualWhatsAppMessage';
import {
  type IWhatsAppStatusUpdate,
  WhatsAppStatusUpdateSchema,
} from '../atomic/schemas/WhatsAppStatusUpdate.schema';
import { UpdateMessageTraceStatus } from '../atomic/UpdateMessageTraceStatus';
import type { IWhatsAppMessage } from '../../schemas/WhatsAppWebhook.schema';

const ATOM_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_CHANGE_VALUE_PROCESSOR',
);

const ITEM_DISPATCH_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'WHATSAPP_ITEM_DISPATCH_FAULT',
);

/**
 * @interface IChangeValueProcessingMetrics
 * @description Métricas consolidadas del despacho concurrente de mensajes y estados.
 */
export interface IChangeValueProcessingMetrics {
  readonly processedMessagesQuantity: number;
  readonly processedStatusesQuantity: number;
  readonly failedItemsQuantity: number;
}

/**
 * Procesa concurrentemente los mensajes y estados de un bloque `changes[].value`.
 *
 * @param incomingChangeValue - Valor del cambio extraído del webhook de Meta.
 * @param correlationIdentifier - Identificador único de trazabilidad distribuida.
 * @returns {Promise<IChangeValueProcessingMetrics>} Métricas inmutables del procesamiento.
 */
export const ProcessWhatsAppChangeValue = async (
  incomingChangeValue: {
    readonly messages?: readonly IWhatsAppMessage[];
    readonly statuses?: readonly unknown[];
  },
  correlationIdentifier: CorrelationIdentifier,
): Promise<IChangeValueProcessingMetrics> => {
  const messagesCollection = incomingChangeValue.messages ?? [];
  const rawStatusesCollection = incomingChangeValue.statuses ?? [];

  const messageTasksCollection = messagesCollection.map((messageItem) =>
    HandleIndividualWhatsAppMessage(messageItem, correlationIdentifier),
  );

  const statusTasksCollection = rawStatusesCollection.map(async (rawStatusItem) => {
    const statusValidationResult = WhatsAppStatusUpdateSchema.safeParse(rawStatusItem);
    if (!statusValidationResult.success) {
      return;
    }
    const validatedStatus: IWhatsAppStatusUpdate = statusValidationResult.data;
    await UpdateMessageTraceStatus(validatedStatus, correlationIdentifier);
  });

  const settledResultsCollection = await Promise.allSettled([
    ...messageTasksCollection,
    ...statusTasksCollection,
  ]);

  let failedItemsQuantity = 0;
  for (const settledResult of settledResultsCollection) {
    if (settledResult.status === 'rejected') {
      failedItemsQuantity += 1;
      const errorDescriptionLiteral =
        settledResult.reason instanceof Error
          ? settledResult.reason.message
          : String(settledResult.reason);

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: ATOM_MODULE_IDENTIFIER,
        operationCodeLiteral: ITEM_DISPATCH_FAULT_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: `Fallo aislado al procesar elemento individual de WhatsApp: ${errorDescriptionLiteral}`,
        semanticIntentTag: 'WHATSAPP_ITEM_DISPATCH_FAILURE',
        contextMetadataSnapshot: Object.freeze({
          errorDescriptionLiteral,
        }),
      });
    }
  }

  return Object.freeze({
    processedMessagesQuantity: messagesCollection.length,
    processedStatusesQuantity: rawStatusesCollection.length,
    failedItemsQuantity,
  });
};
