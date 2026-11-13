/**
 * @section User Management & Identity - Identity Logic Orchestrators
 * @description Orquestador encargado de la persistencia de los coeficientes de confianza
 * institucional en el almacén de datos (Supabase Ledger). Coordina la secuencia de integridad:
 * Validación de ADN -> Blindaje de Privacidad (LGPD) -> Resolución de
 * Infraestructura -> Mapeo Físico -> Transmisión Cloud Stateless.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad, Privacidad y Confiabilidad).
 *
 * SANEADO Zenith:
 * 1. Purgado de variables y tipos no utilizados (GenerateCorrelationIdentifier, IIdentityAuthorityResult).
 * 2. Erradicación de extensiones sintéticas .js a favor de Rutas Limpias (Extensionless).
 * 3. Migración a 'MaskCitizenIdentity' y 'ValidateEnvironmentContract' (Cero Metáforas).
 * 4. Tipado nominal de 'ModuleIdentifier' y 'OperationCode' en telemetría forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import { MaskCitizenIdentity } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  type ISynchronizeIdentityAuthorityParameters,
  SynchronizeIdentityAuthoritySchema,
} from '@floripa-dignidade/contracts';

/* 2. Enjambre Atómico Local (Rutas Limpias - Extensionless) */
import { MapIdentityAuthorityToPhysicalRecord } from './atomic/MapIdentityAuthorityToPhysicalRecord';
import { TransmitIdentityAuthorityLedgerPatch } from './atomic/TransmitIdentityAuthorityLedgerPatch';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_IDENTIFIER = 'IDENTITY_AUTHORITY_SYNC_ORCHESTRATOR' as ModuleIdentifier;

/**
 * Ejecuta la transacción íntegra de sincronización de autoridad en la infraestructura cloud.
 * Implementa el patrón "Multi-tenant Governance" garantizando la segregación de datos.
 *
 * @param parametersSnapshot - Snapshot inmutable conteniendo la identidad, el resultado y la organización.
 * @returns {Promise<void>} Promesa que resuelve una vez persistida la mutación en el Ledger.
 * @throws {ValidationException} Si el contrato de parámetros de sincronización es violado.
 * @throws {InternalSystemException} Si el Tier de Datos cloud rechaza la actualización.
 */
export const SynchronizeIdentityAuthority = async (
  parametersSnapshot: ISynchronizeIdentityAuthorityParameters,
): Promise<void> => {
  const { identityIdentifier, correlationIdentifier } = parametersSnapshot;

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_IDENTITY_SYNC_PIPELINE' as OperationCode,
    correlationIdentifier,
    async (): Promise<void> => {
      // --- FASE 0: PROTECCIÓN DE PRIVACIDAD CIUDADANA (LGPD Shield) ---
      const maskedUserIdentityLiteral = await MaskCitizenIdentity({
        rawIdentityLiteral: identityIdentifier as string,
        maskingStrategyLiteral: 'CITIZEN_NAME',
      });

      try {
        // --- FASE 1: AUDITORÍA DE INTEGRIDAD ESTRUCTURAL (Aduana de ADN) ---
        const parametersValidationResult =
          SynchronizeIdentityAuthoritySchema.safeParse(parametersSnapshot);

        if (!parametersValidationResult.success) {
          throw new ValidationException('IDENTITY_SYNC_CONTRACT_VIOLATION', {
            validationIssuesCollection: parametersValidationResult.error.flatten(),
            correlationIdentifier,
          });
        }

        const { authorityResultSnapshot, organizationIdentifier } = parametersValidationResult.data;

        // --- FASE 2: RESOLUCIÓN DE INFRAESTRUCTURA CLOUD ---
        const infrastructureSecretsSnapshot = await ValidateEnvironmentContract();

        // --- FASE 3: MAPEO AL ESQUEMA FÍSICO DE BASE DE DATOS ---
        const physicalRecordSnapshot = MapIdentityAuthorityToPhysicalRecord(
          authorityResultSnapshot,
          correlationIdentifier,
        );

        // --- FASE 4: DESPACHO FÍSICO STATELESS (Supabase PostgREST) ---
        await TransmitIdentityAuthorityLedgerPatch({
          primaryCloudUrlLiteral: infrastructureSecretsSnapshot.SUPABASE_URL,
          cloudSecurityKeySecret: infrastructureSecretsSnapshot.SUPABASE_SERVICE_ROLE_KEY,
          identityIdentifierLiteral: identityIdentifier as string,
          ledgerRecordSnapshot: physicalRecordSnapshot,
        });

        // --- FASE 5: REPORTE DE TELEMETRÍA FORENSE (Visibilidad Operativa) ---
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IDENTITY_SYNC_NOMINAL_SUCCESS' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Sincronización de autoridad institucional consolidada en el Ledger.',
          semanticIntentTag: 'DATA_LAKE_SYNC_SUCCESS',
          contextMetadataSnapshot: {
            identityMaskLiteral: maskedUserIdentityLiteral,
            organizationIdentifier,
            trustScoreNumeric: authorityResultSnapshot.authorityCoefficientNumeric,
          },
        });
      } catch (caughtExecutionError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE FALLO (Resilience Layer) ---
        if (
          caughtExecutionError instanceof ValidationException ||
          caughtExecutionError instanceof InternalSystemException
        ) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : 'UNKNOWN_ORCHESTRATION_FAULT';

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'IDENTITY_SYNC_CRITICAL_FAILURE' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo catastrófico al intentar sincronizar autoridad en el Ledger.',
          semanticIntentTag: 'INFRASTRUCTURE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            identityMaskLiteral: maskedUserIdentityLiteral,
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
