/**
 * @section PMF Engine Logic - Municipality Expenditure Orchestrator (Master)
 * @description Cerebro de flujo encargado de coordinar la sincronización integral
 * del gasto público. Orquesta el fetch externo, la transformación en enjambre
 * y la auditoría de fidelidad bajo estándares de misión crítica.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Atomización de enjambre concurrente, blindaje de opcionales
 * y cumplimiento de la Prosa ISO (Zero Abbreviations).
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

/* 1. ADN del Dominio y Contratos (Verbatim Module Syntax) */
import type { IPublicExpenditure } from '../../schemas/sovereign/PublicExpenditure.schema';
import { SyncMunicipalityExpenditureSchema } from '../atomic/schemas/SyncMunicipalityExpenditure.schema';
import type { ISyncMunicipalityExpenditureParameters } from '../atomic/schemas/SyncMunicipalityExpenditure.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { FetchRawEPublicaData } from '../atomic/fetchers/FetchRawEPublicaData';
import { CalculateSyncMetrics } from '../atomic/mappers/CalculateSyncMetrics';
import { ExecuteConcurrentRecordMapping } from '../atomic/mappers/ExecuteConcurrentRecordMapping';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const SYNC_ORCHESTRATOR_IDENTIFIER = 'PMF_EXPENDITURE_SYNC_ORCHESTRATOR';

/**
 * Ejecuta la sincronización integral de datos abiertos de un municipio.
 * Implementa el patrón "Cloud Sovereign" garantizando la integridad de la
 * cadena de custodia desde la captura hasta la normalización.
 *
 * @param synchronizationParametersSnapshot - Criterios de búsqueda y filtrado validables.
 * @returns {Promise<IPublicExpenditure[]>} Colección de gastos purificados, firmados y listos para el Ledger.
 * @throws {ValidationException} Si los parámetros violan el contrato de ADN.
 * @throws {InternalSystemException} Si la infraestructura gubernamental o el motor colapsan.
 */
export const SyncMunicipalityExpenditure = async (
  synchronizationParametersSnapshot: ISyncMunicipalityExpenditureParameters,
): Promise<IPublicExpenditure[]> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    SYNC_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_MUNICIPALITY_SYNC_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ENTRADA (Sovereign Validation) ---
        const inputValidationResult = SyncMunicipalityExpenditureSchema.safeParse(
          synchronizationParametersSnapshot
        );

        if (!inputValidationResult.success) {
          throw new ValidationException('ADN_DE_SINCRONIZACION_CORRUPTO', {
            structuralIssuesCollection: inputValidationResult.error.flatten(),
            correlationIdentifier
          });
        }

        const {
          municipalitySlugLiteral,
          periodRange,
          managementUnitTechnicalIdentifier
        } = inputValidationResult.data;

        // --- FASE 2: CAPTURA DE DATOS CRUDOS (External I/O) ---
        /**
         * 🛡️ LEY ZENITH: Inyección condicional para satisfacer 'exactOptionalPropertyTypes'.
         * Asegura que no se transmita 'undefined' al fetcher atómico.
         */
        const rawGovernmentPayloadSnapshot = await FetchRawEPublicaData({
          municipalitySlugLiteral,
          initialPeriodMonthYearLiteral: periodRange.initialMonthYearLiteral,
          finalPeriodMonthYearLiteral: periodRange.finalMonthYearLiteral,
          ...(managementUnitTechnicalIdentifier !== undefined && { managementUnitTechnicalIdentifier }),
        }, correlationIdentifier);

        // --- FASE 3: PROCESAMIENTO EN ENJAMBRE (Concurrent Transformation) ---
        /**
         * Delegamos la ejecución paralela al átomo especializado para mantener el orquestador limpio.
         */
        const swarmResultsCollection = await ExecuteConcurrentRecordMapping({
          rawRecordsCollection: rawGovernmentPayloadSnapshot.registros,
          municipalitySlugLiteral,
          correlationIdentifier
        });

        // --- FASE 4: AUDITORÍA DE FIDELIDAD (Metrics) ---
        const syncMetricsSnapshot = CalculateSyncMetrics(swarmResultsCollection);

        // --- FASE 5: REPORTE DE CIERRE ZENITH (SRE Visibility) ---
        void EmitTelemetrySignal({
          severityLevelLiteral: syncMetricsSnapshot.failedRecordsQuantity > 0 ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: SYNC_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'SYNC_PROCESS_NOMINAL_COMPLETED',
          correlationIdentifier,
          messageContentLiteral: 'PMF_ENGINE.LOGS.SYNC_SUCCESS',
          semanticIntentTag: 'MUNICIPALITY_OPEN_DATA_SYNC',
          contextMetadataSnapshot: {
            ...syncMetricsSnapshot,
            municipalityLiteral: municipalitySlugLiteral,
            executionTimestampISO: new Date().toISOString()
          },
        });

        /** Retornamos exclusivamente los registros que superaron todas las aduanas de ADN. */
        return swarmResultsCollection.filter(
          (expenditureSnapshot): expenditureSnapshot is IPublicExpenditure => expenditureSnapshot !== null
        );

      } catch (caughtError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---

        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : 'UNKNOWN_SYNC_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: SYNC_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'SYNC_PIPELINE_CATASTROPHIC_FAILURE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de datos abiertos.',
          semanticIntentTag: 'INFRASTRUCTURE_SYNC_FAULT',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_SINCRO_DE_DATOS_PMF_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
