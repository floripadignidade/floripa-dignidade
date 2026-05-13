/**
 * @section PMF Engine Logic - Municipality Data Ingestor (Master Orchestrator)
 * @description Orquestador supremo encargado de la ingesta masiva y multi-tenant.
 * Coordina el enjambre de procesadores individuales y genera reportes de fidelidad.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Swant-tenant Architecture.
 * SANEADO Zenith: Atomización completa, eliminación de 'any' e inyección de SRE.
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

/* 1. ADN de Protocolo y Salida */
import { EPublicaApiResponseSchema } from '../../schemas/protocol/EPublicaExpense.schema';
import type { IEPublicaApiResponse } from '../../schemas/protocol/EPublicaExpense.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { ProcessIndividualMunicipalityRecord } from '../atomic/mappers/ProcessIndividualMunicipalityRecord';
import { CalculateIngestionFidelity } from '../atomic/mappers/CalculateIngestionFidelity';
import type { IIngestionFidelityMetrics } from '../atomic/mappers/CalculateIngestionFidelity';

/** Identificador técnico para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MUNICIPALITY_DATA_INGESTOR_MASTER';

/**
 * Ejecuta el procesamiento de un paquete de datos gubernamentales bajo rastro forense.
 * Implementa ejecución concurrente con aislamiento de fallos por registro.
 *
 * @param unvalidatedDataPayloadSnapshot - Objeto JSON crudo del proveedor externo.
 * @param municipalitySlugLiteral - Identificador del inquilino (Tenant/Municipio).
 * @param correlationIdentifier - Identificador de trazabilidad del hilo superior.
 * @returns {Promise<IIngestionFidelityMetrics>} Reporte de fidelidad inmutable.
 */
export const IngestMunicipalityData = async (
  unvalidatedDataPayloadSnapshot: unknown,
  municipalitySlugLiteral: string,
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<IIngestionFidelityMetrics> => {

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    `EXECUTE_SWARM_INGESTION_FOR_${municipalitySlugLiteral.toUpperCase()}`,
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ADN (Batch Validation) ---
        const validationResult = EPublicaApiResponseSchema.safeParse(unvalidatedDataPayloadSnapshot);

        if (!validationResult.success) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'BATCH_DNA_CORRUPTION',
            correlationIdentifier,
            messageContentLiteral: 'El paquete de datos del municipio es ilegible o corrupto.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() }
          });

          throw new ValidationException('CONTRATO_DE_LOTE_PMF_VIOLADO');
        }

        const validatedPayload: IEPublicaApiResponse = validationResult.data;
        const recordsToProcessCollection = validatedPayload.registros;

        // --- FASE 2: DESPACHO AL ENJAMBRE (Concurrent Processing) ---
        /**
         * 🛡️ LEY SRE: Cada registro se delega a un átomo independiente.
         * Promise.all garantiza velocidad, mientras que el átomo gestiona sus propios errores.
         */
        const swarmExecutionPromises = recordsToProcessCollection.map((rawRecord) =>
          ProcessIndividualMunicipalityRecord({
            rawRecordSnapshot: rawRecord,
            tenantMunicipalitySlugLiteral: municipalitySlugLiteral,
            correlationIdentifier
          })
        );

        const resultsCollection = await Promise.all(swarmExecutionPromises);

        // --- FASE 3: CONSOLIDACIÓN DE FIDELIDAD (Metrics) ---
        const fidelityMetricsSnapshot = CalculateIngestionFidelity(resultsCollection);

        // --- FASE 4: REPORTE DE ESTADO FINAL (Visibility) ---
        const hasLowFidelityBoolean = fidelityMetricsSnapshot.fidelityPercentageNumeric < 90;

        void EmitTelemetrySignal({
          severityLevelLiteral: hasLowFidelityBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'BATCH_INGESTION_CONSOLIDATED',
          correlationIdentifier,
          messageContentLiteral: 'Ingesta municipal finalizada con auditoría de fidelidad.',
          semanticIntentTag: 'MUNICIPALITY_INGESTION_REPORT',
          contextMetadataSnapshot: {
            ...fidelityMetricsSnapshot,
            tenantMunicipalityLiteral: municipalitySlugLiteral
          }
        });

        return fidelityMetricsSnapshot;

      } catch (caughtError: unknown) {
        // --- FASE 5: GESTIÓN DE COLAPSO CATASTRÓFICO ---
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        throw new InternalSystemException('COLAPSO_EN_MOTOR_DE_INGESTA_MUNICIPAL_SRE', {
          originalError: errorDescriptionLiteral,
          tenant: municipalitySlugLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
