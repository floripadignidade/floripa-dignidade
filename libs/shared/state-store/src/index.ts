/**
 * @section Shared State Store - Enterprise Global Package Entry Point
 * @description Única fuente de verdad para el estado reactivo, la persistencia
 * soberana y la gobernanza de identidad ciudadana.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Isomorphic Reactivity.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @section 1. ADN Estructural (Schemas & Types)
 */
export * from './lib/schemas/GlobalState.schema';

/**
 * @section 2. Rebanadas Lógicas (Slices & Actions)
 * Exportación de contratos para la inyección de dependencias.
 */
export type { TUiSlice, IUiActions } from './lib/slices/createUiSlice';
export type { TReputationSlice, IReputationActions } from './lib/slices/createReputationSlice';
export type { TSyncSentrySlice, ISyncSentryActions } from './lib/slices/createSyncSentrySlice';
export type { TPresenceSlice, IPresenceActions } from './lib/slices/createPresenceSlice';
export type { TGovernanceSlice, IGovernanceActions } from './lib/slices/createGovernanceSlice';

/**
 * @section 3. Orquestadores y Guardianes (React Layer)
 */
export { useGlobalStateStore } from './lib/GlobalInfrastructureStateStore';
export { PersistenceGuardian } from './lib/components/PersistenceGuardian';
export { usePresenceSentry } from './lib/hooks/usePresenceSentry';

/**
 * @interface IGlobalSovereignStore
 * Representación total de la memoria institucional.
 */
export type { IGlobalSovereignStore } from './lib/GlobalInfrastructureStateStore';

/**
 * @version 1.0.0
 * Estatus: Extracción de Memoria completada. Centro de mando activo.
 */
export const SHARED_STATE_STORE_VERSION = '1.0.0';
