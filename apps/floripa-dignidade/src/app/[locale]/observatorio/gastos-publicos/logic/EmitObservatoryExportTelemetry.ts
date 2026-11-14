/**
 * @section Observatory Logic - Export Intent Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir la señal telemétrica SRE
 * conforme a `TelemetrySignalSchema` cuando un ciudadano solicita la exportación
 * de datos del Observatorio de Gastos Públicos.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad).
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

const OBSERVATORY_HEADER_MODULE_IDENTIFIER = 'OBSERVATORY_HEADER_ATOM' as ModuleIdentifier;

/**
 * Registra de forma no bloqueante la intención ciudadana de exportar datos presupuestarios.
 *
 * @param exportActionLabelLiteral - Etiqueta activa del disparador pulsado en la interfaz.
 */
export const EmitObservatoryExportTelemetry = (exportActionLabelLiteral: string): void => {
  const occurrenceTimestampISO = new Date().toISOString();

  void EmitTelemetrySignal({
    occurrenceTimestampISO,
    severityLevelLiteral: 'INFO',
    moduleIdentifierLiteral: OBSERVATORY_HEADER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'DATA_EXPORT_INTENT_DETECTED' as OperationCode,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: 'Ciudadano solicitó la exportación del Ledger de gastos.',
    semanticIntentTag: 'OPEN_DATA_EXPORT',
    contextMetadataSnapshot: Object.freeze({
      exportActionLabelLiteral,
      triggeredTimestampISO: occurrenceTimestampISO,
    }),
  });
};
