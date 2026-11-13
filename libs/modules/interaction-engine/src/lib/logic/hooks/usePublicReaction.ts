'use client';

/**
 * @section Interaction Logic - Public Reaction Connector (Hook)
 * @description Puente isomórfico entre la interfaz de usuario y el motor de sentimientos.
 * Gestiona el ciclo de vida reactivo de una interacción (Like/Reacción), orquestando
 * estados optimistas, persistencia en el State Store y rastro forense.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Erradicación de extensiones (.js), Prosa ISO total, inyección
 * condicional de opcionales (Fix TS2379) y atomización de procesos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { useCallback, useMemo, useState } from 'react';

/* 1. Memoria Soberana (Shared Store - Clean Paths) */
import { useGlobalStateStore } from '@floripa-dignidade/shared-state-store';
import type { IGlobalSovereignStore } from '@floripa-dignidade/shared-state-store';

/* 2. Infraestructura Core (Atmos PascalCase) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

/* 3. ADN de Dominio y Motores Atómicos (Swarm Intelligence) */
import type { IUserIdentity } from '@floripa-dignidade/identity';
import { ExecutePublicReactionFlow } from '../atomic/ExecutePublicReactionFlow';
import { CalculateOptimisticConsensus } from '../atomic/CalculateOptimisticConsensus';

/** Identificador técnico del aparato para el Neural Sentinel. */
const HOOK_IDENTIFIER = 'PUBLIC_REACTION_CONNECTOR_HOOK';

/**
 * @interface IUsePublicReactionResult
 * @description Contrato de salida inmutable para componentes de la interfaz.
 */
export interface IUsePublicReactionResult {
  /** Indica si la transacción de red o cómputo está en curso. */
  readonly isExecutingBoolean: boolean;
  /** Valor de polaridad reflejado instantáneamente para feedback visual. */
  readonly optimisticPolarityNumeric: number;
  /** Acción asíncrona para disparar la reacción ciudadana. */
  readonly submitReactionAction: (
    interactionPolarityNumeric: number,
    semanticEmoticonIntentionLiteral?: string,
  ) => Promise<void>;
}

/**
 * Hook reactivo para la gestión de impactos sociales y termómetro popular.
 *
 * @param targetEntityIdentifier - UUID de la entidad que recibe la interacción.
 * @param targetApiEndpointUniformResourceLocatorLiteral - Endpoint físico para la transacción.
 * @param activeCitizenIdentitySnapshot - Contexto opcional de identidad soberana.
 * @returns {IUsePublicReactionResult} Sensores de estado y acciones de despacho.
 */
export const usePublicReaction = (
  targetEntityIdentifier: string,
  targetApiEndpointUniformResourceLocatorLiteral: string,
  activeCitizenIdentitySnapshot?: IUserIdentity,
): IUsePublicReactionResult => {
  // --- 1. SELECTORES DE MEMORIA SOBERANA (Atomic Selectors) ---
  const isNetworkOnlineBoolean = useGlobalStateStore(
    (state: IGlobalSovereignStore) => state.isNetworkOnlineBoolean,
  );
  const IncrementPendingQueueAction = useGlobalStateStore(
    (state: IGlobalSovereignStore) => state.IncrementPendingQueueAction,
  );
  const CacheImpactIndicatorAction = useGlobalStateStore(
    (state: IGlobalSovereignStore) => state.CacheImpactIndicatorAction,
  );

  // --- 2. ESTADOS DE INTERFAZ (Prosa Booleana) ---
  const [isExecutingBoolean, setIsExecutingBoolean] = useState(false);
  const [optimisticPolarityNumeric, setOptimisticPolarityNumeric] = useState(0);

  /**
   * @section Acción Primaria: submitReactionAction
   * @description Orquesta el flujo sanguíneo digital delegando en el átomo de ejecución.
   */
  const submitReactionAction = useCallback(
    async (
      interactionPolarityNumeric: number,
      semanticEmoticonIntentionLiteral?: string,
    ): Promise<void> => {
      const previousPolarityNumeric = optimisticPolarityNumeric;
      const correlationIdentifier = GenerateCorrelationIdentifier();

      // FASE 1: ACTUALIZACIÓN VISUAL INMEDIATA (Optimistic UI)
      setOptimisticPolarityNumeric(interactionPolarityNumeric);
      setIsExecutingBoolean(true);

      try {
        /**
         * FASE 2: DELEGACIÓN AL MOTOR SOBERANO (Execution Flow)
         * 🛡️ LEY ZENITH (Fix TS2379): Inyección condicional por dispersión.
         * Evita pasar propiedades con valor 'undefined' al contrato exacto.
         */
        const { calculatedImpactWeightNumeric } = await ExecutePublicReactionFlow({
          targetEntityIdentifier,
          polarityNumeric: interactionPolarityNumeric,
          targetApiEndpointLiteral: targetApiEndpointUniformResourceLocatorLiteral,
          isNetworkOnlineBoolean,
          IncrementPendingQueueAction,
          ...(activeCitizenIdentitySnapshot !== undefined && { activeCitizenIdentitySnapshot }),
          ...(semanticEmoticonIntentionLiteral !== undefined && {
            emoticonIntentionLiteral: semanticEmoticonIntentionLiteral,
          }),
        });

        // FASE 3: CONSOLIDACIÓN DE MEMORIA LOCAL (CLS Prevention)
        /** 🛡️ ATOMIZACIÓN: El cálculo de consenso se delega al átomo matemático. */
        const projectedConsensusIndexNumeric = CalculateOptimisticConsensus(
          interactionPolarityNumeric,
        );

        CacheImpactIndicatorAction(
          targetEntityIdentifier,
          calculatedImpactWeightNumeric,
          projectedConsensusIndexNumeric,
        );

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: HOOK_IDENTIFIER,
          operationCodeLiteral: 'UI_REACTION_COMMITTED',
          correlationIdentifier,
          messageContentLiteral: 'INTERACTION.LOGS.REACTION_RECEIVED',
          semanticIntentTag: 'UI_INTERACTION_SUCCESS',
        });
      } catch (caughtError: unknown) {
        // FASE 4: RECUPERACIÓN FORENSE (Rollback)
        setOptimisticPolarityNumeric(previousPolarityNumeric);

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: HOOK_IDENTIFIER,
          operationCodeLiteral: 'UI_REACTION_ROLLBACK',
          correlationIdentifier,
          messageContentLiteral: 'Fallo en flujo de reacción. Estado visual revertido.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });
      } finally {
        setIsExecutingBoolean(false);
      }
    },
    [
      optimisticPolarityNumeric,
      targetEntityIdentifier,
      targetApiEndpointUniformResourceLocatorLiteral,
      isNetworkOnlineBoolean,
      activeCitizenIdentitySnapshot,
      IncrementPendingQueueAction,
      CacheImpactIndicatorAction,
    ],
  );

  /** 🛡️ PERFORMANCE: Memoización del contrato de salida para evitar re-renderizados. */
  return useMemo(
    () => ({
      isExecutingBoolean,
      optimisticPolarityNumeric,
      submitReactionAction,
    }),
    [isExecutingBoolean, optimisticPolarityNumeric, submitReactionAction],
  );
};
