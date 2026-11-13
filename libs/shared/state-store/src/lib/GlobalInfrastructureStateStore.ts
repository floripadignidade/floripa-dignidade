/**
 * @section Shared State Store - Global Infrastructure State Orchestrator (SSOT)
 * @description Orquestador maestro del almacén reactivo global en cliente (Zustand).
 * Ensambla las rebanadas funcionales (UI, Reputación/Caché, Conectividad, Presencia y
 * Gobernanza) y configura la persistencia multicapa resiliente (ADR 0025) delegando
 * almacenamiento seguro, migración Zod, filtrado y auditoría en átomos dedicados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica), ISO/IEC 25010 y ADR 0025.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';

import { STATE_STORE_CONFIGURATION } from './constants/StateStoreConfiguration';
import { MigratePersistedStoreState } from './logic/persistence/MigratePersistedStoreState';
import { ResolveSafeClientStorage } from './logic/persistence/ResolveSafeClientStorage';
import { StateHydrationAuditor } from './logic/StateHydrationAuditor';
import { StatePersistenceFilter } from './logic/StatePersistenceFilter';
import { createGovernanceSlice, type TGovernanceSlice } from './slices/createGovernanceSlice';
import { createPresenceSlice, type TPresenceSlice } from './slices/createPresenceSlice';
import { createReputationSlice, type TReputationSlice } from './slices/createReputationSlice';
import { createSyncSentrySlice, type TSyncSentrySlice } from './slices/createSyncSentrySlice';
import { createUiSlice, type TUiSlice } from './slices/createUiSlice';

/**
 * @interface IGlobalInfrastructureStore
 * @description Contrato compuesto e inmutable que representa el estado completo en cliente.
 */
export type IGlobalInfrastructureStore = TUiSlice &
  TReputationSlice &
  TSyncSentrySlice &
  TPresenceSlice &
  TGovernanceSlice;

/**
 * @deprecated Utilizar preferentemente `IGlobalInfrastructureStore` bajo norma OEDP-V18.1.
 */
export type IGlobalSovereignStore = IGlobalInfrastructureStore;

/**
 * @name useGlobalStateStore
 * @description Única Fuente de Verdad (SSOT) reactiva del estado en cliente con persistencia resiliente.
 */
export const useGlobalStateStore = create<IGlobalInfrastructureStore>()(
  persist(
    (set, get, store) => ({
      ...createUiSlice(set, get, store),
      ...createReputationSlice(set, get, store),
      ...createSyncSentrySlice(set, get, store),
      ...createPresenceSlice(set, get, store),
      ...createGovernanceSlice(set, get, store),
    }),
    {
      name: STATE_STORE_CONFIGURATION.PERSISTENCE_STORAGE_KEY_LITERAL,
      storage: createJSONStorage(() => ResolveSafeClientStorage()),
      version: STATE_STORE_CONFIGURATION.SCHEMA_VERSION_QUANTITY,
      migrate: MigratePersistedStoreState,
      onRehydrateStorage: (initialState) => StateHydrationAuditor(initialState),
      partialize: (stateSnapshot) => StatePersistenceFilter(stateSnapshot),
    },
  ),
);
