/**
 * @section Financial Ingestion - Cloud Persistence Orchestrator
 * @description Orquestador soberano encargado de coordinar el volcado de datos
 * financieros hacia el Data Lake institucional. Une los átomos de mapeo y
 * transmisión física bajo rastro de telemetría y vigilancia SRE.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de paradoja asíncrona y soporte para colecciones inmutables (Fix Lint).
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

/* 1. ADN de Entrada (Public Contracts) */
import type { IProjectFinancialRecord } from '../../schemas/ProjectFinancialLedger.schema';

/* 2. Enjambre Atómico Local (Atoms Swarm) */
import { MapFinancialRecordsToLedger } from '../atoms/MapFinancialRecordsToLedger';
import { TransmitFinancialBatch } from '../atoms/TransmitFinancialBatch';

/** Identificador técnico del motor para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'FINANCIAL_PERSISTENCE_ORCHESTRATOR';

/**
 * Ejecuta la transacción íntegra de volcado financiero hacia el Data Lake.
 * Coordina la transformación de protocolos y la seguridad de red.
 *
 * @param financialRecordsCollection - Lista de registros purificados (Inmutable).
 * @param correlationIdentifier - Identificador para la trazabilidad forense del proceso.
 * @returns {Promise<void>} Operación resuelta cuando los datos son inmutables en la nube.
 * @throws {InternalSystemException} Si la infraestructura rechaza la conexión o el ADN es impuro.
 */
export const PersistFinancialLedgerToCloud = async (
  /**
   * 🛡️ SANEADO Zenith: Uso de 'readonly' para permitir el flujo directo desde
   * la aduana de extracción, erradicando la necesidad de 'any' en el consumidor.
   */
  financialRecordsCollection: readonly IProjectFinancialRecord[],
  correlationIdentifier: string = GenerateCorrelationIdentifier()
): Promise<void> => {

  /**
   * @section Captura de Soberanía Cloud (Hardware Isolation)
   * 🛡️ SANEADO Zenith: Se añade 'await' mandatorio para resolver el contrato de secretos.
   */
  const {
    SUPABASE_URL: cloudUrlLiteral,
    SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
  } = await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_LEDGER_PERSISTENCE_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // 1. TRANSFORMACIÓN DE ADN (Traducción de Protocolo)
        /** Delegamos en el átomo mapeador para obtener el esquema 'snake_case' físico. */
        const ledgerPayloadCollection = MapFinancialRecordsToLedger(
          financialRecordsCollection,
          correlationIdentifier
        );

        // 2. DESPACHO FÍSICO (Cloud I/O)
        /**
         * Ejecutamos la transmisión masiva hacia Supabase.
         * El átomo se encarga de la política de Upsert e Idempotencia.
         */
        await TransmitFinancialBatch({
          cloudUrlLiteral,
          cloudSecurityKeySecret,
          ledgerPayloadCollection,
        });

        // 3. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FINANCIAL_INGESTION_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Presupuesto institucional sincronizado exitosamente con el Ledger Cloud.',
          contextMetadataSnapshot: {
            synchronizedRecordsQuantity: financialRecordsCollection.length,
            targetTableLiteral: 'project_financial_ledger'
          }
        });

      } catch (caughtError: unknown) {
        // 4. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'FINANCIAL_PERSISTENCE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico al intentar grabar la matriz financiera en la nube.',
          contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral }
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_FINANCIERA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          affectedRecordsQuantity: financialRecordsCollection.length
        });
      }
    }
  );
};
