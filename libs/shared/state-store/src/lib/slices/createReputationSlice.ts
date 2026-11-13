/**
 * @section State Slice - Reputation & Impact Cache
 * @description Orquesta la identidad bayesiana del actor y la memoria de corto
 * plazo para evitar pantallas en blanco mediante el patrón 'Stale-While-Revalidate'.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Alineación estricta de propiedades con el ADN Soberano (Fix TS2345).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { StateCreator } from 'zustand';
import type { IGlobalStateADN } from '../schemas/GlobalState.schema';

/**
 * @interface IReputationActions
 * @description Contrato inmutable para las operaciones de mutación de credibilidad.
 */
export interface IReputationActions {
  /**
   * Actualiza el peso de autoridad del ciudadano, infiriendo automáticamente
   * su estatus de verificación humana.
   */
  readonly UpdateActorAuthorityWeightAction: (weightNumeric: number) => void;

  /**
   * Registra un snapshot del termómetro popular en la memoria de corto plazo
   * para acelerar el renderizado en futuras visitas al mismo territorio.
   */
  readonly CacheImpactIndicatorAction: (
    entityIdentifierLiteral: string,
    weightedTrustScoreNumeric: number,
    communityConsensusIndexNumeric: number,
  ) => void;
}

/**
 * @name TReputationSlice
 * @description Unión inmutable de los dominios de Identidad, Caché de Impacto y Acciones.
 */
export type TReputationSlice = IGlobalStateADN['identity'] &
  IGlobalStateADN['impactCache'] &
  IReputationActions;

/**
 * Generador atómico de la rebanada de Reputación Bayesiana.
 */
export const createReputationSlice: StateCreator<TReputationSlice, [], [], TReputationSlice> = (
  set,
) => ({
  // --- 1. ESTADO INICIAL (ADN Soberano) ---
  actorAuthorityWeightNumeric: 0.1,
  isVerifiedHumanBoolean: false,
  lastViewedIndicatorsMapping: {},

  // --- 2. ACCIONES DE MUTACIÓN (Sovereign Motors) ---

  UpdateActorAuthorityWeightAction: (weightNumeric) =>
    set({
      actorAuthorityWeightNumeric: weightNumeric,
      /**
       * 🛡️ Regla de Negocio SRE:
       * Si el peso bayesiano alcanza 0.5 (50%), se considera que la entidad
       * ha superado el umbral de validación humana institucional.
       */
      isVerifiedHumanBoolean: weightNumeric >= 0.5,
    }),

  CacheImpactIndicatorAction: (
    entityIdentifierLiteral,
    weightedTrustScoreNumeric,
    communityConsensusIndexNumeric,
  ) =>
    set((state) => ({
      /**
       * 🛡️ SANEADO Zenith (Fix TS2345):
       * Las llaves inyectadas ahora cumplen de forma absoluta con el estándar
       * ISO exigido por el 'ImpactCacheStateSchema'. Cero abreviaturas.
       */
      lastViewedIndicatorsMapping: {
        ...state.lastViewedIndicatorsMapping,
        [entityIdentifierLiteral]: {
          weightedTrustScoreNumeric,
          communityConsensusIndexNumeric,
        },
      },
    })),
});
