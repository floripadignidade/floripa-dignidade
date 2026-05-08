/**
 * @section PMF Engine Logic - Sovereign Persistence Sentry (Orchestrator)
 * @description Orquestador de persistencia encargado de la gestión del ciclo de vida
 * de los registros presupuestarios. Implementa la lógica de "Cero Duplicados"
 * mediante comparación de huellas digitales (Content Hashing) e historización.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Resolución de error TS2339, inyección de Trace y blindaje I/O.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Dominio (Verbatim Module Syntax) */
import type { IPublicExpenditure } from '../../schemas/sovereign/PublicExpenditure.schema';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { CalculateContentSignature } from '../atomic/persistence/CalculateContentSignature';
import { FetchExpenditureState } from '../atomic/persistence/FetchExpenditureState';
import { UpdateExpenditureHeartbeat } from '../atomic/persistence/UpdateExpenditureHeartbeat';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PERSISTENCE_SENTRY_IDENTIFIER = 'SOVEREIGN_PERSISTENCE_SENTRY';

/**
 * Gestiona el guardado inteligente de un gasto público mediante triaje de firmas.
 * Garantiza la soberanía del dato mediante el patrón "Update-on-Mutation".
 *
 * @param publicExpenditurePayload - Gasto normalizado y validado por el motor.
 * @param correlationIdentifier - Identificador de trazabilidad digital cross-module.
 */
export const SovereignPersistenceSentry = async (
  publicExpenditurePayload: IPublicExpenditure,
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<void> => {

  /**
   * 🛡️ SANEADO Zenith: Resolución de TS2339.
   * Se añade 'await' para resolver la promesa de la aduana de infraestructura.
   */
  const {
    SUPABASE_URL: cloudUrlLiteral,
    SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
  } = await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    PERSISTENCE_SENTRY_IDENTIFIER,
    'EXECUTE_SMART_PERSISTENCE_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // 1. GENERACIÓN DE HUELLA DIGITAL (Fingerprint SHA-256)
        /** Creamos una firma basada en los datos técnicos para detectar cambios. */
        const currentContentHashFingerprint = await CalculateContentSignature({
          amount: publicExpenditurePayload.totalExecutedAmountNumeric,
          description: publicExpenditurePayload.serviceDescriptionLiteral,
          provider: publicExpenditurePayload.providerMetadata.taxIdentificationNumber,
          unit: publicExpenditurePayload.managementUnitTechnicalCode
        }, correlationIdentifier);

        // 2. CONSULTA DE ESTADO PREVIO (Sovereign State Check)
        const previousStateSnapshot = await FetchExpenditureState(
          cloudUrlLiteral,
          cloudSecurityKeySecret,
          publicExpenditurePayload.expenditureIdentifier
        );

        // 3. DECISIÓN LÓGICA: ¿Hay mutación real o redundancia gubernamental?
        const isDataIdenticalBoolean = previousStateSnapshot?.contentHash === currentContentHashFingerprint;

        if (isDataIdenticalBoolean) {
          /**
           * CASO A: Registro Idéntico.
           * Refrescamos el pulso de vida (Heartbeat) para confirmar que el gasto
           * sigue vigente en el portal de transparencia sin duplicar datos.
           */
          await UpdateExpenditureHeartbeat(
            cloudUrlLiteral,
            cloudSecurityKeySecret,
            publicExpenditurePayload.expenditureIdentifier
          );
          return;
        }

        /**
         * CASO B: Registro Nuevo o Mutado.
         * Ejecutamos el volcado inmutable hacia el Ledger de transparencia.
         */
        const cloudPersistenceResponse = await fetch(`${cloudUrlLiteral}/rest/v1/territorial_master_data`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'apikey': cloudSecurityKeySecret,
            'Authorization': `Bearer ${cloudSecurityKeySecret}`,
            'Prefer': 'resolution=merge-duplicates'
          },
          body: JSON.stringify({
            ibge_id: publicExpenditurePayload.expenditureIdentifier,
            name_literal: publicExpenditurePayload.governmentTechnicalReferenceLiteral,
            /** Inyectamos el gasto y su nueva huella digital de integridad. */
            metadata_snapshot: {
              ...publicExpenditurePayload,
              contentHash: currentContentHashFingerprint
            },
            last_sync_at: new Date().toISOString()
          }),
          /** SRE: Protección de tiempo de espera en el Edge */
          signal: AbortSignal.timeout(15000)
        });

        if (!cloudPersistenceResponse.ok) {
          throw new Error(`CLOUD_LEDGER_ERROR_${cloudPersistenceResponse.status}`);
        }

        // 4. REPORTE DE SINCRONIZACIÓN NOMINAL (SRE Visibility)
        const operationModeLiteral = previousStateSnapshot ? 'EXPENDITURE_MUTATED' : 'NEW_EXPENDITURE_SAVED';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_SENTRY_IDENTIFIER,
          operationCodeLiteral: operationModeLiteral,
          correlationIdentifier,
          messageContentLiteral: 'Sincronización de gasto público consolidada en el Data Lake.',
          contextMetadataSnapshot: {
            expenditureIdentifierLiteral: publicExpenditurePayload.expenditureIdentifier,
            isMutationBoolean: !!previousStateSnapshot,
            contentHashSnapshot: currentContentHashFingerprint
          }
        });

      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const normalizedException = new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_DATOS_ABIERTOS_SRE', {
          originalErrorLiteral: caughtError instanceof Error ? caughtError.message : String(caughtError),
          expenditureIdentifier: publicExpenditurePayload.expenditureIdentifier,
          correlationIdentifier
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    }
  );
};
