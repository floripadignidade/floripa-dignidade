/**
 * @section Reputation Engine - Evaluation Submission Orchestrator (Master)
 * @description Orquestador supremo que coordina el enjambre de átomos para
 * la ingesta y auditoría ética de evaluaciones ciudadanas.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Atomic Swarm Intelligence.
 * SANEADO Zenith: Pulverización total, independencia funcional, y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GenerateCorrelationIdentifier, TraceExecutionTime } from '@floripa-dignidade/telemetry';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Clean Paths) */
import type { IPublicEvaluationSubmissionResult } from './atomic/schemas/ProcessPublicEvaluationSubmission.schema';

/* 2. Enjambre Atómico (Swarm Logic) */
import { ValidatePublicEvaluationAduana } from './atomic/ValidatePublicEvaluationAduana';
import { ExecuteVeracityAuditStep } from './atomic/ExecuteVeracityAuditStep';
import { SealSubmissionResult } from './atomic/SealSubmissionResult';
import { ReportReputationSubmissionOutcome } from './atomic/ReportReputationSubmissionOutcome';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'REPUTATION_INGESTION_ORCHESTRATOR';

/**
 * Orquestador principal: Ejecuta la Sincronización del Enjambre de Ingesta.
 */
export const ProcessPublicEvaluationSubmission = async (
  rawEvaluationPayloadSnapshot: unknown,
): Promise<IPublicEvaluationSubmissionResult> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_COMPREHENSIVE_INGESTION_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: VALIDACIÓN ESTRUCTURAL ---
        const validatedPulseSnapshot = ValidatePublicEvaluationAduana(
          rawEvaluationPayloadSnapshot,
          correlationIdentifier,
        );

        // --- FASE 2: INFERENCIA COGNITIVA ---
        const veracityAuditMetadata = await ExecuteVeracityAuditStep(
          validatedPulseSnapshot,
          correlationIdentifier,
        );

        // --- FASE 3: SELLADO DEL ARTEFACTO ---
        const finalSubmissionResultSnapshot = SealSubmissionResult({
          validatedPulseSnapshot,
          veracityAuditMetadata,
          correlationIdentifier,
        });

        // --- FASE 4: REPORTE DE CIERRE ---
        ReportReputationSubmissionOutcome({
          validatedPulseSnapshot,
          veracityAuditMetadata,
          correlationIdentifier,
        });

        return finalSubmissionResultSnapshot;
      } catch (caughtError: unknown) {
        // --- FASE 5: GESTIÓN DE RESILIENCIA ---
        if (caughtError instanceof ValidationException) throw caughtError;

        throw new InternalSystemException('FALLO_EN_PROCESAMIENTO_DE_REPUTACION_SRE', {
          originalErrorLiteral:
            caughtError instanceof Error ? caughtError.message : 'UNKNOWN_FAULT',
          correlationIdentifier,
        });
      }
    },
  );
};
