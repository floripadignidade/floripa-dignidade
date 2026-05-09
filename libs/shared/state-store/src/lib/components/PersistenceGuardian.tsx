'use client';

/**
 * @section Utility Component - Persistence & SRE Guardian
 * @description Orquestador de lado cliente encargado de la hidratación del estado 
 * global y el monitoreo de conectividad física. Implementa la ley ADR 0025.
 * 
 * Protocolo OEDP-V16.0 - High Performance & Forensic Traceability.
 */

import { useEffect } from 'react';
import { useGlobalStateStore } from '../GlobalInfrastructureStateStore';

interface IPersistenceGuardianProperties {
  readonly children: React.ReactNode;
}

export const PersistenceGuardian: React.FC<IPersistenceGuardianProperties> = ({ children }) => {
  const UpdateNetworkStatusAction = useGlobalStateStore((state) => state.UpdateNetworkStatusAction);

  useEffect(() => {
    // 1. SINCRONIZACIÓN DE SENSORES DE RED
    const handleConnectivityChangeEvent = () => {
      UpdateNetworkStatusAction(navigator.onLine);
    };

    window.addEventListener('online', handleConnectivityChangeEvent);
    window.addEventListener('offline', handleConnectivityChangeEvent);

    // Ejecución inicial de detección
    handleConnectivityChangeEvent();

    return () => {
      window.removeEventListener('online', handleConnectivityChangeEvent);
      window.removeEventListener('offline', handleConnectivityChangeEvent);
    };
  }, [UpdateNetworkStatusAction]);

  /** 
   * Retornamos los hijos. Zustand gestiona la persistencia de forma 
   * interna mediante su middleware 'persist'.
   */
  return <>{children}</>;
};