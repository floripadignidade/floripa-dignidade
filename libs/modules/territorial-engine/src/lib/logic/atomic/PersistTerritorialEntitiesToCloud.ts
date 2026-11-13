/**
 * @section Territorial Logic - Cloud Persistence Orchestrator
 * @description Orquestador encargado de volcar las entidades territoriales
 * normalizadas hacia el Ledger Soberano en la nube. Coordina la validación de
 * infraestructura, la transformación de ADN para persistencia y el rastro forense.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { GlobalBaseException, InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import type { ITerritorialEntity } from '../../schemas/TerritorialEntity.schema';

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { MapTerritoryToCloudLedger } from './MapTerritoryToCloudLedger';
import { ExecuteTerritorialUpsertAction } from './ExecuteTerritorialUpsertAction';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PERSISTENCE_ENGINE_IDENTIFIER = 'TERRITORIAL_PERSISTENCE_ENGINE';

/**
 * Persiste una colección de entidades territoriales en la infraestructura Cloud-Sovereign.
 * Implementa el patrón "Fail-Fast" garantizando que la infraestructura esté resuelta
 * antes de iniciar la transacción física de datos.
 *
 * @param territorialEntitiesCollection - Lista de entidades purificadas y validadas.
 * @param correlationIdentifier - Identificador único de trazabilidad forense.
 * @returns {Promise<void>} Operación resuelta tras el reconocimiento de la nube.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa.
 */
export const PersistTerritorialEntitiesToCloud = async (
  territorialEntitiesCollection: ITerritorialEntity[],
  correlationIdentifier: string = GenerateCorrelationIdentifier(),
): Promise<void> => {
  return await TraceExecutionTime(
    PERSISTENCE_ENGINE_IDENTIFIER,
    'UPSERT_TERRITORIAL_DATA_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE SOBERANÍA DE HARDWARE (Aduana de Entorno)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const {
          SUPABASE_URL: cloudProviderUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. TRANSFORMACIÓN DE ADN (Delegación Atómica)
        /**
         * Transmutamos el modelo de dominio al esquema físico de persistencia
         * definido en 'migration_master_schema.sql'.
         */
        const cloudPersistencePayloadCollection = territorialEntitiesCollection.map(
          (entitySnapshot) => MapTerritoryToCloudLedger(entitySnapshot),
        );

        // 3. DESPACHO FÍSICO A LA NUBE (Delegación Atómica I/O)
        /**
         * Ejecutamos el volcado masivo en Supabase. El átomo se encarga del
         * protocolo de resolución de duplicados (Upsert).
         */
        await ExecuteTerritorialUpsertAction(
          cloudProviderUrlLiteral,
          cloudSecurityKeySecret,
          cloudPersistencePayloadCollection,
        );

        // 4. REPORTE DE ÉXITO OPERACIONAL (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PERSISTENCE_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'TERRITORIAL_SYNC_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Sincronización territorial consolidada en el Ledger Cloud.',
          contextMetadataSnapshot: {
            synchronizedRecordsQuantity: territorialEntitiesCollection.length,
          },
        });
      } catch (caughtError: unknown) {
        /**
         * @section Gestión de Resiliencia
         * Capturamos el rastro del fallo y lo elevamos a la gramática de excepciones.
         */
        if (caughtError instanceof GlobalBaseException) {
          throw caughtError;
        }

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PERSISTENCE_ENGINE_IDENTIFIER,
          operationCodeLiteral: 'TERRITORIAL_CLOUD_PERSISTENCE_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico al intentar grabar entidades territoriales.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_TERRITORIAL_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          affectedRecordsQuantity: territorialEntitiesCollection.length,
        });
      }
    },
  );
};
