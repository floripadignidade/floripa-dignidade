/**
 * @section Territorial Logic - Florianópolis Synchronization Orchestrator (Master)
 * @description Orquestador supremo encargado de la actualización de la base maestra
 * de territorios. Coordina el enjambre de átomos para la captura (IBGE),
 * normalización resiliente y persistencia cloud (Supabase).
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Reducción drástica de complejidad ciclomática (< 5),
 * cumplimiento de Prosa ISO (Zero Abbreviations) y Rutas Limpias.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Tipos Nominales (Verbatim Module Syntax) */
import type { TTerritorialTechnicalIdentifier } from '../schemas/TerritorialEntity.schema';

/* 2. Enjambre Atómico de Ejecución (Internal Swarm - Clean Paths) */
import { FetchIbgeDistricts } from './atomic/FetchIbgeDistricts';
import { ProcessTerritorialBatch } from './atomic/ProcessTerritorialBatch';
import { PersistTerritorialEntitiesToCloud } from './atomic/PersistTerritorialEntitiesToCloud';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'TERRITORIAL_SYNC_ORCHESTRATOR';

/**
 * Identificador físico del Municipio de Florianópolis según el IBGE.
 * 🛡️ SANEADO Zenith: Sellado de marca nominal para integridad del Grafo.
 */
const FLORIANOPOLIS_MUNICIPALITY_ID = '4205407' as TTerritorialTechnicalIdentifier;

/**
 * Ejecuta el ciclo completo de sincronización territorial de la capital.
 * Implementa una estrategia de despacho coordinado: Fetch -> Swarm Process -> Persist.
 *
 * @returns {Promise<void>} Operación resuelta tras el volcado exitoso en la nube.
 * @throws {InternalSystemException} Si ocurre un colapso catastrófico en el pipeline.
 */
export const SyncFlorianopolisTerritorialData = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_TERRITORIAL_SYNC_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: CAPTURA (I/O Externo) ---
        const rawIbgeDistrictsCollection = await FetchIbgeDistricts(correlationIdentifier);

        // --- FASE 2: PROCESAMIENTO EN ENJAMBRE (Delegación Atómica) ---
        /**
         * Delegamos la iteración y el control de errores individuales al átomo
         * 'ProcessTerritorialBatch', manteniendo este orquestador libre de ramificaciones.
         */
        const { normalizedEntitiesCollection, failedRecordsCountQuantity } =
          ProcessTerritorialBatch(
            rawIbgeDistrictsCollection,
            FLORIANOPOLIS_MUNICIPALITY_ID,
            correlationIdentifier,
          );

        // --- FASE 3: PERSISTENCIA (Cloud Ledger Write) ---
        const hasDataToSyncBoolean = normalizedEntitiesCollection.length > 0;

        if (hasDataToSyncBoolean) {
          await PersistTerritorialEntitiesToCloud(
            normalizedEntitiesCollection,
            correlationIdentifier,
          );
        }

        // --- FASE 4: REPORTE DE CIERRE Y MÉTRICAS SRE (Visibility) ---
        const isPartiallySuccessfulBoolean = failedRecordsCountQuantity > 0;

        void EmitTelemetrySignal({
          severityLevelLiteral: isPartiallySuccessfulBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: isPartiallySuccessfulBoolean
            ? 'SYNC_PARTIALLY_COMPLETED'
            : 'SYNC_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'TERRITORIAL.LOGS.SYNC_NOMINAL',
          semanticIntentTag: 'TERRITORIAL_DATA_SYNC_COMPLETE',
          contextMetadataSnapshot: {
            totalAttemptedQuantity: rawIbgeDistrictsCollection.length,
            successfulRecordsQuantity: normalizedEntitiesCollection.length,
            failedRecordsQuantity: failedRecordsCountQuantity,
            isPersistenceExecutedBoolean: hasDataToSyncBoolean,
          },
        });
      } catch (caughtError: unknown) {
        // --- FASE 5: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : 'UNKNOWN_ORCHESTRATION_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'TERRITORIAL_SYNC_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral:
            'Fallo catastrófico en la orquestación de sincronización territorial.',
          semanticIntentTag: 'INFRASTRUCTURE_PIPELINE_FAULT',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('COLAPSO_EN_PIPELINE_DE_SINCRONIZACION_TERRITORIAL', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
