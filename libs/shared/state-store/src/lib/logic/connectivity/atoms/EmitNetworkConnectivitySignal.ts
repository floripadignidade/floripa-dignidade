/**
 * @section Shared State Store - Network Connectivity Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales telemétricas conformes a
 * `TelemetrySignalSchema` cuando ocurre una transición real de conectividad de red.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Observabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

const CONNECTIVITY_SYNC_MODULE_IDENTIFIER = 'STATE_CONNECTIVITY_SYNC_SLICE' as ModuleIdentifier;

/**
 * @interface IEmitNetworkConnectivitySignalParameters
 * @description Snapshot inmutable del estado de transición de red y volumen de cola pendiente.
 */
export interface IEmitNetworkConnectivitySignalParameters {
  readonly isOnlineBoolean: boolean;
  readonly pendingActionsQueueQuantity: number;
}

/**
 * Emite una señal telemétrica validada indicando restauración o interrupción de conectividad.
 *
 * @param parametersSnapshot - Estado booleano actual de red y cantidad de acciones en cola.
 */
export const EmitNetworkConnectivitySignal = (
  parametersSnapshot: IEmitNetworkConnectivitySignalParameters,
): void => {
  const { isOnlineBoolean, pendingActionsQueueQuantity } = parametersSnapshot;
  const occurrenceTimestampISO = new Date().toISOString();

  void EmitTelemetrySignal({
    occurrenceTimestampISO,
    severityLevelLiteral: isOnlineBoolean ? 'INFO' : 'WARNING',
    moduleIdentifierLiteral: CONNECTIVITY_SYNC_MODULE_IDENTIFIER,
    operationCodeLiteral: (isOnlineBoolean
      ? 'NETWORK_RESTORED_SIGNAL'
      : 'NETWORK_LOST_SIGNAL') as OperationCode,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: isOnlineBoolean
      ? 'STATE_STORE.CONNECTIVITY.NETWORK_RESTORED_SIGNAL'
      : 'STATE_STORE.CONNECTIVITY.NETWORK_LOST_SIGNAL',
    semanticIntentTag: isOnlineBoolean
      ? 'NETWORK_CONNECTIVITY_RESTORED'
      : 'NETWORK_CONNECTIVITY_INTERRUPTED',
    contextMetadataSnapshot: {
      isNetworkOnlineBoolean: isOnlineBoolean,
      pendingActionsQueueQuantity,
      transitionTimestampISO: occurrenceTimestampISO,
    },
  });
};
