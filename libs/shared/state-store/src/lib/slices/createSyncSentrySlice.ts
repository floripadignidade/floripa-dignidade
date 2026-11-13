/**
 * @section Shared State Store - Connectivity Sync Slice (Orchestrator)
 * @description Segmento de estado encargado de monitorear el enlace físico de red
 * y administrar la cola de transacciones pendientes en escenarios offline (ADR 0025).
 * Delega la emisión de telemetría estructurada en `EmitNetworkConnectivitySignal`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Tolerancia a Fallos).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import type { StateCreator } from 'zustand';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { EmitNetworkConnectivitySignal } from '../logic/connectivity/atoms/EmitNetworkConnectivitySignal';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

const CONNECTIVITY_SLICE_MODULE_IDENTIFIER = 'STATE_CONNECTIVITY_SYNC_SLICE' as ModuleIdentifier;

/**
 * @interface ISyncSentryActions
 * @description Acciones atómicas para la gestión de conectividad y reconciliación offline.
 */
export interface ISyncSentryActions {
  /** Actualiza el estado de conectividad reportado por el navegador y emite telemetría en cambios reales. */
  readonly UpdateNetworkStatusAction: (isOnlineBoolean: boolean) => void;
  /** Incrementa de forma atómica el contador de transacciones encoladas por falta de conexión. */
  readonly IncrementPendingQueueAction: () => void;
  /** Decrementa sin subdesbordamiento la cola pendiente y sella la marca temporal de sincronización. */
  readonly MarkSuccessfulSyncAction: () => void;
}

/**
 * @name TSyncSentrySlice
 * @description Unión inmutable del dominio de sincronización y sus acciones de mutación.
 */
export type TSyncSentrySlice = IGlobalStateADN['sync'] & ISyncSentryActions;

/**
 * Crea el segmento de conectividad y resiliencia offline para el almacén global de Zustand.
 *
 * @param set - Mutador atómico de estado proporcionado por Zustand.
 * @param get - Selector síncrono del estado actual proporcionado por Zustand.
 * @returns {TSyncSentrySlice} Estado inicial y acciones puras de sincronización.
 */
export const createSyncSentrySlice: StateCreator<TSyncSentrySlice, [], [], TSyncSentrySlice> = (
  set,
  get,
) => ({
  isNetworkOnlineBoolean: true,
  pendingActionsQueueQuantity: 0,

  UpdateNetworkStatusAction: (isOnlineBoolean: boolean): void => {
    const inputValidationResult = z.boolean().safeParse(isOnlineBoolean);
    if (!inputValidationResult.success) {
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: CONNECTIVITY_SLICE_MODULE_IDENTIFIER,
        operationCodeLiteral: 'NETWORK_STATUS_CONTRACT_VIOLATION' as OperationCode,
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral:
          'Se recibió un valor no booleano al actualizar el estado de conectividad de red.',
        semanticIntentTag: 'STATE_MUTATION_CONTRACT_WARNING',
        contextMetadataSnapshot: {
          validationIssuesCollection: inputValidationResult.error.flatten(),
        },
      });
      return;
    }

    const isValidatedNetworkOnlineBoolean = inputValidationResult.data;
    const wasNetworkOnlineBoolean = get().isNetworkOnlineBoolean;

    if (wasNetworkOnlineBoolean !== isValidatedNetworkOnlineBoolean) {
      EmitNetworkConnectivitySignal({
        isOnlineBoolean: isValidatedNetworkOnlineBoolean,
        pendingActionsQueueQuantity: get().pendingActionsQueueQuantity,
      });

      set({ isNetworkOnlineBoolean: isValidatedNetworkOnlineBoolean });
    }
  },

  IncrementPendingQueueAction: (): void => {
    set((state) => ({
      pendingActionsQueueQuantity: state.pendingActionsQueueQuantity + 1,
    }));
  },

  MarkSuccessfulSyncAction: (): void => {
    set((state) => ({
      pendingActionsQueueQuantity: Math.max(0, state.pendingActionsQueueQuantity - 1),
      lastSuccessfulSyncTimestampISO: new Date().toISOString(),
    }));
  },
});
