/**
 * @section Identity Logic - Authority Synchronization Orchestrator
 * @description Orquestador supremo encargado de la persistencia del coeficiente de
 * confianza bayesiana en el Ledger institucional. Coordina el flujo: Validación
 * de ADN -> Captura de Infraestructura -> Mapeo Físico -> Transmisión Cloud.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Inyección de TSDocs Enterprise, consolidación del rastro forense
 * en la aduana de infraestructura y blindaje de tipos nominales (Branded Types).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Esquemas (Verbatim Module Syntax - Clean Paths) */
import { SyncIdentityAuthoritySchema } from './atomic/schemas/SyncIdentityAuthority.schema';
import { MapAuthorityToLedgerRecord } from './atomic/MapAuthorityToLedgerRecord';
import { TransmitAuthorityLedgerPatch } from './atomic/TransmitAuthorityLedgerPatch';

import type { UserIdentifier } from '../schemas/UserIdentity.schema';
import type { IIdentityAuthorityResult } from './atomic/schemas/CalculateIdentityAuthority.schema';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'IDENTITY_AUTHORITY_SYNC_ORCHESTRATOR';

/**
 * Ejecuta la transacción íntegra de sincronización de autoridad ciudadana en la nube.
 * Implementa el patrón "Cloud Sovereign" (ADR 0015) garantizando la resolución
 * asíncrona de infraestructura antes de la mutación física en el Ledger.
 *
 * @param citizenIdentifier - UUID sellado nominalmente (Branded) del ciudadano.
 * @param authoritySnapshot - Snapshot inmutable con el coeficiente bayesiano calculado.
 * @param correlationIdentifier - Identificador para la cadena de custodia digital.
 * @returns {Promise<void>} Operación resuelta tras el reconocimiento del Tier de Datos.
 * @throws {ValidationException} Si el rastro de entrada viola el contrato de integridad.
 * @throws {InternalSystemException} Si la infraestructura Cloud rechaza la persistencia.
 */
export const SyncIdentityAuthority = async (
  citizenIdentifier: UserIdentifier,
  authoritySnapshot: IIdentityAuthorityResult,
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<void> => {

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_AUTHORITY_SYNC_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ADN (Pre-flight Validation) ---
        const aduanaValidationResult = SyncIdentityAuthoritySchema.safeParse({
          citizenIdentifier,
          authoritySnapshot,
          correlationIdentifier
        });

        if (!aduanaValidationResult.success) {
          throw new ValidationException('IDENTITY.ERRORS.SYNC_DNA_CORRUPTED', {
            structuralIssuesCollection: aduanaValidationResult.error.flatten(),
            correlationIdentifier
          });
        }

        /**
         * --- FASE 2: CAPTURA DE INFRAESTRUCTURA (Sovereign Context) ---
         * 🛡️ LEY ZENITH: Resolución dentro del Trace para medir costo de hardware.
         */
        const infrastructureSnapshot = await ValidateEnvironmentAduana();

        // --- FASE 3: TRANSFORMACIÓN DE PROTOCOLO (Domain to Physics) ---
        const ledgerRecordSnapshot = MapAuthorityToLedgerRecord(
          authoritySnapshot,
          correlationIdentifier
        );

        // --- FASE 4: DESPACHO FÍSICO (Cloud I/O Delegation) ---
        await TransmitAuthorityLedgerPatch({
          cloudUrlLiteral: infrastructureSnapshot.SUPABASE_URL,
          cloudSecurityKeySecret: infrastructureSnapshot.SUPABASE_SERVICE_ROLE_KEY,
          citizenIdentifierLiteral: citizenIdentifier as string,
          ledgerRecordSnapshot,
        });

        // --- FASE 5: REPORTE DE ÉXITO (SRE Visibility) ---
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'AUTHORITY_SYNC_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'IDENTITY.LOGS.AUTHORITY_SYNC_NOMINAL',
          semanticIntentTag: 'IDENTITY_TRUST_SYNC',
          contextMetadataSnapshot: {
            citizenIdentifier,
            finalTrustWeightScoreNumeric: authoritySnapshot.authorityCoefficientNumeric,
            isVerifiedHumanBoolean: authoritySnapshot.isVerifiedHumanBoolean,
            occurrenceTimestampISO: new Date().toISOString()
          }
        });

      } catch (caughtError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---

        if (caughtError instanceof ValidationException || caughtError instanceof InternalSystemException) {
          throw caughtError;
        }

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : 'UNKNOWN_ORCHESTRATION_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'AUTHORITY_SYNC_CRITICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la persistencia de autoridad bayesiana.',
          semanticIntentTag: 'PERSISTENCE_LAYER_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            targetCitizen: citizenIdentifier
          }
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_AUTORIDAD_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
