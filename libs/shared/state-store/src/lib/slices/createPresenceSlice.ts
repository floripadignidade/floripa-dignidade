/**
 * @section State Slice - User Presence & PWA Context
 * @description Átomo encargado de gestionar la disponibilidad en tiempo real, 
 * el rastro de latidos (Heartbeats) y la vinculación de hardware para 
 * notificaciones Push (PWA).
 * 
 * Protocolo OEDP-V16.0 - High Performance SRE & Privacy by Design.
 * SANEADO Zenith: Resolución de errores de asignación TS2322 y sintaxis truncada.
 * 
 * @author Raz Podestá - MetaShark Tech
 */

import type { StateCreator } from 'zustand';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

/**
 * @interface IPresenceActions
 * @description Acciones atómicas para la sincronización del pulso de vida.
 */
export interface IPresenceActions {
  /** Transiciona el estado ontológico (Online/Away/DND). */
  readonly SetAvailabilityStatusAction: (status: IGlobalStateADN['presence']['availabilityStatus']) => void;
  
  /** Registra el token criptográfico para el despacho de alertas Push. */
  readonly RegisterPushTokenAction: (token: string) => void;
  
  /** Inyecta el mensaje de soberanía personal (Custom Status). */
  readonly SetCustomStatusMessageAction: (message: string) => void;
}

/** 
 * @name TPresenceSlice
 * @description Unión del ADN estructural de presencia y sus motores de mutación.
 */
export type TPresenceSlice = IGlobalStateADN['presence'] & IPresenceActions;

/**
 * Generador de la rebanada de Presencia Cognitiva.
 */
export const createPresenceSlice: StateCreator<TPresenceSlice, [], [], TPresenceSlice> = (set) => ({
  
  // --- 1. ESTADO INICIAL (ADN Presencia) ---
  availabilityStatus: 'OFFLINE',
  customStatusMessageLiteral: '',
  activePushTokenSecret: undefined,
  lastHeartbeatTimestampISO: new Date().toISOString(),

  // --- 2. ACCIONES DE ÉLITE (Motores de Mutación) ---

  /**
   * Actualiza el estatus de disponibilidad y renueva la marca temporal del latido.
   */
  SetAvailabilityStatusAction: (status) => set({ 
    availabilityStatus: status,
    lastHeartbeatTimestampISO: new Date().toISOString()
  }),

  /**
   * Vincula el identificador de hardware del dispositivo para el ruteo Push.
   */
  RegisterPushTokenAction: (token) => set({ 
    activePushTokenSecret: token 
  }),

  /**
   * Define la firma de estado pública del ciudadano.
   */
  SetCustomStatusMessageAction: (message) => set({ 
    customStatusMessageLiteral: message.substring(0, 60) 
  }),
});