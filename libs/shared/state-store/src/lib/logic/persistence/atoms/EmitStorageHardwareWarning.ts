/**
 * @file libs/shared/state-store/src/lib/logic/persistence/atoms/EmitStorageHardwareWarning.ts
 * @section Shared State Store - Storage Warning Telemetry Dispatcher (Atom)
 * @description Átomo encargado exclusivamente de emitir señales de advertencia SRE
 * conformes a `TelemetrySignalSchema` ante fallos controlados de lectura, escritura o
 * permisos en el almacenamiento local del navegador.
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
  ModuleIdentifierSchema,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

const STORAGE_ADAPTER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'STATE_STORE_STORAGE_ADAPTER',
);

/**
 * Emite de forma no bloqueante una señal de advertencia ante fallos en `localStorage`.
 *
 * @param operationCodeLiteral - Código técnico normalizado de la operación fallida.
 * @param storageKeyLiteral - Clave de almacenamiento bajo operación.
 * @param caughtExecutionError - Excepción o error de hardware capturado.
 */
export const EmitStorageHardwareWarning = (
  operationCodeLiteral: string,
  storageKeyLiteral: string,
  caughtExecutionError: unknown,
): void => {
  const errorDescriptionLiteral =
    caughtExecutionError instanceof Error
      ? caughtExecutionError.message
      : String(caughtExecutionError);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: STORAGE_ADAPTER_MODULE_IDENTIFIER,
    operationCodeLiteral: OperationCodeSchema.parse(operationCodeLiteral),
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: `Incidencia controlada en almacenamiento local [${operationCodeLiteral}].`,
    semanticIntentTag: 'LOCAL_STORAGE_OPERATION_WARNING',
    contextMetadataSnapshot: Object.freeze({
      storageKeyLiteral,
      errorDescriptionLiteral,
    }),
  });
};
