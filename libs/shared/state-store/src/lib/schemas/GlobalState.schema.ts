/**
 * @section Shared State Store - Global State Schema Orchestrator (SSOT)
 * @description Única Fuente de Verdad (SSOT) que ensambla y re-exporta los contratos
 * inmutables del almacén global de estado (UI, Preferencias BCP 47, Identidad, Presencia,
 * Gobernanza, Caché de Impacto, Sincronización y Recuperación de Sesión).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica), ISO/IEC 25010 y ADR 0025 / ADR 0030.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  DemocraticGovernanceStateSchema,
  ImpactCacheStateSchema,
  SessionRecoveryStateSchema,
  SyncSentryStateSchema,
} from './atoms/GovernanceAndResilienceState.schema';
import {
  AvailabilityStatusEnum,
  CredibilityIdentityStateSchema,
  StateCitizenIdentifierSchema,
  StateGroupIdentifierSchema,
  UserPresenceStateSchema,
} from './atoms/StateIdentityAndPresence.schema';
import type {
  TAvailabilityStatus,
  TStateCitizenIdentifier,
  TStateGroupIdentifier,
} from './atoms/StateIdentityAndPresence.schema';
import {
  UiNavigationStateSchema,
  UserPreferenceStateSchema,
} from './atoms/UiAndPreferencesState.schema';

export {
  AvailabilityStatusEnum,
  CredibilityIdentityStateSchema,
  DemocraticGovernanceStateSchema,
  ImpactCacheStateSchema,
  SessionRecoveryStateSchema,
  StateCitizenIdentifierSchema,
  StateGroupIdentifierSchema,
  SyncSentryStateSchema,
  UiNavigationStateSchema,
  UserPresenceStateSchema,
  UserPreferenceStateSchema,
};

export type { TAvailabilityStatus, TStateCitizenIdentifier, TStateGroupIdentifier };

/**
 * @name GlobalStateSchema
 * @description Esquema maestro compuesto que permite validar snapshots completos de estado
 * durante la rehidratación desde almacenamiento local (ADR 0025).
 */
export const GlobalStateSchema = z
  .object({
    ui: UiNavigationStateSchema,
    preferences: UserPreferenceStateSchema,
    identity: CredibilityIdentityStateSchema,
    presence: UserPresenceStateSchema,
    governance: DemocraticGovernanceStateSchema,
    impactCache: ImpactCacheStateSchema,
    sync: SyncSentryStateSchema,
    session: SessionRecoveryStateSchema,
  })
  .readonly()
  .describe('Contrato maestro inmutable de todos los dominios del estado global de la aplicación.');

/**
 * @name IGlobalStateADN
 * @description Contrato de tipos derivado dinámicamente de `GlobalStateSchema`.
 */
export type IGlobalStateADN = z.infer<typeof GlobalStateSchema>;
