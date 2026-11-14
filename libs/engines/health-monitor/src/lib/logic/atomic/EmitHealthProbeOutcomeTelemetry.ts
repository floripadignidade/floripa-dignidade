/**
 * @section Health Monitor - Outcome Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de mapear el estado ontológico resuelto
 * (`UP`, `DEGRADED`, `DOWN`) hacia su severidad y literal localizado, emitiendo una
 * señal conforme a `TelemetrySignalSchema`.
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
  type OperationCode,
  OperationCodeSchema,
  type SeverityLevel,
} from '@floripa-dignidade/telemetry';

import type { IHealthMonitorI18n } from '../../i18n/schemas/HealthMonitor.i18n.schema';
import type { HealthStatus } from '../../schemas/HealthStatus.schema';

/**
 * @interface IEmitHealthProbeTelemetryParameters
 * @description Contrato inmutable para emitir el resultado final de una sonda de salud.
 */
export interface IEmitHealthProbeTelemetryParameters {
  readonly moduleIdentifierLiteral: ModuleIdentifier;
  readonly targetServiceNameLiteral: string;
  readonly infrastructureHealthStatus: HealthStatus;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly dictionarySnapshot: IHealthMonitorI18n;
  readonly failureDiagnosticLiteral: string | undefined;
}

const STATUS_TO_SEVERITY_MAPPING: Readonly<Record<HealthStatus, SeverityLevel>> = Object.freeze({
  UP: 'INFO',
  DEGRADED: 'WARNING',
  DOWN: 'CRITICAL',
});

const sanitizeServiceOperationSegment = (serviceNameLiteral: string): string =>
  serviceNameLiteral
    .trim()
    .toUpperCase()
    .replace(/[^A-Z0-9_]/g, '_')
    .replace(/_+/g, '_');

const selectStatusMessageLiteral = (
  infrastructureHealthStatus: HealthStatus,
  telemetryDictionary: IHealthMonitorI18n['telemetry'],
): string => {
  if (infrastructureHealthStatus === 'DOWN') {
    return telemetryDictionary.probeDownLiteral;
  }
  if (infrastructureHealthStatus === 'DEGRADED') {
    return telemetryDictionary.probeDegradedLiteral;
  }
  return telemetryDictionary.probeNominalLiteral;
};

/**
 * Emite de forma no bloqueante la señal telemétrica validada del resultado de la sonda.
 *
 * @param parametersSnapshot - Servicio evaluado, estatus, latencia, correlación y diccionario.
 */
export const EmitHealthProbeOutcomeTelemetry = (
  parametersSnapshot: IEmitHealthProbeTelemetryParameters,
): void => {
  const {
    moduleIdentifierLiteral,
    targetServiceNameLiteral,
    infrastructureHealthStatus,
    executionLatencyInMillisecondsQuantity,
    correlationIdentifier,
    dictionarySnapshot,
    failureDiagnosticLiteral,
  } = parametersSnapshot;

  const severityLevelLiteral = STATUS_TO_SEVERITY_MAPPING[infrastructureHealthStatus];
  const operationCodeLiteral: OperationCode = OperationCodeSchema.parse(
    `HEALTH_PROBE_FINISHED_${sanitizeServiceOperationSegment(targetServiceNameLiteral)}`,
  );
  const messagePrefixLiteral = selectStatusMessageLiteral(
    infrastructureHealthStatus,
    dictionarySnapshot.telemetry,
  );

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral,
    moduleIdentifierLiteral,
    operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: `${messagePrefixLiteral} [${targetServiceNameLiteral}] -> [${infrastructureHealthStatus}]`,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_HEALTH_PROBE_RESULT',
    contextMetadataSnapshot: Object.freeze({
      targetServiceNameLiteral,
      infrastructureStatusLiteral: infrastructureHealthStatus,
      isNominalBoolean: infrastructureHealthStatus === 'UP',
      ...(failureDiagnosticLiteral !== undefined && { failureDiagnosticLiteral }),
    }),
  });
};
