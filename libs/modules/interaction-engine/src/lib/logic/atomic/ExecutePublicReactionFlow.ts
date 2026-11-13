/**
 * @section Interaction Logic - Public Reaction Execution Flow (Orchestrator)
 * @description Motor de ejecución encargado de la transacción íntegra de una reacción.
 * Gestiona el ciclo de vida: Validación de Entrada -> Construcción de ADN ->
 * Triaje de Resiliencia (SRE) -> Transmisión Cloud.
 *
 * Isola la lógica de negocio de los ciclos de vida de React para garantizar
 * la testabilidad y la soberanía del flujo de datos.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Solución al error TS2379 y blindaje mediante Aduana de Parámetros.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import type { IUserIdentity } from '@floripa-dignidade/identity';

/* 1. Enjambre Atómico Local (Sub-Atoms) */
import { BuildPublicReactionPayload } from './BuildPublicReactionPayload';
import { ProcessPublicReactionTransaction } from '../ProcessPublicReactionTransaction';
import { TransmitPublicReactionToCloud } from './TransmitPublicReactionToCloud';

/**
 * @name ExecuteReactionParametersSchema
 * @description Aduana de ADN para los parámetros de ejecución del flujo.
 * Protege al motor contra datos de entrada malformados desde la interfaz.
 */
const ExecuteReactionParametersSchema = z
  .object({
    targetEntityIdentifier: z.string().uuid(),
    polarityNumeric: z.number().min(-1).max(1),
    targetApiEndpointLiteral: z.string().url(),
    isNetworkOnlineBoolean: z.boolean(),
    activeCitizenIdentitySnapshot: z.any().optional(), // Validado profundamente por ProcessPublicReactionTransaction
    emoticonIntentionLiteral: z.string().optional(),
    IncrementPendingQueueAction: z.function(),
  })
  .readonly();

/**
 * @interface IExecuteReactionParameters
 * @description Contrato inmutable para la ejecución del flujo de interacción.
 * 🛡️ SANEADO Zenith: Se incluye '| undefined' para cumplimiento estricto de
 * la regla 'exactOptionalPropertyTypes: true'.
 */
export interface IExecuteReactionParameters {
  readonly targetEntityIdentifier: string;
  readonly polarityNumeric: number;
  readonly targetApiEndpointLiteral: string;
  readonly isNetworkOnlineBoolean: boolean;
  readonly activeCitizenIdentitySnapshot?: IUserIdentity | undefined;
  readonly emoticonIntentionLiteral?: string | undefined;
  /** Acción delegada para el encolamiento de resiliencia SRE */
  readonly IncrementPendingQueueAction: () => void;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'EXECUTE_PUBLIC_REACTION_FLOW_ORCHESTRATOR';

/**
 * Ejecuta el pipeline de procesamiento de una reacción ciudadana.
 * Implementa el patrón "Sovereign Ingestion" con rastro forense inalterable.
 *
 * @param executionParametersSnapshot - Snapshot de parámetros validados por la interfaz.
 * @returns {Promise<{ readonly calculatedImpactWeightNumeric: number }>} Peso del impacto consolidado.
 * @throws {ValidationException} Si los parámetros violan el contrato de entrada.
 * @throws {InternalSystemException} Si ocurre un colapso en el Tier de Datos o Criptografía.
 */
export const ExecutePublicReactionFlow = async (
  executionParametersSnapshot: IExecuteReactionParameters,
): Promise<{ readonly calculatedImpactWeightNumeric: number }> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_REACTION_TRANSACTION_PIPELINE',
    correlationIdentifier,
    async () => {
      // 1. ADUANA DE ENTRADA (Input Boundary Protection)
      const inputValidationResult = ExecuteReactionParametersSchema.safeParse(
        executionParametersSnapshot,
      );

      if (!inputValidationResult.success) {
        throw new ValidationException('PARAMETROS_DE_EJECUCION_DE_REACCION_INVALIDOS', {
          structuralIssuesCollection: inputValidationResult.error.flatten(),
          correlationIdentifier,
        });
      }

      try {
        const {
          targetEntityIdentifier,
          polarityNumeric,
          targetApiEndpointLiteral,
          isNetworkOnlineBoolean,
          activeCitizenIdentitySnapshot,
          emoticonIntentionLiteral,
          IncrementPendingQueueAction,
        } = inputValidationResult.data;

        // 2. CONSTRUCCIÓN DE ADN (Delegación Atómica)
        /**
         * 🛡️ LEY ZENITH: Utilizamos inyección condicional para evitar
         * pasar 'undefined' a átomos que esperan valores definidos.
         */
        const rawPayloadSnapshot = BuildPublicReactionPayload(
          targetEntityIdentifier,
          polarityNumeric,
          activeCitizenIdentitySnapshot,
          emoticonIntentionLiteral,
        );

        // 3. PROCESAMIENTO Y PONDERACIÓN (Aduana Zod e Identidad)
        /**
         * Transforma la interacción cruda en un rastro con peso bayesiano.
         */
        const validatedReactionSnapshot = await ProcessPublicReactionTransaction(
          rawPayloadSnapshot,
          activeCitizenIdentitySnapshot,
        );

        // 4. TRIAJE DE RESILIENCIA SRE (Cloud Sovereign Strategy)
        if (!isNetworkOnlineBoolean) {
          IncrementPendingQueueAction();

          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'REACTION_DEFERRED_OFFLINE',
            correlationIdentifier,
            messageContentLiteral: 'INTERACTION.LOGS.OFFLINE_DEFERRAL',
            semanticIntentTag: 'OFFLINE_STATE_RECOVERY',
            contextMetadataSnapshot: { targetId: targetEntityIdentifier },
          });

          return {
            calculatedImpactWeightNumeric: validatedReactionSnapshot.calculatedImpactWeightNumeric,
          };
        }

        // 5. TRANSMISIÓN FÍSICA (I/O Cloud Delegation)
        /**
         * Ejecuta el despacho hacia el Tier de Datos en la nube.
         */
        await TransmitPublicReactionToCloud(targetApiEndpointLiteral, validatedReactionSnapshot);

        // 6. REPORTE DE ÉXITO OPERACIONAL
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'REACTION_TRANSACTION_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Transacción de reacción pública completada y persistida.',
          semanticIntentTag: 'DATA_LAKE_INGESTION',
        });

        return {
          calculatedImpactWeightNumeric: validatedReactionSnapshot.calculatedImpactWeightNumeric,
        };
      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'REACTION_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el flujo de ejecución de la reacción.',
          contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_FLUJO_DE_REACCION_SOBERANA', {
          originalErrorLiteral: errorDescriptionLiteral,
          entityIdentifier: executionParametersSnapshot.targetEntityIdentifier,
          correlationIdentifier,
        });
      }
    },
  );
};
