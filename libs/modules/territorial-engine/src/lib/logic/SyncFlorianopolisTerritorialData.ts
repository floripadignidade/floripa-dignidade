/**
 * @section Territorial Logic - Florianópolis Synchronization Orchestrator
 * @description Orquestador superior encargado de la actualización de la base
 * maestra de territorios. Coordina el flujo: Fetch (IBGE) -> Map (Normalización)
 * -> Persist (Cloud Storage). Implementa resiliencia de lote y rastro de jerarquía.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Forensic Traceability.
 * SANEADO Zenith: Erradicación de 'any' mediante casting nominal y optimización de rastro.
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
import type {
  ITerritorialEntity,
  TTerritorialTechnicalIdentifier
} from '../schemas/TerritorialEntity.schema';

/* 2. Enjambre Atómico de Ejecución (Functional Swarm) */
import { FetchIbgeDistricts } from './atomic/FetchIbgeDistricts';
import { MapIbgeToTerritorialEntity } from './atomic/MapIbgeToTerritorialEntity';
import { PersistTerritorialEntitiesToCloud } from './atomic/PersistTerritorialEntitiesToCloud';

/** Identificador técnico del orquestador para el Neural Sentinel. */
const TERRITORIAL_ORCHESTRATOR_IDENTIFIER = 'TERRITORIAL_SYNC_ORCHESTRATOR';

/**
 * Identificador físico del Municipio de Florianópolis (IBGE).
 * Actúa como la raíz jerárquica para todos los distritos capturados.
 * 🛡️ SANEADO Zenith: El valor se mantiene como constante literal.
 */
const FLORIANOPOLIS_MUNICIPALITY_ID = '4205407';

/**
 * Ejecuta el ciclo completo de sincronización territorial de la capital.
 * Garantiza la integridad del Ledger geográfico mediante el patrón "Process-or-Skip".
 *
 * @returns {Promise<void>} Operación resuelta tras el volcado exitoso en la nube.
 * @throws {InternalSystemException} Si el fallo es estructural y no permite la continuidad.
 */
export const SyncFlorianopolisTerritorialData = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    TERRITORIAL_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FULL_TERRITORIAL_SYNC_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // FASE 1: CAPTURA (Extracción desde el IBGE)
        const rawIbgeDistrictsCollection = await FetchIbgeDistricts(correlationIdentifier);

        // FASE 2: NORMALIZACIÓN Y JERARQUÍA (Enjambre Resiliente)
        /**
         * @section Estrategia de Tolerancia a Fallos
         * Procesamos cada distrito individualmente. Si uno falla, se reporta pero
         * el enjambre continúa procesando el resto para asegurar la disponibilidad.
         */
        const normalizedTerritorialEntitiesCollection: ITerritorialEntity[] = [];
        let failedRecordsCountQuantity = 0;

        for (const rawDistrictSnapshot of rawIbgeDistrictsCollection) {
          try {
            const mappedEntity = MapIbgeToTerritorialEntity(rawDistrictSnapshot);

            /**
             * 🛡️ SANEADO Zenith: Inyección de Soberanía Relacional.
             * ERRADICADO 'any': Se utiliza el tipo nominal TTerritorialTechnicalIdentifier
             * para garantizar la integridad del rastro de parentesco en el Grafo.
             */
            normalizedTerritorialEntitiesCollection.push({
              ...mappedEntity,
              parentTerritoryIdentifier: FLORIANOPOLIS_MUNICIPALITY_ID as TTerritorialTechnicalIdentifier
            });

          } catch (caughtMappingError: unknown) {
            failedRecordsCountQuantity++;

            // REPORTE DE ANOMALÍA INDIVIDUAL (SRE Visibility)
            void EmitTelemetrySignal({
              severityLevelLiteral: 'WARNING',
              moduleIdentifierLiteral: TERRITORIAL_ORCHESTRATOR_IDENTIFIER,
              operationCodeLiteral: 'INDIVIDUAL_DISTRICT_MAPPING_FAULT',
              correlationIdentifier,
              messageContentLiteral: 'Error al procesar un distrito específico; el enjambre continúa.',
              contextMetadataSnapshot: {
                errorTraceLiteral: caughtMappingError instanceof Error ? caughtMappingError.message : String(caughtMappingError)
              }
            });
          }
        }

        // FASE 3: PERSISTENCIA (Volcado Inmutable en Supabase)
        if (normalizedTerritorialEntitiesCollection.length > 0) {
          await PersistTerritorialEntitiesToCloud(
            normalizedTerritorialEntitiesCollection,
            correlationIdentifier
          );
        }

        // FASE 4: REPORTE DE CIERRE Y MÉTRICAS (SRE Analytics)
        const isPartiallySuccessfulBoolean = failedRecordsCountQuantity > 0;

        void EmitTelemetrySignal({
          severityLevelLiteral: isPartiallySuccessfulBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: TERRITORIAL_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: isPartiallySuccessfulBoolean ? 'SYNC_PARTIALLY_COMPLETED' : 'SYNC_NOMINAL_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'TERRITORIAL.LOGS.SYNC_NOMINAL',
          contextMetadataSnapshot: {
            totalAttemptedQuantity: rawIbgeDistrictsCollection.length,
            successfulRecordsQuantity: normalizedTerritorialEntitiesCollection.length,
            failedRecordsQuantity: failedRecordsCountQuantity,
            targetMunicipalityLiteral: 'FLORIANÓPOLIS',
            hierarchyLevelLiteral: 'DISTRICT'
          }
        });

      } catch (caughtError: unknown) {
        /**
         * @section Gestión de Colapso de Pipeline
         * Si falla el enlace con el IBGE o la nube, la operación es nula.
         */
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: TERRITORIAL_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'TERRITORIAL_SYNC_CRITICAL_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la sincronización territorial.',
          contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral }
        });

        throw new InternalSystemException('COLAPSO_EN_PIPELINE_DE_SINCRONIZACION_TERRITORIAL', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
