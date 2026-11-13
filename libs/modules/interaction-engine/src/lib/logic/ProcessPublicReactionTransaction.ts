/**
 * @section Interaction Logic - Public Reaction Processor
 * @description Aparato de lógica atómica encargado de la ingesta, validación y
 * ponderación responsable de las reacciones ciudadanas (ISO 20488).
 * Transforma interacciones crudas en señales de impacto con peso bayesiano
 * basado en la soberanía de la identidad.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Bayesian Weighting.
 * SANEADO Zenith: Sincronización de Identidad (Fix TS2551) e Integridad Forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';
import { PublicReactionSchema } from '../schemas/PublicReaction.schema';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import type { IUserIdentity } from '@floripa-dignidade/identity';
import type { IPublicReaction } from '../schemas/PublicReaction.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const INTERACTION_PROCESSOR_IDENTIFIER = 'INTERACTION_TRANSACTION_PROCESSOR';

/**
 * Procesa una reacción pública, calcula su peso de impacto inmediato
 * y emite señales de trazabilidad forense para el motor de estadísticas.
 *
 * @param unvalidatedReactionPayload - Datos crudos capturados en la interfaz ciudadana.
 * @param activeCitizenIdentitySnapshot - Contexto opcional de la identidad soberana.
 * @returns {Promise<IPublicReaction & { readonly calculatedImpactWeightNumeric: number }>}
 * Reacción purificada con coeficiente de autoridad inyectado.
 * @throws {ValidationException} Si el payload viola el contrato de ADN estructural.
 */
export const ProcessPublicReactionTransaction = async (
  unvalidatedReactionPayload: unknown,
  activeCitizenIdentitySnapshot?: IUserIdentity,
): Promise<IPublicReaction & { readonly calculatedImpactWeightNumeric: number }> => {
  /**
   * Generamos la "Traza de Sangre Digital" que vinculará esta interacción
   * con el rastro de auditoría en el Data Lake.
   */
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    INTERACTION_PROCESSOR_IDENTIFIER,
    'EXECUTE_REACTION_INGESTION_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // 1. ADUANA DE ADN (Security Border Control)
        const validationResult = PublicReactionSchema.safeParse(unvalidatedReactionPayload);

        if (!validationResult.success) {
          throw new ValidationException('INTERACTION_REACTION_ADN_CORRUPTO', {
            structuralIssuesCollection: validationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedReaction: IPublicReaction = validationResult.data;

        // 2. ALGORITMO DE PONDERACIÓN RESPONSABLE (Bayesian Influence)
        /**
         * @section Metodología de Confianza
         * Peso Base Anónimo: 0.1 (Contribución al volumen sin autoridad de decisión).
         * Peso Base Identificado: 1.0 + Coeficiente de Autoridad (Identity SSOT).
         */
        let calculatedImpactWeightNumeric = 0.1;

        if (activeCitizenIdentitySnapshot) {
          const baseAuthorityNumeric = 1.0;
          /**
           * 🛡️ SANEADO Zenith: Uso de la propiedad nominal nivelada en el Juez de Paz.
           * Esto garantiza que el peso sea dinámico según la reputación del ciudadano.
           */
          calculatedImpactWeightNumeric =
            baseAuthorityNumeric + activeCitizenIdentitySnapshot.identityTrustWeightScoreNumeric;
        }

        // 3. REPORTE DE TRAZABILIDAD SRE (Fire-and-forget)
        void EmitTelemetrySignal({
          severityLevel: 'INFO',
          moduleIdentifier: INTERACTION_PROCESSOR_IDENTIFIER,
          operationCode: 'PUBLIC_REACTION_PROCESSED',
          correlationIdentifier,
          message: 'INTERACTION.LOGS.REACTION_RECEIVED',
          contextMetadataSnapshot: {
            targetEntityIdentifier: validatedReaction.targetEntityIdentifier,
            impactWeightNumeric: calculatedImpactWeightNumeric,
            isAnonymousBoolean: !activeCitizenIdentitySnapshot,
            polarityNumeric: validatedReaction.interactionPolarityNumeric,
          },
        });

        /**
         * Retorno del artefacto enriquecido.
         * La inmutabilidad (readonly) es forzada para proteger el bus de datos.
         */
        return {
          ...validatedReaction,
          calculatedImpactWeightNumeric,
        };
      } catch (caughtError: unknown) {
        /**
         * @section Gestión de Resiliencia
         * Propagamos excepciones de validación o re-envolvemos fallos desconocidos.
         */
        if (caughtError instanceof ValidationException) {
          throw caughtError;
        }

        throw new ValidationException('COLLAPSE_IN_REACTION_PROCESSOR', {
          originalErrorLiteral:
            caughtError instanceof Error ? caughtError.message : String(caughtError),
          correlationIdentifier,
        });
      }
    },
  );
};
