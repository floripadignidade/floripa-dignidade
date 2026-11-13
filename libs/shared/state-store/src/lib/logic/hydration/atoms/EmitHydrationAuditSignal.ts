/**
 * @section Shared State Store - Hydration Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de construir y emitir señales telemétricas
 * conformes a `TelemetrySignalSchema` (con `occurrenceTimestampISO`, tipos nominales y
 * latencia medida) según el resultado del proceso de rehidratación local.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Observabilidad).
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

import type { IRehydratedStateAuditVerdict } from './ValidateRehydratedStateSnapshot';

const STATE_HYDRATION_MODULE_IDENTIFIER = 'GLOBAL_STATE_HYDRATION_AUDITOR' as ModuleIdentifier;

export type THydrationOutcomeLiteral =
  | 'STORAGE_FAULT'
  | 'SCHEMA_CORRUPTED'
  | 'COLD_START'
  | 'NOMINAL';

interface IHydrationSignalSpecification {
  readonly severityLevelLiteral: SeverityLevel;
  readonly operationCodeLiteral: OperationCode;
  readonly messageContentLiteral: string;
  readonly semanticIntentTag: string;
}

const HYDRATION_SIGNAL_CATALOG_MAPPING: Readonly<
  Record<THydrationOutcomeLiteral, IHydrationSignalSpecification>
> = Object.freeze({
  STORAGE_FAULT: {
    severityLevelLiteral: 'ERROR',
    operationCodeLiteral: 'STATE_HYDRATION_FAULT' as OperationCode,
    messageContentLiteral: 'STATE_STORE.TELEMETRY.HYDRATION_STORAGE_READ_FAILURE',
    semanticIntentTag: 'LOCAL_PERSISTENCE_FAILURE',
  },
  SCHEMA_CORRUPTED: {
    severityLevelLiteral: 'WARNING',
    operationCodeLiteral: 'STATE_HYDRATION_SCHEMA_VIOLATION' as OperationCode,
    messageContentLiteral: 'STATE_STORE.TELEMETRY.HYDRATION_SCHEMA_CORRUPTION_DETECTED',
    semanticIntentTag: 'LOCAL_PERSISTENCE_CORRUPTION',
  },
  COLD_START: {
    severityLevelLiteral: 'DEBUG',
    operationCodeLiteral: 'STATE_HYDRATION_COLD_START' as OperationCode,
    messageContentLiteral: 'STATE_STORE.TELEMETRY.HYDRATION_COLD_START_NOMINAL',
    semanticIntentTag: 'LOCAL_PERSISTENCE_COLD_START',
  },
  NOMINAL: {
    severityLevelLiteral: 'INFO',
    operationCodeLiteral: 'STATE_HYDRATION_NOMINAL' as OperationCode,
    messageContentLiteral: 'STATE_STORE.TELEMETRY.HYDRATION_NOMINAL_SUCCESS',
    semanticIntentTag: 'LOCAL_PERSISTENCE_REHYDRATED',
  },
});

/**
 * @interface IEmitHydrationAuditSignalParameters
 * @description Parámetros inmutables requeridos para despachar la señal de auditoría de hidratación.
 */
export interface IEmitHydrationAuditSignalParameters {
  readonly correlationIdentifier: CorrelationIdentifier;
  readonly executionLatencyInMillisecondsQuantity: number;
  readonly caughtError: unknown;
  readonly auditVerdictSnapshot: IRehydratedStateAuditVerdict | undefined;
}

const resolveHydrationOutcomeLiteral = (
  caughtError: unknown,
  auditVerdictSnapshot: IRehydratedStateAuditVerdict | undefined,
): THydrationOutcomeLiteral => {
  if (caughtError) {
    return 'STORAGE_FAULT';
  }
  if (!auditVerdictSnapshot || !auditVerdictSnapshot.hasPersistedSnapshotBoolean) {
    return 'COLD_START';
  }
  return auditVerdictSnapshot.isValidationSuccessfulBoolean ? 'NOMINAL' : 'SCHEMA_CORRUPTED';
};

/**
 * Emite una señal telemétrica validada por contrato para el ciclo de rehidratación.
 *
 * @param parametersSnapshot - Contexto inmutable del resultado de rehidratación.
 */
export const EmitHydrationAuditSignal = (
  parametersSnapshot: IEmitHydrationAuditSignalParameters,
): void => {
  const {
    correlationIdentifier,
    executionLatencyInMillisecondsQuantity,
    caughtError,
    auditVerdictSnapshot,
  } = parametersSnapshot;

  const outcomeLiteral = resolveHydrationOutcomeLiteral(caughtError, auditVerdictSnapshot);
  const signalSpecification = HYDRATION_SIGNAL_CATALOG_MAPPING[outcomeLiteral];
  const errorDescriptionLiteral =
    caughtError instanceof Error ? caughtError.message : String(caughtError ?? '');

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: signalSpecification.severityLevelLiteral,
    moduleIdentifierLiteral: STATE_HYDRATION_MODULE_IDENTIFIER,
    operationCodeLiteral: signalSpecification.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: signalSpecification.messageContentLiteral,
    semanticIntentTag: signalSpecification.semanticIntentTag,
    executionLatencyInMillisecondsQuantity,
    contextMetadataSnapshot: {
      hydrationOutcomeLiteral: outcomeLiteral,
      ...(caughtError ? { errorTraceLiteral: errorDescriptionLiteral } : {}),
      ...(auditVerdictSnapshot
        ? {
            hasActiveMandataryBoolean: auditVerdictSnapshot.hasActiveMandataryBoolean,
            isNetworkOnlineBoolean: auditVerdictSnapshot.isNetworkOnlineBoolean,
            ...(auditVerdictSnapshot.validationIssuesCollection
              ? { validationIssuesCollection: auditVerdictSnapshot.validationIssuesCollection }
              : {}),
          }
        : {}),
    },
  });
};
