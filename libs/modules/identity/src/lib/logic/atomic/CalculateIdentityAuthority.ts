/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Orquestador encargado de computar la autoridad institucional mediante
 * el cruzamiento de bonificaciones, antigüedad y estatus legal. Implementa la
 * metodología de ponderación responsable (Bayesian Weighting) para el motor de impacto.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Mantenibilidad, Estabilidad y Performance).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import {
  IdentityAuthorityAuditSchema,
  IdentityAuthorityResultSchema,
} from '@floripa-dignidade/contracts';

import type {
  IIdentityAuthorityAuditParameters,
  IIdentityAuthorityResult,
} from '@floripa-dignidade/contracts';

/* 2. INFRAESTRUCTURA Y ENJAMBRE ATÓMICO (Internal Swarm - Clean Paths) */
import { AUTHORITY_WEIGHT_GROUND_TRUTH } from '../../constants/AuthorityWeightGroundTruth.js';
import { CalculateIdentitySeniorityBonus } from './CalculateIdentitySeniorityBonus.js';
import { MapIdentityAuthorityBonuses } from './MapIdentityAuthorityBonuses.js';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const ENGINE_IDENTIFIER = 'IDENTITY_AUTHORITY_CALCULATOR_ORCHESTRATOR';

/**
 * Ejecuta el cálculo integral de la autoridad del usuario.
 * Coordina el enjambre de átomos de cálculo para generar un coeficiente inmutable.
 *
 * @param parametersSnapshot - Snapshot de datos de identidad para auditar.
 * @returns {Promise<IIdentityAuthorityResult>} Coeficiente de autoridad validado.
 *
 * @prompt_ia: "Verifica que el 'authorityCoefficientNumeric' resultante sea siempre
 * un valor normalizado entre 0.1 y 1.0 para prevenir sesgos en el motor de impacto."
 */
export const CalculateIdentityAuthority = async (
  parametersSnapshot: IIdentityAuthorityAuditParameters,
): Promise<IIdentityAuthorityResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ENGINE_IDENTIFIER,
    'EXECUTE_AUTHORITY_WEIGHT_COMPUTATION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: INTEGRITY GUARD (Validación de ADN de entrada) ---
        const aduanaValidationResult = IdentityAuthorityAuditSchema.safeParse(parametersSnapshot);

        if (!aduanaValidationResult.success) {
          throw new ValidationException('AUTHORITY_AUDIT_DNA_CORRUPTED', {
            validationIssuesCollection: aduanaValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const validatedIdentitySnapshot = aduanaValidationResult.data;

        // --- FASE 2: CÁLCULO DE BONIFICACIONES (Swarm Delegation) ---
        let currentAuthorityScoreNumeric =
          AUTHORITY_WEIGHT_GROUND_TRUTH.BASE_ANONYMOUS_TRUST_WEIGHT_NUMERIC;

        currentAuthorityScoreNumeric += MapIdentityAuthorityBonuses({
          socialProviderIdentifier: validatedIdentitySnapshot.socialProviderIdentifier,
          isIdentityLegallyVerifiedBoolean:
            validatedIdentitySnapshot.isIdentityLegallyVerifiedBoolean,
        });

        // --- FASE 3: CÁLCULO DE ANTIGÜEDAD (Hardware Context) ---
        const { seniorityBonusNumeric, daysSinceActivationQuantity } =
          CalculateIdentitySeniorityBonus(validatedIdentitySnapshot.occurrenceTimestampISO);

        currentAuthorityScoreNumeric += seniorityBonusNumeric;

        // --- FASE 4: NORMALIZACIÓN Y SELLADO ---
        /** 🛡️ LEY ZENITH: El coeficiente nunca debe superar el teto de 1.0 (100%). */
        const finalCoefficientNumeric = Math.min(
          currentAuthorityScoreNumeric,
          AUTHORITY_WEIGHT_GROUND_TRUTH.MAXIMUM_AUTHORITY_THRESHOLD_NUMERIC,
        );

        const internalCalculationResultSnapshot = Object.freeze({
          authorityCoefficientNumeric: finalCoefficientNumeric,
          daysSinceActivationQuantity,
          isVerifiedHumanBoolean: validatedIdentitySnapshot.isIdentityLegallyVerifiedBoolean,
        });

        // --- FASE 5: POST-COMPUTATION CONTRACT CHECK ---
        const purifiedAuthorityResultSnapshot = IdentityAuthorityResultSchema.parse(
          internalCalculationResultSnapshot,
        );

        // --- FASE 6: REPORTE SRE (Visibility) ---
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ENGINE_IDENTIFIER,
          operationCodeLiteral: 'AUTHORITY_COMPUTATION_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Cálculo de autoridad institucional finalizado de forma nominal.',
          semanticIntentTag: 'IDENTITY_TRUST_CALCULATION',
          contextMetadataSnapshot: {
            identityIdentifier: validatedIdentitySnapshot.identityIdentifier,
            finalScoreNumeric: finalCoefficientNumeric,
            daysActiveQuantity: daysSinceActivationQuantity,
          },
        });

        return purifiedAuthorityResultSnapshot;
      } catch (caughtError: unknown) {
        // --- FASE 7: GESTIÓN FORENSE DE COLAPSO ---
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        throw new InternalSystemException('AUTHORITY_ENGINE_CRITICAL_FAULT', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          targetIdentityIdentifier: parametersSnapshot.identityIdentifier,
        });
      }
    },
  );
};
