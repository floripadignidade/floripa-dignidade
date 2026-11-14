/**
 * @section Analytics Logic - Telemetry Signal Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de formatear y emitir señales telemétricas
 * estructuradas conformes a `TelemetrySignalSchema` (`occurrenceTimestampISO`,
 * `ModuleIdentifier`, `OperationCode`, `semanticIntentTag` y contexto inmutable).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad).
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
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

const ANALYTICS_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'CORE_ANALYTICS_SERVICE',
) as ModuleIdentifier;

export type TAnalyticsSignalStage = 'REJECTED' | 'DISPATCHED' | 'FAILED';

interface ISignalDefinition {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly semanticIntentTag: string;
}

const SIGNAL_CATALOG_MAPPING: Readonly<Record<TAnalyticsSignalStage, ISignalDefinition>> =
  Object.freeze({
    REJECTED: {
      severityLevelLiteral: 'WARNING',
      operationCodeLiteral: 'INVALID_ANALYTICS_SCHEMA_DETECTION' as OperationCode,
      semanticIntentTag: 'ANALYTICS_SCHEMA_VALIDATION_WARNING',
    },
    DISPATCHED: {
      severityLevelLiteral: 'INFO',
      operationCodeLiteral: 'ANALYTICS_EVENT_DISPATCHED' as OperationCode,
      semanticIntentTag: 'USER_BEHAVIOR_METRIC_CAPTURED',
    },
    FAILED: {
      severityLevelLiteral: 'ERROR',
      operationCodeLiteral: 'ANALYTICS_DISPATCH_FAILURE' as OperationCode,
      semanticIntentTag: 'ANALYTICS_DISPATCH_FAULT',
    },
  });

/**
 * @interface IEmitAnalyticsSignalParameters
 * @description Contrato inmutable para la emisión de señales de ciclo de vida analítico.
 */
export interface IEmitAnalyticsSignalParameters {
  readonly stageLiteral: TAnalyticsSignalStage;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly messageContentLiteral: string;
  readonly contextMetadataSnapshot?: Readonly<Record<string, unknown>>;
}

/**
 * Emite una señal telemétrica con contrato garantizado ante el Neural Sentinel.
 *
 * @param parametersSnapshot - Parámetros de la señal de trazabilidad.
 */
export const EmitAnalyticsSignal = (parametersSnapshot: IEmitAnalyticsSignalParameters): void => {
  const signalDefinition = SIGNAL_CATALOG_MAPPING[parametersSnapshot.stageLiteral];

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: signalDefinition.severityLevelLiteral,
    moduleIdentifierLiteral: ANALYTICS_MODULE_IDENTIFIER,
    operationCodeLiteral: signalDefinition.operationCodeLiteral,
    correlationIdentifier: parametersSnapshot.correlationIdentifier,
    messageContentLiteral: parametersSnapshot.messageContentLiteral,
    semanticIntentTag: signalDefinition.semanticIntentTag,
    ...(parametersSnapshot.contextMetadataSnapshot !== undefined && {
      contextMetadataSnapshot: Object.freeze({ ...parametersSnapshot.contextMetadataSnapshot }),
    }),
  });
};
