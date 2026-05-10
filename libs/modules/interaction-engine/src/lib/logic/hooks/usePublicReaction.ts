'use client';

/**
 * @section Interaction Logic - Public Reaction Connector (Hook)
 * @description Puente isomórfico entre la interfaz de usuario y el motor de
 * sentimientos. Implementa 'Optimistic UI' y 'Sync Sentry' para resiliencia offline.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de TS2307 (Shared State Store), atomización de
 * consenso y cumplimiento de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useState } from 'react';

/* 1. Infraestructura de Memoria Soberana (Fragmented Shared Boundary) */
import { useGlobalStateStore } from '@floripa-dignidade/shared-state-store';
import type { IGlobalSovereignStore } from '@floripa-dignidade/shared-state-store';

/* 2. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/* 3. ADN Estructural y Enjambre de Dominio */
import type { IUserIdentity } from '@floripa-dignidade/identity';
import { BuildPublicReactionPayload } from '../atomic/BuildPublicReactionPayload';
import { CalculateOptimisticConsensus } from '../atomic/CalculateOptimisticConsensus';
import { TransmitPublicReactionToCloud } from '../atomic/TransmitPublicReactionToCloud';
import { ProcessPublicReactionTransaction } from '../ProcessPublicReactionTransaction';

/** Identificador técnico del aparato para el Neural Sentinel. */
const REACTION_HOOK_IDENTIFIER = 'PUBLIC_REACTION_CONNECTOR_HOOK';

/**
 * @interface IUsePublicReactionResult
 * @description Capacidades expuestas para la interacción ciudadana en la UI.
 */
export interface IUsePublicReactionResult {
  /** Estado de ejecución física de la transacción. */
  readonly isExecutingBoolean: boolean;
  /** Valor de polaridad reflejado instantáneamente para el feedback visual. */
  readonly optimisticPolarityNumeric: number;
  /** Gatillo de acción para disparar una nueva reacción. */
  readonly submitReactionAction: (polarityNumeric: number, emoticonIntentionLiteral?: string) => Promise<void>;
}

/**
 * Hook encargado de la gestión de reacciones con rastro de telemetría y resiliencia.
 *
 * @param targetEntityIdentifier - UUID de la entidad que recibe el impacto.
 * @param targetApiEndpointLiteral - URL física para la persistencia cloud.
 * @param activeCitizenIdentitySnapshot - Contexto de identidad validado.
 */
export const usePublicReaction = (
  targetEntityIdentifier: string,
  targetApiEndpointLiteral: string,
  activeCitizenIdentitySnapshot?: IUserIdentity
): IUsePublicReactionResult => {

  /**
   * @section Integración SRE (Sync Sentry)
   * 🛡️ SANEADO Zenith: Uso de selectores granulares del búnker 'shared-state-store'.
   */
  const {
    isNetworkOnlineBoolean,
    IncrementPendingQueueAction,
    CacheImpactIndicatorAction
  } = useGlobalStateStore((state: IGlobalSovereignStore) => ({
      isNetworkOnlineBoolean: state.isNetworkOnlineBoolean,
      IncrementPendingQueueAction: state.IncrementPendingQueueAction,
      CacheImpactIndicatorAction: state.CacheImpactIndicatorAction
  }));

  const [isExecutingBoolean, setIsExecutingBoolean] = useState(false);
  const [optimisticPolarityNumeric, setOptimisticPolarityNumeric] = useState(0);

  /**
   * @section Acción Primaria: submitReactionAction
   * Orquesta el flujo sanguíneo digital de la interacción.
   */
  const submitReactionAction = useCallback(async (
    polarityNumeric: number,
    emoticonIntentionLiteral?: string
  ): Promise<void> => {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const previousPolarityNumeric = optimisticPolarityNumeric;

    // 1. ACTUALIZACIÓN VISUAL INMEDIATA (Optimistic Pattern)
    setOptimisticPolarityNumeric(polarityNumeric);
    setIsExecutingBoolean(true);

    try {
      // 2. CONSTRUCCIÓN Y PONDERACIÓN (Delegación Atómica)
      const rawInteractionPayloadSnapshot = BuildPublicReactionPayload(
        targetEntityIdentifier,
        polarityNumeric,
        activeCitizenIdentitySnapshot,
        emoticonIntentionLiteral
      );

      const validatedReactionSnapshot = await ProcessPublicReactionTransaction(
        rawInteractionPayloadSnapshot,
        activeCitizenIdentitySnapshot
      );

      // 3. VIGILANCIA DE RED (SRE Resiliencia)
      if (!isNetworkOnlineBoolean) {
        IncrementPendingQueueAction();

        void EmitTelemetrySignal({
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
          operationCodeLiteral: 'REACTION_QUEUED_OFFLINE',
          correlationIdentifier,
          messageContentLiteral: 'INTERACTION.LOGS.OFFLINE_DEFERRAL',
          semanticIntentTag: 'OFFLINE_STATE_DEFERRAL'
        });

        setIsExecutingBoolean(false);
        return;
      }

      // 4. TRANSMISIÓN FÍSICA (Delegación al Átomo de I/O)
      await TransmitPublicReactionToCloud(
        targetApiEndpointLiteral,
        validatedReactionSnapshot
      );

      // 5. REFLEJO EN CACHÉ BAYESIANA (Delegación al Átomo de Lógica)
      const simulatedConsensusIndexNumeric = CalculateOptimisticConsensus(polarityNumeric);

      CacheImpactIndicatorAction(
        targetEntityIdentifier,
        validatedReactionSnapshot.calculatedImpactWeightNumeric,
        simulatedConsensusIndexNumeric
      );

      // 6. REPORTE DE ÉXITO (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
        operationCodeLiteral: 'REACTION_SYNC_SUCCESSFUL',
        correlationIdentifier,
        messageContentLiteral: 'INTERACTION.LOGS.REACTION_RECEIVED',
        contextMetadataSnapshot: {
          impactWeight: validatedReactionSnapshot.calculatedImpactWeightNumeric,
          entityId: targetEntityIdentifier
        }
      });

    } catch (caughtError: unknown) {
      // 7. RECUPERACIÓN FORENSE (Rollback)
      setOptimisticPolarityNumeric(previousPolarityNumeric);

      const errorTraceLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
        operationCodeLiteral: 'REACTION_SYNC_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Fallo al procesar la reacción. Estado visual revertido.',
        contextMetadataSnapshot: { errorTraceLiteral }
      });
    } finally {
      setIsExecutingBoolean(false);
    }
  }, [
    optimisticPolarityNumeric,
    targetEntityIdentifier,
    targetApiEndpointLiteral,
    activeCitizenIdentitySnapshot,
    isNetworkOnlineBoolean,
    IncrementPendingQueueAction,
    CacheImpactIndicatorAction
  ]);

  return {
    isExecutingBoolean,
    optimisticPolarityNumeric,
    submitReactionAction
  };
};
