'use client';

/**
 * @section Utility Logic - Presence Sentry Hook (Sensor)
 * @description Orquestador sensorial encargado de monitorear la actividad física
 * del ciudadano mediante eventos del navegador. Sincroniza los latidos (Heartbeats)
 * con el State Store soberano.
 *
 * Protocolo OEDP-V17.0 - High Performance, SRE Resilience & ISO Standards.
 * SANEADO Zenith: Resolución de rutas fantasmas (TS2307), inyección de alias
 * soberanos (Module Boundaries) y optimización de renderizado.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useEffect } from 'react';

/* 1. Infraestructura de Utilidades (Shared Boundary) */
import { DetermineTargetPresenceStatus } from '@floripa-dignidade/shared-utility';

/* 2. Memoria Institucional (SSOT) */
import { useGlobalStateStore } from '../GlobalInfrastructureStateStore';
import type { IGlobalSovereignStore } from '../GlobalInfrastructureStateStore';

/**
 * @interface IUsePresenceSentryResult
 * @description Contrato de salida inmutable para la auditoría del sensor.
 */
export interface IUsePresenceSentryResult {
  /** Indica si el sistema de vigilancia sensorial está operativo. */
  readonly isSentryActiveBoolean: boolean;
}

/**
 * Hook de élite para la gestión automatizada de presencia ciudadana.
 * Implementa una estrategia de "Passive Listening" para optimizar el Main Thread.
 *
 * @returns {IUsePresenceSentryResult} Estado de activación del sensor.
 */
export const usePresenceSentry = (): IUsePresenceSentryResult => {
  /**
   * @section Extracción de Memoria (Performance Optimization)
   * 🛡️ SANEADO Zenith: Se extraen las propiedades en selectores independientes
   * para prevenir re-renderizados innecesarios causados por la creación de
   * objetos literales en el mapeo de Zustand.
   */
  const SetAvailabilityStatusAction = useGlobalStateStore(
    (state: IGlobalSovereignStore) => state.SetAvailabilityStatusAction
  );

  const availabilityStatus = useGlobalStateStore(
    (state: IGlobalSovereignStore) => state.availabilityStatus
  );

  /**
   * @section Sincronización de Señales
   * Transfiere el estado detectado por el hardware al búnker de memoria.
   */
  const executePresenceSynchronizationAction = useCallback(() => {
    // 1. Captura de señales físicas del dispositivo
    const targetStatusLiteral = DetermineTargetPresenceStatus({
      isNavigatorOnlineBoolean: navigator.onLine,
      documentVisibilityStateLiteral: document.visibilityState
    });

    // 2. Commmit selectivo (Evita mutaciones redundantes)
    if (targetStatusLiteral !== availabilityStatus) {
      SetAvailabilityStatusAction(targetStatusLiteral);
    }
  }, [availabilityStatus, SetAvailabilityStatusAction]);

  useEffect(() => {
    /**
     * @section Registro de Sensores (Hardware Listeners)
     * 🛡️ SANEADO Zenith: Inyección de `{ passive: true }` para garantizar que los
     * event listeners no bloqueen el render loop (Mejora de INP - Core Web Vitals).
     */
    const hardwareListenerOptionsConfiguration = { passive: true };

    window.addEventListener('focus', executePresenceSynchronizationAction, hardwareListenerOptionsConfiguration);
    window.addEventListener('blur', executePresenceSynchronizationAction, hardwareListenerOptionsConfiguration);
    window.addEventListener('online', executePresenceSynchronizationAction, hardwareListenerOptionsConfiguration);
    window.addEventListener('offline', executePresenceSynchronizationAction, hardwareListenerOptionsConfiguration);
    document.addEventListener('visibilitychange', executePresenceSynchronizationAction, hardwareListenerOptionsConfiguration);

    /**
     * @section Heartbeat Preventivo (Keep-Alive)
     * Sincronización forzada para mitigar sesiones 'zombie'.
     * @constant HEARTBEAT_INTERVAL_MILLISECONDS_QUANTITY - 120,000 (2 Minutos).
     */
    const HEARTBEAT_INTERVAL_MILLISECONDS_QUANTITY = 120000;
    const heartbeatTimerReference = setInterval(
      executePresenceSynchronizationAction,
      HEARTBEAT_INTERVAL_MILLISECONDS_QUANTITY
    );

    // Inferencia de estado inmediata al montaje del sensor.
    executePresenceSynchronizationAction();

    return () => {
      // Limpieza forense de sensores
      window.removeEventListener('focus', executePresenceSynchronizationAction);
      window.removeEventListener('blur', executePresenceSynchronizationAction);
      window.removeEventListener('online', executePresenceSynchronizationAction);
      window.removeEventListener('offline', executePresenceSynchronizationAction);
      document.removeEventListener('visibilitychange', executePresenceSynchronizationAction);
      clearInterval(heartbeatTimerReference);
    };
  }, [executePresenceSynchronizationAction]);

  return {
    isSentryActiveBoolean: true
  };
};
