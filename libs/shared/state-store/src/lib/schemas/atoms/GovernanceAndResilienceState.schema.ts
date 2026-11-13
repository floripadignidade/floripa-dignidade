/**
 * @section Shared State Store - Governance, Cache and Resilience Schemas (Atom)
 * @description Define los contratos Zod inmutables para democracia líquida, caché de
 * indicadores de impacto (anti-CLS), sincronización offline y recuperación de borradores (ADR 0025).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Tolerancia a Fallos).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  StateCitizenIdentifierSchema,
  StateGroupIdentifierSchema,
} from './StateIdentityAndPresence.schema';

/**
 * @name DemocraticGovernanceStateSchema
 * @description Dominio 5: Estado de delegación de voto, verificación biométrica y grupos favoritos.
 */
export const DemocraticGovernanceStateSchema = z
  .object({
    activeMandataryIdentifier: StateCitizenIdentifierSchema.nullable()
      .default(null)
      .describe('Identificador del mandatario con poder de voto delegado o null si es directo.'),
    isIdentityBiometricallyVerifiedBoolean: z
      .boolean()
      .default(false)
      .describe('Indica si la identidad superó verificación biométrica o equivalente OIDC.'),
    communitySeniorityLevelQuantity: z
      .number()
      .int()
      .nonnegative()
      .default(0)
      .describe('Nivel acumulado de antigüedad ética en la red comunitaria.'),
    favoriteGroupsCollection: z
      .array(StateGroupIdentifierSchema)
      .default([])
      .describe('Colección de identificadores de grupos territoriales marcados como favoritos.'),
  })
  .readonly();

/**
 * @name ImpactCacheStateSchema
 * @description Dominio 6: Caché local de métricas de impacto para hidratación instantánea sin parpadeo.
 */
export const ImpactCacheStateSchema = z
  .object({
    lastViewedIndicatorsMapping: z
      .record(
        z.string(),
        z
          .object({
            weightedTrustScoreNumeric: z
              .number()
              .min(0)
              .max(1)
              .describe('Puntuación bayesiana ponderada de confianza pública.'),
            communityConsensusIndexNumeric: z
              .number()
              .min(0)
              .max(1)
              .describe('Índice de consenso comunitario observado para la entidad.'),
          })
          .readonly(),
      )
      .default({})
      .describe(
        'Diccionario indexado por identificador de entidad con últimos indicadores vistos.',
      ),
  })
  .readonly();

/**
 * @name SyncSentryStateSchema
 * @description Dominio 7: Monitor de conectividad física y cola de reconciliación offline (SRE).
 */
export const SyncSentryStateSchema = z
  .object({
    isNetworkOnlineBoolean: z
      .boolean()
      .default(true)
      .describe('Estado actual de conectividad de red reportado por el navegador.'),
    pendingActionsQueueQuantity: z
      .number()
      .nonnegative()
      .default(0)
      .describe('Cantidad de transacciones encoladas pendientes de sincronización en la nube.'),
    lastSuccessfulSyncTimestampISO: z
      .string()
      .datetime()
      .optional()
      .describe('Marca temporal ISO 8601 de la última sincronización exitosa con el Ledger.'),
  })
  .readonly();

/**
 * @name SessionRecoveryStateSchema
 * @description Dominio 8: Persistencia local de borradores ciudadanos ante cortes de red o energía.
 */
export const SessionRecoveryStateSchema = z
  .object({
    humanRightsReportDraftLiteral: z
      .string()
      .optional()
      .describe(
        'Texto en curso de una denuncia ciudadana para recuperación ante fallos (ADR 0025).',
      ),
    lastInteractionTimestampISO: z
      .string()
      .datetime()
      .optional()
      .describe('Marca temporal ISO 8601 de la última interacción guardada en sesión.'),
  })
  .readonly();
