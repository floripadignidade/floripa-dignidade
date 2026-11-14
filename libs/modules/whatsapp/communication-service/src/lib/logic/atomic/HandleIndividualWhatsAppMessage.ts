/**
 * @section WhatsApp Logic - Individual Message Processor (Orchestrator)
 * @description Orquestador de triaje encargado de procesar un mensaje ciudadano entrante,
 * aplicar anonimización de identidad bajo la LGPD mediante `MaskCitizenIdentity`,
 * clasificar el medio y propósito funcional mediante `ClassifyWhatsAppMessagePayload`,
 * medir la latencia con `TraceExecutionTime` y emitir telemetría conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Isomorphic).
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

import type { IWhatsAppMessage } from '../../schemas/WhatsAppWebhook.schema';
import { ClassifyWhatsAppMessagePayload } from './ClassifyWhatsAppMessagePayload';
import type { IWhatsAppMessageClassification } from './schemas/WhatsAppMessageClassification.schema';

const MESSAGE_PROCESSOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'WHATSAPP_INDIVIDUAL_PROCESSOR',
);

const PROCESS_MESSAGE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'PROCESS_INDIVIDUAL_WHATSAPP_MESSAGE',
);

const SIGNAL_CLASSIFIED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SIGNAL_RECEIVED_FOR_CLASSIFICATION',
);

const UNKNOWN_SIGNAL_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'UNKNOWN_SIGNAL_TYPE_IGNORED',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Procesa individualmente un mensaje de WhatsApp, anonimiza el remitente y emite el triaje SRE.
 *
 * @param incomingWhatsAppMessageSnapshot - Mensaje entrante validado por `WhatsAppMessageSchema`.
 * @param correlationIdentifierFallback - Identificador de correlación para la trazabilidad distribuida.
 * @returns {Promise<IWhatsAppMessageClassification>} Descriptor clasificado e inmutable del mensaje.
 */
export const HandleIndividualWhatsAppMessage = async (
  incomingWhatsAppMessageSnapshot: IWhatsAppMessage,
  correlationIdentifierFallback?: string,
): Promise<IWhatsAppMessageClassification> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  return await TraceExecutionTime(
    MESSAGE_PROCESSOR_MODULE_IDENTIFIER,
    PROCESS_MESSAGE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IWhatsAppMessageClassification> => {
      const maskedSenderIdentifierLiteral = await MaskCitizenIdentity({
        rawIdentityLiteral: incomingWhatsAppMessageSnapshot.from,
        maskingStrategyLiteral: 'BRAZILIAN_DOCUMENT',
      });

      const classificationSnapshot = ClassifyWhatsAppMessagePayload(
        incomingWhatsAppMessageSnapshot,
      );

      const isUnhandledSignalBoolean =
        classificationSnapshot.targetSubsystemLiteral === 'UNHANDLED_SIGNAL_TYPE';

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isUnhandledSignalBoolean ? 'WARNING' : 'INFO',
        moduleIdentifierLiteral: MESSAGE_PROCESSOR_MODULE_IDENTIFIER,
        operationCodeLiteral: isUnhandledSignalBoolean
          ? UNKNOWN_SIGNAL_OPERATION_CODE
          : SIGNAL_CLASSIFIED_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: classificationSnapshot.summaryDescriptionLiteral,
        semanticIntentTag: isUnhandledSignalBoolean
          ? 'WHATSAPP_UNHANDLED_SIGNAL_TYPE'
          : 'WHATSAPP_INCOMING_MESSAGE_CLASSIFIED',
        contextMetadataSnapshot: Object.freeze({
          metaMessageIdentifier: classificationSnapshot.metaMessageIdentifier,
          messageTypeLiteral: classificationSnapshot.messageTypeLiteral,
          targetSubsystemLiteral: classificationSnapshot.targetSubsystemLiteral,
          senderIdentityMask: maskedSenderIdentifierLiteral,
          ...classificationSnapshot.classificationMetadata,
        }),
      });

      return classificationSnapshot;
    },
  );
};
