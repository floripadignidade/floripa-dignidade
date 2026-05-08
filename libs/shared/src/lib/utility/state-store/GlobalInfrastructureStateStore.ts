/**
 * @section Infrastructure Logic - Global State Swarm Orchestrator
 * @description Punto de ensamblaje maestro para el enjambre de memoria institucional.
 * Orquesta la fusión de rebanadas lógicas (Slices) y aplica políticas de
 * persistencia soberana bajo el estándar ADR 0025.
 *
 * Protocolo OEDP-V17.0 - High Performance, SRE Resilience & ISO Standards.
 * SANEADO Zenith: Elevación a Vault V2, blindaje de hidratación y rigor de tipos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

/* 1. Enjambre de Rebanadas Lógicas (Slices) */
import { createGovernanceSlice } from './slices/createGovernanceSlice';
import { createPresenceSlice } from './slices/createPresenceSlice';
import { createReputationSlice } from './slices/createReputationSlice';
import { createSyncSentrySlice } from './slices/createSyncSentrySlice';
import { createUiSlice } from './slices/createUiSlice';

/* 2. Átomos de Lógica y Persistencia (Sovereign Swarm) */
import { StatePersistenceFilter } from './logic/StatePersistenceFilter';
import { StateHydrationAuditor } from './logic/StateHydrationAuditor';

/* 3. ADN de Tipado (Interfaces de Rebanada) */
import type { TGovernanceSlice } from './slices/createGovernanceSlice';
import type { TPresenceSlice } from './slices/createPresenceSlice';
import type { TReputationSlice } from './slices/createReputationSlice';
import type { TSyncSentrySlice } from './slices/createSyncSentrySlice';
import type { TUiSlice } from './slices/createUiSlice';

/**
 * @interface IGlobalSovereignStore
 * @description Unión inmutable de todos los contratos lógicos del enjambre.
 * Representa la memoria total del sistema en el lado del cliente.
 */
export type IGlobalSovereignStore =
  TUiSlice &
  TReputationSlice &
  TSyncSentrySlice &
  TPresenceSlice &
  TGovernanceSlice;

/**
 * @name useGlobalStateStore
 * @description Única Fuente de Verdad (SSOT) para el estado cognitivo del ecosistema.
 * Implementa persistencia multinivel para garantizar la resiliencia ante fallos de red.
 */
export const useGlobalStateStore = create<IGlobalSovereignStore>()(
  persist(
    (set, get, store) => ({
      /**
       * @section Inicialización de Rebanadas (Slices)
       * Delegamos la creación a los átomos especializados pasando las utilidades
       * de Zustand para mantener la reactividad del enjambre.
       */
      ...createUiSlice(set, get, store),
      ...createReputationSlice(set, get, store),
      ...createSyncSentrySlice(set, get, store),
      ...createPresenceSlice(set, get, store),
      ...createGovernanceSlice(set, get, store),
    }),
    {
      /**
       * 🛡️ SANEADO Zenith: Cambio de identificador físico.
       * Elevamos a V2 debido a cambios estructurales en el ADN (Identity/Branding).
       */
      name: 'fd-sovereign-vault-v2',

      /**
       * @section Gobernanza de Persistencia (ADR 0025)
       * Solo utilizamos el hardware de almacenamiento si estamos en el cliente.
       */
      storage: createJSONStorage(() => {
        const isClientEnvironmentBoolean = typeof window !== 'undefined';
        return isClientEnvironmentBoolean ? window.localStorage : (null as unknown as Storage);
      }),

      /**
       * Auditoría Forense: El auditor emite señales a telemetría tras la carga.
       */
      onRehydrateStorage: (initialState) => StateHydrationAuditor(initialState),

      /**
       * Filtro de Soberanía: Define qué partes del estado son "Inmortales".
       */
      partialize: (stateSnapshot) => StatePersistenceFilter(stateSnapshot),

      /** 🛡️ SANEADO Zenith: Inyectamos versión de esquema para auditoría de IA. */
      version: 2,
    }
  )
);
