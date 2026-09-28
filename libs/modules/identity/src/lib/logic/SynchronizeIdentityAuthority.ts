/**
 * @section User Management & Identity - Identity Logic Orchestrators
 * @description Orquestador encargado de la persistencia de los coeficientes de confianza
 * institucional en el almacén de datos. Coordina la secuencia de integridad:
 * Validación de ADN -> Blindaje de Privacidad (LGPD) -> Resolución de
 * Infraestructura -> Mapeo Físico -> Transmisión Cloud.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad, Privacidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

/**
 * 🛡️ INTEGRIDAD SRE: Sincronización con la utilidad de protección de datos.
 * El alias local 'MaskIdentityData' refuerza el desacoplamiento semántico.
 */
import { MaskSovereignIdentity as MaskIdentityData } from '@floripa-dignidade/shared-utility';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import { SynchronizeIdentityAuthoritySchema } from '@floripa-dignidade/contracts';
import type {
  IIdentityAuthorityResult,
  ISynchronizeIdentityAuthorityParameters
} from '@floripa-dignidade/contracts';

/* 2. ENJAMBRE ATÓMICO LOCAL (Internal Swarm - Clean Paths) */
import { MapIdentityAuthorityToPhysicalRecord } from './atomic/MapIdentityAuthorityToPhysicalRecord.js';
import { TransmitIdentityAuthorityLedgerPatch } from './atomic/TransmitIdentityAuthorityLedgerPatch.js';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const ORCHESTRATOR_IDENTIFIER = 'IDENTITY_AUTHORITY_SYNC_ORCHESTRATOR';

/**
 * Ejecuta la transacción íntegra de sincronización de autoridad en la infraestructura cloud.
 * Implementa el patrón "Multi-tenant Governance" garantizando la segregación de datos.
 *
 * @param parametersSnapshot - Snapshot conteniendo la identidad, el resultado y la organización.
 * @returns {Promise<void>} Operación de persistencia asíncrona resuelta.
 * @throws {ValidationException} Si el contrato de sincronización es violado.
 * @throws {InternalSystemException} Si el Tier de Datos rechaza la actualización.
 *
 * @prompt_ia: "Asegura que el 'organizationIdentifier' sea auditado en el Ledger
 * para certificar que el incremento de autoridad corresponde a la jurisdicción correcta."
 */
export const SynchronizeIdentityAuthority = async (
  parametersSnapshot: ISynchronizeIdentityAuthorityParameters,
): Promise<void> => {
  const { identityIdentifier, correlationIdentifier } = parametersSnapshot;

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_IDENTITY_SYNC_PIPELINE',
    correlationIdentifier,
    async () => {

      // --- FASE 0: PROTECCIÓN DE PRIVACIDAD (PII Shield) ---
      /** 🛡️ LEY ZENITH: El rastro original debe ser anonimizado antes de cualquier transmisión. */
      const maskedUserIdentityLiteral = await MaskIdentityData({
        rawIdentityLiteral: identityIdentifier as string,
        maskingStrategyLiteral: 'CITIZEN_NAME',
      });

      try {
        // --- FASE 1: INTEGRITY CHECK (Aduana de ADN) ---
        const aduanaValidationResult = SynchronizeIdentityAuthoritySchema.safeParse(parametersSnapshot);

        if (!aduanaValidationResult.success) {
          throw new ValidationException('IDENTITY_SYNC_CONTRACT_VIOLATION', {
            validationIssuesCollection: aduanaValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const { authorityResultSnapshot, organizationIdentifier } = aduanaValidationResult.data;

        // --- FASE 2: INFRASTRUCTURE CONTEXT (Resolución de Secretos) ---
        const infrastructureSecretsSnapshot = await ValidateEnvironmentAduana();

        // --- FASE 3: PROTOCOL TRANSLATION (Domain to Physical Mapping) ---
        const physicalRecordSnapshot = MapIdentityAuthorityToPhysicalRecord(
          authorityResultSnapshot,
          correlationIdentifier,
        );

        // --- FASE 4: DISPACHO FÍSICO (Stateless Cloud I/O) ---
        await TransmitIdentityAuthorityLedgerPatch({
          primaryCloudUrlLiteral: infrastructureSecretsSnapshot.SUPABASE_URL,
          cloudSecurityKeySecret: infrastructureSecretsSnapshot.SUPABASE_SERVICE_ROLE_KEY,
          identityIdentifierLiteral: identityIdentifier as string,
          ledgerRecordSnapshot: physicalRecordSnapshot,
        });

        // --- FASE 5: REPORTE DE ÉXITO (SRE Visibility) ---
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IDENTITY_SYNC_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'Sincronización de autoridad institucional consolidada.',
          semanticIntentTag: 'DATA_LAKE_SYNC_SUCCESS',
          contextMetadataSnapshot: {
            identityMaskLiteral: maskedUserIdentityLiteral,
            organizationIdentifier,
            trustScoreNumeric: authorityResultSnapshot.authorityCoefficientNumeric,
          },
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
          operationCodeLiteral: 'IDENTITY_SYNC_CRITICAL_FAILURE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico al intentar sincronizar autoridad en el Ledger.',
          semanticIntentTag: 'INFRASTRUCTURE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            identityMaskLiteral: maskedUserIdentityLiteral
          },
        });

        throw new InternalSystemException('IDENTITY_SYNC_ORCHESTRATOR_FAULT', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
