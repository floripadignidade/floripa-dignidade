/**
 * @section Shared UI Foundry - Newsletter Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales telemétricas conformes a
 * `TelemetrySignalSchema` para cada etapa del flujo de conversión de suscripción.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010 (Observabilidad).
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

const NEWSLETTER_HOOK_MODULE_IDENTIFIER = 'USE_NEWSLETTER_SUBSCRIPTION_HOOK' as ModuleIdentifier;

export type TSubscriptionTelemetryStageLiteral = 'STARTED' | 'SUCCESS' | 'FAULT';

interface ITelemetryStageDefinition {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
}

const TELEMETRY_STAGE_CATALOG_MAPPING: Readonly<
  Record<TSubscriptionTelemetryStageLiteral, ITelemetryStageDefinition>
> = Object.freeze({
  STARTED: {
    severityLevelLiteral: 'INFO',
    operationCodeLiteral: 'SUBSCRIPTION_TRANSACTION_STARTED' as OperationCode,
    messageContentLiteral: 'UI_FOUNDRY.NEWSLETTER.SUBSCRIPTION_TRANSACTION_STARTED',
    semanticIntentTag: 'NEWSLETTER_CONVERSION_START',
  },
  SUCCESS: {
    severityLevelLiteral: 'INFO',
    operationCodeLiteral: 'SUBSCRIPTION_CONVERSION_SUCCESS' as OperationCode,
    messageContentLiteral: 'UI_FOUNDRY.NEWSLETTER.SUBSCRIPTION_CONVERSION_SUCCESS',
    semanticIntentTag: 'NEWSLETTER_CONVERSION_COMPLETE',
  },
  FAULT: {
    severityLevelLiteral: 'ERROR',
    operationCodeLiteral: 'SUBSCRIPTION_DISPATCH_FAULT' as OperationCode,
    messageContentLiteral: 'UI_FOUNDRY.NEWSLETTER.SUBSCRIPTION_DISPATCH_FAULT',
    semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
  },
});

/**
 * @interface IEmitNewsletterSubscriptionTelemetryParameters
 * @description Contrato inmutable de contexto para el reporte telemétrico del flujo.
 */
export interface IEmitNewsletterSubscriptionTelemetryParameters {
  readonly stageLiteral: TSubscriptionTelemetryStageLiteral;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly executionLatencyInMillisecondsQuantity?: number;
  readonly contextMetadataSnapshot?: Readonly<Record<string, unknown>>;
}

/**
 * Emite una señal telemétrica validada por contrato para auditoría del embudo de suscripción.
 *
 * @param parametersSnapshot - Etapa del ciclo de vida, correlación y metadatos anonimizados.
 */
export const EmitNewsletterSubscriptionTelemetry = (
  parametersSnapshot: IEmitNewsletterSubscriptionTelemetryParameters,
): void => {
  const stageDefinition = TELEMETRY_STAGE_CATALOG_MAPPING[parametersSnapshot.stageLiteral];

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: stageDefinition.severityLevelLiteral,
    moduleIdentifierLiteral: NEWSLETTER_HOOK_MODULE_IDENTIFIER,
    operationCodeLiteral: stageDefinition.operationCodeLiteral,
    correlationIdentifier: parametersSnapshot.correlationIdentifier,
    messageContentLiteral: stageDefinition.messageContentLiteral,
    semanticIntentTag: stageDefinition.semanticIntentTag,
    ...(parametersSnapshot.executionLatencyInMillisecondsQuantity !== undefined && {
      executionLatencyInMillisecondsQuantity:
        parametersSnapshot.executionLatencyInMillisecondsQuantity,
    }),
    ...(parametersSnapshot.contextMetadataSnapshot !== undefined && {
      contextMetadataSnapshot: parametersSnapshot.contextMetadataSnapshot,
    }),
  });
};
