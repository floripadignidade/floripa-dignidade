/**
 * @section State Store Logic - Persistence Filter (Sovereign Filter)
 * @description Átomo de lógica pura que define la estrategia de persistencia selectiva.
 * Determina qué dominios del estado global son 'Inmortales' (LocalStorage)
 * cumpliendo con el Manifiesto ADR 0025.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Standards.
 */

import type { IGlobalSovereignStore } from '../GlobalInfrastructureStateStore';

/**
 * Filtra el estado global para retornar exclusivamente los campos autorizados
 * para persistencia en el almacenamiento local del ciudadano.
 *
 * @param stateSnapshot - Estado actual completo del enjambre.
 * @returns {Partial<IGlobalSovereignStore>} Fragmento de ADN para persistencia.
 */
export const StatePersistenceFilter = (
  stateSnapshot: IGlobalSovereignStore
): Partial<IGlobalSovereignStore> => {
  return {
    // Dominio: Identidad & Reputación
    actorAuthorityWeightNumeric: stateSnapshot.actorAuthorityWeightNumeric,
    lastViewedIndicatorsMapping: stateSnapshot.lastViewedIndicatorsMapping,

    // Dominio: Gobernanza & Democracia Líquida
    activeMandataryIdentifier: stateSnapshot.activeMandataryIdentifier,
    favoriteGroupsCollection: stateSnapshot.favoriteGroupsCollection,
    communitySeniorityLevelQuantity: stateSnapshot.communitySeniorityLevelQuantity,

    // Dominio: Presencia & Hardware
    activePushTokenSecret: stateSnapshot.activePushTokenSecret,
    customStatusMessageLiteral: stateSnapshot.customStatusMessageLiteral,

    // Dominio: Resiliencia SRE
    pendingActionsQueueQuantity: stateSnapshot.pendingActionsQueueQuantity,
    lastSuccessfulSyncTimestampISO: stateSnapshot.lastSuccessfulSyncTimestampISO,
  };
};
