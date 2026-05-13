'use client';

/**
 * @section Messaging Logic - Presence Transmission (Hook)
 * @description Orquestador sensorial encargado de vincular la memoria volátil del
 * ciudadano (State Store) con el Ledger de persistencia inmutable en la nube.
 * Implementa una estrategia de sincronización debounced para proteger el ancho
 * de banda y garantizar la integridad de la cadena de custodia.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de TS2379 (Exact Optional Types), erradicación de
 * rastro muerto (TS6133) e integración de telemetría forense activa.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

import { useEffect, useRef } from 'react';

/* 1. Infraestructura Core y Shared (Sovereign Boundaries) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

import {
  useGlobalStateStore
} from '@floripa-dignidade/shared-state-store';

import type {
  IGlobalSovereignStore
} from '@floripa-dignidade/shared-state-store';

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { CalculatePresenceSovereignSignature } from '../atomic/CalculatePresenceSovereignSignature';
import { ExecutePresenceSyncTransaction } from '../mutators/atomic/ExecutePresenceSyncTransaction';

/** Identificador técnico del aparato para el Neural Sentinel. */
const HOOK_IDENTIFIER = 'PRESENCE_TRANSMISSION_CONNECTOR_HOOK';

/**
 * Hook encargado de la vigilancia y sincronización del pulso de vida ciudadano.
 * Implementa el patrón "Passive Persistence Sentry" con rastro forense.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano activo (semilla de soberanía).
 */
export const usePresenceTransmissionConnector = (
  citizenIdentifierLiteral: string | undefined
): void => {

  // --- 1. SELECCIÓN DE MEMORIA SOBERANA (Atomic Selectors) ---
  const {
    activePushTokenSecret,
    availabilityStatus,
    customStatusMessageLiteral,
    lastHeartbeatTimestampISO
  } = useGlobalStateStore((state: IGlobalSovereignStore) => ({
    activePushTokenSecret: state.activePushTokenSecret,
    availabilityStatus: state.availabilityStatus,
    customStatusMessageLiteral: state.customStatusMessageLiteral,
    lastHeartbeatTimestampISO: state.lastHeartbeatTimestampISO
  }));

  // --- 2. REFERENCIAS DE CONTROL DE HARDWARE ---
  const lastSynchronizedSignatureReference = useRef<string>('');
  const isComponentMountedBooleanReference = useRef<boolean>(true);

  /**
   * @section Ciclo de Vigilancia de Presencia
   * 🛡️ LEY ZENITH: El rastro de vida solo se emite si existe una identidad legítima.
   */
  useEffect(() => {
    isComponentMountedBooleanReference.current = true;

    if (!citizenIdentifierLiteral) {
      return;
    }

    // 1. GENERACIÓN DE FIRMA DE SOBERANÍA (Idempotency Guard)
    const currentStatusSignatureLiteral = CalculatePresenceSovereignSignature({
      availabilityStatusLiteral: availabilityStatus,
      customStatusMessageLiteral: customStatusMessageLiteral ?? '',
      pushSubscriptionTokenSecret: activePushTokenSecret ?? ''
    });

    /**
     * FILTRO DE IDEMPOTENCIA:
     * Si el ADN del estado no ha mutado respecto a la última sincronización
     * exitosa, abortamos el despacho para optimizar el Tier de Datos.
     */
    if (currentStatusSignatureLiteral === lastSynchronizedSignatureReference.current) {
      return;
    }

    /**
     * @section Estrategia de Persistencia (SRE Debounce)
     * Implementamos un retardo de 1500ms para asegurar que ráfagas de
     * interacción no saturen la infraestructura cloud.
     */
    const synchronizationTimerReference = setTimeout(async () => {
      // Verificamos que el hardware siga activo antes de iniciar la transacción.
      if (!isComponentMountedBooleanReference.current) {
        return;
      }

      const correlationIdentifier = GenerateCorrelationIdentifier();

      // REPORTE DE INICIO DE SINCRONIZACIÓN (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: HOOK_IDENTIFIER,
        operationCodeLiteral: 'PRESENCE_SYNC_STARTED',
        correlationIdentifier,
        messageContentLiteral: 'Iniciando despacho de pulso de presencia hacia el Ledger.',
      });

      try {
        /**
         * 2. DESPACHO HACIA EL MUTADOR ATÓMICO
         * 🛡️ SANEADO Zenith (Fix TS2379): Cumplimiento de 'exactOptionalPropertyTypes'.
         * Utilizamos un objeto intermedio para evitar enviar propiedades con valor 'undefined'.
         */
        await ExecutePresenceSyncTransaction({
          citizenIdentifier: citizenIdentifierLiteral,
          currentAvailabilityStatus: availabilityStatus,
          lastHeartbeatTimestampISO,
          correlationIdentifier,
          // Inyección condicional: Solo existen en el payload si tienen valor real.
          ...(customStatusMessageLiteral !== undefined && { customStatusMessageLiteral }),
          ...(activePushTokenSecret !== undefined && { activePushTokenSecret }),
        });

        // 3. CONSOLIDACIÓN DE RASTRO
        lastSynchronizedSignatureReference.current = currentStatusSignatureLiteral;

        void EmitTelemetrySignal({
          severityLevelLiteral: 'DEBUG',
          moduleIdentifierLiteral: HOOK_IDENTIFIER,
          operationCodeLiteral: 'PRESENCE_SYNC_COMPLETED',
          correlationIdentifier,
          messageContentLiteral: 'Sincronización de presencia finalizada con éxito.',
        });

      } catch (_ignoredAuditFault: unknown) {
        /**
         * El fallo ya es gestionado y reportado con rastro forense
         * por el átomo 'ExecutePresenceSyncTransaction'.
         */
      }
    }, 1500);

    /**
     * @section Limpieza de Hardware
     */
    return () => {
      clearTimeout(synchronizationTimerReference);
      isComponentMountedBooleanReference.current = false;
    };
  }, [
    activePushTokenSecret,
    availabilityStatus,
    citizenIdentifierLiteral,
    customStatusMessageLiteral,
    lastHeartbeatTimestampISO
  ]);
};
