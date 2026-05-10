'use client';

/**
 * @section Messaging Logic - Presence Transmission Orchestrator (Hook)
 * @description Orquestador sensorial que vincula el State Store con el Ledger
 * de Persistencia. Gestiona el ciclo de vida del componente y la idempotencia.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de TS2307 (Shared State Store) y Atomización SRP.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useEffect, useRef } from 'react';

/* 1. Infraestructura Core y Shared (Zenith Boundaries) */
import { useGlobalStateStore } from '@floripa-dignidade/shared-state-store';
import type { IGlobalSovereignStore } from '@floripa-dignidade/shared-state-store';
import { GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { CalculatePresenceSovereignSignature } from '../atomic/CalculatePresenceSovereignSignature';
import { ExecutePresenceSyncTransaction } from '../mutators/atomic/ExecutePresenceSyncTransaction';

/**
 * Hook encargado de la sincronización automática de la presencia del ciudadano.
 * Implementa una estrategia de "Debounced Sync" para proteger el ancho de banda.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano activo.
 */
export const usePresenceTransmissionConnector = (
  citizenIdentifierLiteral: string | undefined
): void => {

  // 1. SELECTORES DE MEMORIA SOBERANA
  const {
    availabilityStatus,
    customStatusMessageLiteral,
    activePushTokenSecret,
    lastHeartbeatTimestampISO
  } = useGlobalStateStore((state: IGlobalSovereignStore) => ({
    availabilityStatus: state.availabilityStatus,
    customStatusMessageLiteral: state.customStatusMessageLiteral,
    activePushTokenSecret: state.activePushTokenSecret,
    lastHeartbeatTimestampISO: state.lastHeartbeatTimestampISO
  }));

  // 2. REFERENCIAS DE CONTROL DE HARDWARE
  const lastSynchronizedSignatureReference = useRef<string>('');
  const isComponentMountedReference = useRef<boolean>(true);

  useEffect(() => {
    isComponentMountedReference.current = true;

    // GUARDIA DE IDENTIDAD: Sin ciudadano no hay rastro de vida.
    if (!citizenIdentifierLiteral) return;

    /**
     * @section Generación de Firma de Soberanía
     * SANEADO Zenith: Uso de tipos nominales y normalización de nulos.
     */
    const currentStatusSignature = CalculatePresenceSovereignSignature({
      availabilityStatusLiteral: availabilityStatus,
      customStatusMessageLiteral: customStatusMessageLiteral ?? '',
      pushSubscriptionTokenSecret: activePushTokenSecret ?? ''
    });

    // FILTRO DE IDEMPOTENCIA: Si el estado no ha mutado, abortamos el despacho.
    if (currentStatusSignature === lastSynchronizedSignatureReference.current) {
      return;
    }

    /**
     * @section Estrategia de Persistencia (SRE Debounce)
     * Retardamos el envío 1500ms para asegurar que ráfagas de cambios de estado
     * (ej: Online -> Away rápido) no saturen el Tier Gratuito.
     */
    const synchronizationTimerReference = setTimeout(async () => {
      if (!isComponentMountedReference.current) return;

      const correlationIdentifier = GenerateCorrelationIdentifier();

      try {
        // DELEGACIÓN AL ÁTOMO DE TRANSACCIÓN
        await ExecutePresenceSyncTransaction({
          citizenIdentifier: citizenIdentifierLiteral,
          availabilityStatus,
          customStatusMessageLiteral,
          activePushTokenSecret,
          lastHeartbeatTimestampISO,
          correlationIdentifier
        });

        // Actualizamos la firma tras el éxito para evitar redundancia
        lastSynchronizedSignatureReference.current = currentStatusSignature;

      } catch (_ignoredAuditFault: unknown) {
        // El fallo ya ha sido reportado por telemetría dentro del átomo.
      }
    }, 1500);

    return () => {
      clearTimeout(synchronizationTimerReference);
      isComponentMountedReference.current = false;
    };
  }, [
    citizenIdentifierLiteral,
    availabilityStatus,
    customStatusMessageLiteral,
    activePushTokenSecret,
    lastHeartbeatTimestampISO
  ]);
};
