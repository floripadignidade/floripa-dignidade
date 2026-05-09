/**
 * @section Identity Logic - Identity Authority Orchestrator
 * @description Orquestador atómico encargado de computar la autoridad bayesiana
 * del ciudadano. Consolida bonificaciones sociales, verificación documental
 * y rastro de antigüedad ética en la red.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Sincronización de telemetría inmutable, inyección de
 * inmutabilidad proactiva y cumplimiento estricto de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import {
  CalculateIdentityAuthoritySchema,
  IdentityAuthorityResultSchema,
} from './schemas/CalculateIdentityAuthority.schema';

import type {
  ICalculateIdentityAuthorityParameters,
  IIdentityAuthorityResult,
} from './schemas/CalculateIdentityAuthority.schema';

/* 2. Infraestructura y Enjambre Atómico (Internal Swarm) */
import { AUTHORITY_WEIGHT_GROUND_TRUTH } from '../../constants/AuthorityWeightGroundTruth';
import { CalculateSeniorityBonus } from './CalculateSeniorityBonus';
import { MapAuthorityBonuses } from './MapAuthorityBonuses';

/** Identificador técnico del aparato para el Neural Sentinel. */
const AUTHORITY_ENGINE_IDENTIFIER = 'IDENTITY_AUTHORITY_CALCULATOR_ORCHESTRATOR';

/**
 * Ejecuta el cálculo integral de la autoridad institucional de una identidad.
 * Implementa la metodología de ponderación responsable para el motor de impacto.
 *
 * @param identitySnapshot - ADN de la identidad capturada para la auditoría.
 * @returns {Promise<IIdentityAuthorityResult>} Resultado validado, auditado e inmutable.
 * @throws {InternalSystemException} Si el cálculo viola el contrato o la infraestructura colapsa.
 */
export const CalculateIdentityAuthority = async (
  identitySnapshot: ICalculateIdentityAuthorityParameters,
): Promise<IIdentityAuthorityResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    AUTHORITY_ENGINE_IDENTIFIER,
    'EXECUTE_BAYESIAN_AUTHORITY_COMPUTATION',
    correlationIdentifier,
    async () => {
      try {
        // 1. ADUANA DE ENTRADA (Frontera de Integridad)
        const inputValidationResultSnapshot = CalculateIdentityAuthoritySchema.safeParse(identitySnapshot);

        if (!inputValidationResultSnapshot.success) {
          throw new Error('INVALID_IDENTITY_DATA_FOR_CALCULATION');
        }

        const validatedIdentity = inputValidationResultSnapshot.data;

        /**
         * FASE 1: PONTUAÇÃO BASE E BONIFICAÇÕES
         * Iniciamos con el peso anónimo base y delegamos el cálculo de beneficios
         * al átomo de mapeo de bonos (Social/Legal).
         */
        let currentAuthorityScoreNumeric = AUTHORITY_WEIGHT_GROUND_TRUTH.BASE_ANONYMOUS_TRUST_WEIGHT_NUMERIC;

        currentAuthorityScoreNumeric += MapAuthorityBonuses({
          socialProviderIdentifier: validatedIdentity.socialProviderIdentifier,
          isIdentityLegallyVerifiedBoolean: validatedIdentity.isIdentityLegallyVerifiedBoolean,
        });

        /**
         * FASE 2: CÁLCULO DE ANTIGUIDADE (Seniority Bonus)
         * Delegamos la aritmética temporal al átomo especializado para mantener SRP.
         */
        const { daysSinceActivationQuantity, seniorityBonusNumeric } = CalculateSeniorityBonus(
          validatedIdentity.occurrenceTimestampISO,
        );

        currentAuthorityScoreNumeric += seniorityBonusNumeric;

        /**
         * FASE 3: NORMALIZAÇÃO ZENITH
         * Garantizamos que el score final se mantenga dentro del rango [0.1, 1.0]
         * cumpliendo con el teto máximo definido en el Ground Truth.
         */
        const finalCoefficientNumeric = Math.min(
          currentAuthorityScoreNumeric,
          AUTHORITY_WEIGHT_GROUND_TRUTH.MAXIMUM_AUTHORITY_THRESHOLD_NUMERIC,
        );

        // 2. ENSAMBLAJE Y SELLADO (Immutable Snapshot)
        const calculationResultSnapshot: IIdentityAuthorityResult = Object.freeze({
          authorityCoefficientNumeric: finalCoefficientNumeric,
          daysSinceActivationQuantity,
          isVerifiedHumanBoolean: validatedIdentity.isIdentityLegallyVerifiedBoolean,
        });

        // 3. ADUANA DE SAÍDA (Validación de Integridad del ADN Resultante)
        const validatedOutput = IdentityAuthorityResultSchema.parse(calculationResultSnapshot);

        // 4. REPORTE DE TELEMETRIA (Audit Trail)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: AUTHORITY_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'AUTHORITY_COMPUTATION_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'IDENTITY.LOGS.AUTHORITY_CALCULATED',
          contextMetadataSnapshot: {
            citizenIdentifierLiteral: validatedIdentity.identityIdentifier,
            finalScoreNumeric: finalCoefficientNumeric,
            activeDaysQuantity: daysSinceActivationQuantity,
            isVerifiedHumanBoolean: validatedIdentity.isIdentityLegallyVerifiedBoolean
          },
        });

        return validatedOutput;

      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: AUTHORITY_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'AUTHORITY_COMPUTATION_FAULT',
          correlationIdentifier,
          messageContentLiteral: `Fallo en el motor de cálculo de autoridad: ${errorDescriptionLiteral}`,
          contextMetadataSnapshot: {
            identitySnapshotIdentifier: identitySnapshot.identityIdentifier
          }
        });

        throw new InternalSystemException('FALLO_EN_MOTOR_DE_AUTORIDAD_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
