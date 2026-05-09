/**
 * @section State Slice - Liquid Democracy & Democratic Governance
 * @description Átomo encargado de gestionar la delegación de soberanía de voto,
 * la jerarquía de moderación por mérito y el rastro de favoritos del ciudadano.
 *
 * Protocolo OEDP-V17.0 - Sovereign Governance & Swarm Intelligence.
 * SANEADO Zenith: Resolución de fricción de opcionalidad (TS2345 / exactOptionalPropertyTypes).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { StateCreator } from 'zustand';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

/**
 * 🛡️ SANEADO Zenith: Extracción de tipos nominales (Branded Types).
 * Se remueve la inferencia directa que heredaba 'undefined' (por el .optional() de Zod)
 * y se extrae el tipo base mediante utilidades de TypeScript (NonNullable)
 * para permitir la asignación segura del valor 'null' definido en el estado inicial.
 */
type TCitizenIdentifier = NonNullable<IGlobalStateADN['identity']['activeCitizenIdentifier']>;
type TGroupIdentifier = IGlobalStateADN['governance']['favoriteGroupsCollection'][0];

/**
 * @interface IGovernanceActions
 * @description Acciones soberanas para el ejercicio de la democracia digital.
 */
export interface IGovernanceActions {
  /**
   * Asigna un mandatario temporal o permanente para el ejercicio del voto delegado.
   * Implementa el principio de Democracia Líquida.
   */
  readonly DelegateSovereigntyAction: (mandataryIdentifier: string) => void;

  /**
   * Revoca cualquier delegación activa y recupera el ejercicio directo de la soberanía.
   */
  readonly ReclaimSovereigntyAction: () => void;

  /**
   * Alterna el estado de un Action Hub en la colección de favoritos del ciudadano.
   */
  readonly ToggleFavoriteGroupAction: (groupIdentifier: string) => void;

  /**
   * Actualiza el nivel de antigüedad tras una auditoría del Neural Sentinel.
   */
  readonly UpdateCommunitySeniorityAction: (seniorityLevel: number) => void;
}

/**
 * @name TGovernanceSlice
 * @description Unión del ADN estructural de gobernanza y sus motores de mutación.
 */
export type TGovernanceSlice = IGlobalStateADN['governance'] & IGovernanceActions;

/**
 * Generador de la rebanada de Gobernanza Democrática.
 */
export const createGovernanceSlice: StateCreator<TGovernanceSlice, [], [], TGovernanceSlice> = (set) => ({

  // --- 1. ESTADO INICIAL (ADN Gobernanza) ---
  activeMandataryIdentifier: null,
  isIdentityBiometricallyVerifiedBoolean: false,
  communitySeniorityLevelQuantity: 0,
  favoriteGroupsCollection: [],

  // --- 2. ACCIONES SOBERANAS (Motores de Mutación) ---

  DelegateSovereigntyAction: (mandataryIdentifier) => set({
    /**
     * 🛡️ CASTING SOBERANO (Fix TS2345):
     * Elevamos el string al tipo inmutable 'CitizenIdentifier'. Como 'TCitizenIdentifier'
     * ahora está libre de 'undefined', el compilador acepta la mutación.
     */
    activeMandataryIdentifier: mandataryIdentifier as TCitizenIdentifier
  }),

  ReclaimSovereigntyAction: () => set({
    activeMandataryIdentifier: null
  }),

  ToggleFavoriteGroupAction: (groupIdentifier) => set((state) => {
    /**
     * 🛡️ CASTING SOBERANO:
     * Elevamos el parámetro 'string' a 'GroupIdentifier' para la comparación.
     */
    const sealedGroupIdentifier = groupIdentifier as TGroupIdentifier;

    const isGroupAlreadyFavoritedBoolean = state.favoriteGroupsCollection.includes(sealedGroupIdentifier);

    return {
      favoriteGroupsCollection: isGroupAlreadyFavoritedBoolean
        ? state.favoriteGroupsCollection.filter((id) => id !== sealedGroupIdentifier)
        : [...state.favoriteGroupsCollection, sealedGroupIdentifier]
    };
  }),

  UpdateCommunitySeniorityAction: (seniorityLevel) => set({
    communitySeniorityLevelQuantity: seniorityLevel
  })
});
