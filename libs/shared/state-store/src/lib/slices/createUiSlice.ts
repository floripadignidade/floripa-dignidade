/**
 * @section State Slice - UI Navigation
 * @description Gestiona el estado volátil de los componentes de interfaz. 
 * Estas propiedades no se persisten en disco para garantizar un arranque limpio.
 * 
 * Protocolo OEDP-V16.0 - Functional Atomicity.
 */

import type { StateCreator } from 'zustand';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

export interface IUiActions {
  readonly SetSearchPanelState: (isOpenBoolean: boolean) => void;
  readonly SetMobileMenuState: (isOpenBoolean: boolean) => void;
  readonly OpenModalAction: (modalIdentifierLiteral: string) => void;
  readonly CloseAllModalsAction: () => void;
}

export type TUiSlice = IGlobalStateADN['ui'] & IUiActions;

export const createUiSlice: StateCreator<TUiSlice, [], [], TUiSlice> = (set) => ({
  // --- ESTADO INICIAL ---
  isSearchPanelOpenBoolean: false,
  isMobileMenuOpenBoolean: false,
  activeModalIdentifierLiteral: null,

  // --- ACCIONES ATÓMICAS ---
  SetSearchPanelState: (isOpenBoolean) => set({ isSearchPanelOpenBoolean: isOpenBoolean }),
  
  SetMobileMenuState: (isOpenBoolean) => set({ isMobileMenuOpenBoolean: isOpenBoolean }),
  
  OpenModalAction: (modalIdentifierLiteral) => set({ activeModalIdentifierLiteral: modalIdentifierLiteral }),
  
  CloseAllModalsAction: () => set({ activeModalIdentifierLiteral: null })
});