'use client';

/**
 * @section Interaction Logic - Public Reaction Connector (Hook)
 * @description Puente isomórfico entre la interfaz de usuario y el motor de
 * sentimientos. Implementa 'Optimistic UI' para latencia cero percibida y
 * 'Sync Sentry' para el encolamiento de acciones en entornos sin red.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Inyección de caché de impacto (Reputation Slice) y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useState } from 'react';

/* 1. Infraestructura Core & Shared (Sovereign Swarm) */
import { useGlobalStateStore } from '@floripa-dignidade/shared';
import type { IGlobalSovereignStore } from '@floripa-dignidade/shared';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/* 2. ADN Estructural y Enjambre de Dominio */
import type { IUserIdentity } from '@floripa-dignidade/identity';
import { ProcessPublicReactionTransaction } from '../ProcessPublicReactionTransaction';
import { BuildPublicReactionPayload } from '../atomic/BuildPublicReactionPayload';
import { TransmitPublicReactionToCloud } from '../atomic/TransmitPublicReactionToCloud';

/**
 * @interface IUsePublicReactionParameters
 * @description Contrato inmutable de parametrización para el orquestador visual.
 */
export interface IUsePublicReactionParameters {
  readonly targetEntityIdentifier: string;
  readonly targetApiEndpointLiteral: string;
  readonly activeCitizenIdentitySnapshot?: IUserIdentity;
}

/**
 * @interface IUsePublicReactionResult
 * @description Capacidades expuestas para la interfaz ciudadana.
 */
export interface IUsePublicReactionResult {
  readonly isExecutingBoolean: boolean;
  readonly optimisticPolarityNumeric: number;
  readonly submitReactionAction: (polarityNumeric: number, emoticonIntentionLiteral?: string) => Promise<void>;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const REACTION_HOOK_IDENTIFIER = 'PUBLIC_REACTION_CONNECTOR_HOOK';

/**
 * Hook de élite para la gestión de reacciones ciudadanas.
 * Orquesta la transformación atómica, persistencia cloud y estado visual.
 *
 * @param parameters - Configuración de la entidad destino y contexto de identidad.
 * @returns {IUsePublicReactionResult} Operaciones atómicas para la UI.
 */
export const usePublicReaction = (
  parameters: IUsePublicReactionParameters
): IUsePublicReactionResult => {

  /**
   * @section Integración SRE y Memoria Soberana (State Store)
   * 🛡️ SANEADO Zenith: Incorporamos la acción de caché de impacto para que el
   * ciudadano vea el peso de su voto reflejado instantáneamente.
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

  const submitReactionAction = useCallback(async (
    polarityNumeric: number,
    emoticonIntentionLiteral?: string
  ): Promise<void> => {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const previousPolarityNumeric = optimisticPolarityNumeric;

    // 1. ACTUALIZACIÓN VISUAL INMEDIATA (Optimistic UI)
    setOptimisticPolarityNumeric(polarityNumeric);
    setIsExecutingBoolean(true);

    try {
      // 2. CONSTRUCCIÓN Y PONDERACIÓN (Delegación Atómica)
      const rawInteractionPayloadSnapshot = BuildPublicReactionPayload(
        parameters.targetEntityIdentifier,
        polarityNumeric,
        parameters.activeCitizenIdentitySnapshot,
        emoticonIntentionLiteral
      );

      const validatedReactionSnapshot = await ProcessPublicReactionTransaction(
        rawInteractionPayloadSnapshot,
        parameters.activeCitizenIdentitySnapshot
      );

      // 3. VIGILANCIA DE RED (Offline Mode Support)
      if (!isNetworkOnlineBoolean) {
        IncrementPendingQueueAction();

        void EmitTelemetrySignal({
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
          operationCodeLiteral: 'REACTION_QUEUED_OFFLINE',
          correlationIdentifier,
          messageContentLiteral: 'Sin conexión de red. Reacción encolada para sincronización diferida.',
          semanticIntentTag: 'OFFLINE_STATE_DEFERRAL'
        });

        setIsExecutingBoolean(false);
        return;
      }

      // 4. TRANSMISIÓN FÍSICA (Delegación Atómica)
      await TransmitPublicReactionToCloud(
        parameters.targetApiEndpointLiteral,
        validatedReactionSnapshot
      );

      /**
       * 5. ACTUALIZACIÓN DE MEMORIA CACHÉ (Bayesian Reflection)
       * Simulamos un impacto en el consenso para que la UI principal (Frontpage)
       * no deba re-consultar la base de datos inmediatamente.
       *
       * NOTA: El cálculo es una aproximación optimista. El servidor calculará
       * el valor real Bayesiano en background.
       */
      const simulatedConsensusIndexNumeric = polarityNumeric === 0 ? 0.5 : 1.0;

      CacheImpactIndicatorAction(
        parameters.targetEntityIdentifier,
        validatedReactionSnapshot.calculatedImpactWeightNumeric,
        simulatedConsensusIndexNumeric
      );

      // 6. REPORTE SRE (Nominal Success)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
        operationCodeLiteral: 'REACTION_SYNC_SUCCESSFUL',
        correlationIdentifier,
        messageContentLiteral: 'Reacción pública sincronizada exitosamente con la nube.',
        contextMetadataSnapshot: {
          calculatedImpactWeightNumeric: validatedReactionSnapshot.calculatedImpactWeightNumeric,
          targetEntityIdentifierLiteral: parameters.targetEntityIdentifier
        }
      });

    } catch (caughtError: unknown) {
      // 7. RECUPERACIÓN FORENSE (Optimistic Rollback)
      setOptimisticPolarityNumeric(previousPolarityNumeric);

      const errorDescriptionLiteral = caughtError instanceof Error
        ? caughtError.message
        : String(caughtError);

      void EmitTelemetrySignal({
        severityLevelLiteral: 'ERROR',
        moduleIdentifierLiteral: REACTION_HOOK_IDENTIFIER,
        operationCodeLiteral: 'REACTION_SYNC_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Fallo al procesar la reacción. Estado visual revertido.',
        contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
      });
    } finally {
      setIsExecutingBoolean(false);
    }
  }, [
    optimisticPolarityNumeric,
    parameters,
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
