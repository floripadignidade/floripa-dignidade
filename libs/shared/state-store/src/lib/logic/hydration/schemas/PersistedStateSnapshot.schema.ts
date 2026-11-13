/**
 * @section Shared State Store - Persisted Snapshot Validation Schema (Atom)
 * @description Deriva mediante `.unwrap().pick()` el contrato Zod exacto de las propiedades
 * autorizadas para persistencia en `localStorage` (alineado con `StatePersistenceFilter`),
 * evitando duplicación de reglas y validando la integridad tras rehidratación (ADR 0025).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Seguridad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  CredibilityIdentityStateSchema,
  DemocraticGovernanceStateSchema,
  ImpactCacheStateSchema,
  SyncSentryStateSchema,
  UserPresenceStateSchema,
} from '../../../schemas/GlobalState.schema';

/**
 * @name PersistedStateSnapshotSchema
 * @description Contrato de validación para los datos rehidratados desde almacenamiento local.
 * Desempaqueta los esquemas atómicos inmutables mediante `.unwrap()` antes de proyectar sus campos,
 * ignorando en modo strip los métodos de acción de Zustand para auditar solo datos persistidos.
 */
export const PersistedStateSnapshotSchema = z
  .object({
    ...CredibilityIdentityStateSchema.unwrap().pick({
      actorAuthorityWeightNumeric: true,
    }).shape,
    ...ImpactCacheStateSchema.unwrap().pick({
      lastViewedIndicatorsMapping: true,
    }).shape,
    ...DemocraticGovernanceStateSchema.unwrap().pick({
      activeMandataryIdentifier: true,
      favoriteGroupsCollection: true,
      communitySeniorityLevelQuantity: true,
    }).shape,
    ...UserPresenceStateSchema.unwrap().pick({
      activePushTokenSecret: true,
      customStatusMessageLiteral: true,
    }).shape,
    ...SyncSentryStateSchema.unwrap().pick({
      isNetworkOnlineBoolean: true,
      pendingActionsQueueQuantity: true,
      lastSuccessfulSyncTimestampISO: true,
    }).shape,
  })
  .readonly()
  .describe('Subconjunto persistible del estado global validado durante la rehidratación.');

/**
 * @name TPersistedStateSnapshot
 * @description Representación tipada inmutable del subconjunto de estado persistido en cliente.
 */
export type TPersistedStateSnapshot = z.infer<typeof PersistedStateSnapshotSchema>;
