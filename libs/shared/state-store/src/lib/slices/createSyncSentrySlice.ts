/**
 * @section State Slice - Sync Sentry (SRE Connectivity)
 * @description Sensor de resiliencia encargado de monitorear el estado de la red
 * y gestionar la cola de acciones pendientes de sincronización. Garantiza
 * la integridad de la experiencia en escenarios offline (ADR 0025).
 *
 * Protocolo OEDP-V17.0 - High Performance, SRE Resilience & ISO Standards.
 * SANEADO Zenith: Resolución de violación de nomenclatura booleana (Fix naming-convention),
 * normalización de telemetría forense y alineación de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { StateCreator } from 'zustand';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

/**
 * @interface ISyncSentryActions
 * @description Acciones atómicas para la gobernanza de la sincronización y resiliencia.
 */
export interface ISyncSentryActions {
  /**
   * Actualiza el estado físico de la conexión detectado por el hardware.
   * Dispara ráfagas de sincronización al recuperar el enlace.
   */
  readonly UpdateNetworkStatusAction: (isOnlineBoolean: boolean) => void;

  /** Registra una nueva acción en la cola de espera por interrupción de red. */
  readonly IncrementPendingQueueAction: () => void;

  /** Notifica la finalización de un despacho físico exitoso hacia la nube. */
  readonly MarkSuccessfulSyncAction: () => void;
}

/**
 * @name TSyncSentrySlice
 * @description Unión del ADN estructural de sincronización y sus motores de mutación.
 */
export type TSyncSentrySlice = IGlobalStateADN['sync'] & ISyncSentryActions;

/** Identificador técnico del aparato para el Neural Sentinel. */
const SYNC_SENTRY_IDENTIFIER = 'STATE_SYNC_SENTRY_SLICE';

/**
 * Generador de la rebanada de Sincronización SRE.
 * Implementa el patrón de vigilancia activa de conectividad.
 */
export const createSyncSentrySlice: StateCreator<TSyncSentrySlice, [], [], TSyncSentrySlice> = (set, get) => ({

  // --- 1. ESTADO INICIAL (ADN Sincronización) ---
  isNetworkOnlineBoolean: true,
  pendingActionsQueueQuantity: 0,
  lastSuccessfulSyncTimestampISO: undefined,

  // --- 2. ACCIONES DE ÉLITE (Motores de Mutación) ---

  UpdateNetworkStatusAction: (isOnlineBoolean) => {
    /**
     * 🛡️ SANEADO Zenith: Uso de prefijo 'was' para cumplir con la Constitución Técnica.
     * Representa el estado inmediatamente anterior a la captura del hardware.
     */
    const wasNetworkOnlineBoolean = get().isNetworkOnlineBoolean;

    /**
     * @section Telemetría de Frontera
     * Emitimos señal solo si se detecta una transición real en el hardware de red.
     */
    if (wasNetworkOnlineBoolean !== isOnlineBoolean) {
      void EmitTelemetrySignal({
        severityLevelLiteral: isOnlineBoolean ? 'INFO' : 'WARNING',
        moduleIdentifierLiteral: SYNC_SENTRY_IDENTIFIER,
        operationCodeLiteral: isOnlineBoolean ? 'NETWORK_RESTORED_SIGNAL' : 'NETWORK_LOST_SIGNAL',
        correlationIdentifier: GenerateCorrelationIdentifier(),
        messageContentLiteral: isOnlineBoolean
          ? 'Conexión recuperada. Iniciando enjambre de sincronización con el Ledger Cloud.'
          : 'Se ha detectado una interrupción de red. Activando modo de resiliencia local.',
        contextMetadataSnapshot: {
          pendingActionsQueueQuantity: get().pendingActionsQueueQuantity,
          occurrenceTimestampISO: new Date().toISOString()
        }
      });

      set({ isNetworkOnlineBoolean: isOnlineBoolean });
    }
  },

  IncrementPendingQueueAction: () => {
    set((state) => ({
      pendingActionsQueueQuantity: state.pendingActionsQueueQuantity + 1
    }));
  },

  MarkSuccessfulSyncAction: () => {
    set((state) => ({
      /**
       * 🛡️ LEY DE RESILIENCIA:
       * Garantizamos que el contador de cola nunca sea negativo ante desincronizaciones.
       */
      pendingActionsQueueQuantity: Math.max(0, state.pendingActionsQueueQuantity - 1),
      lastSuccessfulSyncTimestampISO: new Date().toISOString()
    }));
  }
});
