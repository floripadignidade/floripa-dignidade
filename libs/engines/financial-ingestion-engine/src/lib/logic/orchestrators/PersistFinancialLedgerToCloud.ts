/**
 * @section Financial Ingestion - Cloud Persistence Orchestrator
 * @description Orquestador supremo encargado de coordinar el volcado de datos
 * financieros hacia el Ledger Institucional. Une los átomos de mapeo y
 * transmisión física bajo rastro de telemetría inalterable y vigilancia SRE.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Inyección de etiquetas ontológicas, rastro i18n y Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Entrada (Verbatim Module Syntax) */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { MapFinancialRecordsToLedger } from '../atoms/MapFinancialRecordsToLedger';
import { TransmitFinancialBatch } from '../atoms/TransmitFinancialBatch';

/** Identificador técnico del motor para el Neural Sentinel. */
const PERSISTENCE_ORCHESTRATOR_IDENTIFIER = 'FINANCIAL_PERSISTENCE_ORCHESTRATOR';

/**
 * Ejecuta la transacción íntegra de volcado financiero hacia el Data Lake.
 * Implementa el patrón "Cloud Sovereign" (ADR 0015) garantizando la resolución
 * asíncrona de infraestructura antes del despacho físico.
 *
 * @param financialRecordsCollection - Lista de registros purificados (Inmutable).
 * @param correlationIdentifier - Identificador para la trazabilidad forense del proceso.
 * @returns {Promise<void>} Operación resuelta cuando los datos son inmutables en la nube.
 * @throws {InternalSystemException} Si la infraestructura rechaza la conexión o el ADN es impuro.
 */
export const PersistFinancialLedgerToCloud = async (
  financialRecordsCollection: readonly IProjectFinancialRecord[],
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<void> => {
  /**
   * @section Captura de Soberanía Cloud (Hardware Isolation)
   * Resolvemos el contrato de secretos inyectados por el motor de infraestructura.
   */
  const { SUPABASE_URL: cloudUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
    await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    PERSISTENCE_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_LEDGER_PERSISTENCE_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // 1. TRANSFORMACIÓN DE ADN (Traducción de Protocolo)
        /**
         * Delegamos en el átomo mapeador para obtener el esquema físico.
         * La inmutabilidad es garantizada por el sello 'Object.freeze' del átomo.
         */
        const ledgerPayloadCollection = MapFinancialRecordsToLedger(
          financialRecordsCollection,
          correlationIdentifier,
        );

        // 2. DESPACHO FÍSICO (Cloud I/O)
        /**
         * Ejecutamos la transmisión masiva hacia Supabase.
         * El átomo TransmitFinancialBatch se encarga de los Timeouts SRE.
         */
        await TransmitFinancialBatch({
          cloudUrlLiteral,
          cloudSecurityKeySecret,
          ledgerPayloadCollection,
        });

        // 3. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FINANCIAL_INGESTION_NOMINAL_SUCCESS',
          correlationIdentifier,
          /** Uso de clave soberana para internacionalización de logs técnicos */
          messageContentLiteral: 'FINANCIAL_INGESTION.LOGS.SYNC_SUCCESS',
          /** Clasificación ontológica para el Neural Sentinel */
          semanticIntentTag: 'DATA_LAKE_SYNCHRONIZATION',
          contextMetadataSnapshot: {
            synchronizedRecordsQuantity: financialRecordsCollection.length,
            targetTableLiteral: 'project_financial_ledger',
          },
        });
      } catch (caughtError: unknown) {
        // 4. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PERSISTENCE_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FINANCIAL_PERSISTENCE_CRITICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'FINANCIAL_INGESTION.ERRORS.PERSISTENCE_FAILURE',
          semanticIntentTag: 'INFRASTRUCTURE_COLLAPSE',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            affectedRecordsQuantity: financialRecordsCollection.length,
          },
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_FINANCIERA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
