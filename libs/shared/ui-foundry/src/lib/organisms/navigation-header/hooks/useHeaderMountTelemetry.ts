'use client';

/**
 * @section Shared UI Foundry - Header Mount Telemetry Hook (Atom)
 * @description Hook atómico encargado exclusivamente de emitir la señal telemétrica única
 * de montaje del encabezado institucional, protegiendo contra doble emisión en React 19
 * Strict Mode y cumpliendo estrictamente con `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Observabilidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useEffect, useRef } from 'react';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/**
 * Registra el montaje efectivo del encabezado en el flujo de telemetría forense.
 *
 * @param moduleIdentifier - Identificador técnico nominal del organismo emisor.
 */
export const useHeaderMountTelemetry = (moduleIdentifier: ModuleIdentifier): void => {
  const hasMountedBooleanReference = useRef(false);

  useEffect(() => {
    if (hasMountedBooleanReference.current) {
      return;
    }
    hasMountedBooleanReference.current = true;

    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: moduleIdentifier,
      operationCodeLiteral: 'HEADER_ORCHESTRATOR_MOUNTED' as OperationCode,
      correlationIdentifier: GenerateCorrelationIdentifier(),
      messageContentLiteral: 'Encabezado institucional activo y sensores de hardware vinculados.',
      semanticIntentTag: 'UI_COMPONENT_MOUNT',
      contextMetadataSnapshot: {
        renderTimestampISO: occurrenceTimestampISO,
      },
    });
  }, [moduleIdentifier]);
};
