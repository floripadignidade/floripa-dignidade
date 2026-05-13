/**
 * @section Territorial Logic - Batch Processing Atom
 * @description Átomo encargado de la normalización resiliente de colecciones
 * territoriales provenientes del IBGE. Implementa la estrategia "Process-or-Skip",
 * permitiendo que registros individuales corruptos sean auditados sin interrumpir
 * la integridad del lote ni el flujo de sincronización global.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 * SANEADO Zenith: Erradicación total de 'any' (Fix TS @typescript-eslint/no-explicit-any),
 * tipado estricto en el bloque de captura de errores y cumplimiento de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Tipos Nominales (Verbatim Module Syntax - Clean Paths) */
import type {
  ITerritorialEntity,
  TTerritorialTechnicalIdentifier
} from '../../schemas/TerritorialEntity.schema';

import type {
  IIbgeDistrictCollection,
  IIbgeDistrictRawResponse
} from '../../schemas/IbgeTerritorialProtocols.schema';

/* 2. Átomos de Soporte (Internal Swarm) */
import { MapIbgeToTerritorialEntity } from './MapIbgeToTerritorialEntity';

/**
 * @interface IBatchProcessingResult
 * @description Snapshot inmutable del resultado del procesamiento de lote para auditoría.
 */
export interface IBatchProcessingResult {
  /** Colección de entidades que superaron las aduanas de normalización. */
  readonly normalizedEntitiesCollection: ITerritorialEntity[];
  /** Cantidad de registros que fallaron durante la transformación. */
  readonly failedRecordsCountQuantity: number;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'TERRITORIAL_BATCH_PROCESSOR_ATOM';

/**
 * Procesa una colección de distritos del IBGE transformándolos en entidades soberanas.
 * Garantiza que el proceso continúe ante fallos unitarios emitiendo señales de alerta.
 *
 * @param rawIbgeDistrictsCollectionSnapshot - Datos crudos del proveedor externo.
 * @param parentMunicipalityIdentifier - ID de la raíz jerárquica (ej: Florianópolis).
 * @param correlationIdentifier - Identificador de trazabilidad forense.
 * @returns {IBatchProcessingResult} Entidades normalizadas y métricas de fidelidad.
 */
export const ProcessTerritorialBatch = (
  rawIbgeDistrictsCollectionSnapshot: IIbgeDistrictCollection,
  parentMunicipalityIdentifier: TTerritorialTechnicalIdentifier,
  correlationIdentifier: string
): IBatchProcessingResult => {
  const normalizedEntitiesCollection: ITerritorialEntity[] = [];
  let failedRecordsCountQuantity = 0;

  /**
   * @section Ciclo de Normalización Resiliente
   * Iteramos sobre la colección cruda delegando la transformación al mapeador atómico.
   */
  for (const rawDistrictSnapshot of rawIbgeDistrictsCollectionSnapshot) {
    /**
     * 🛡️ LEY SRE: El bloque try/catch asegura que un error en el ADN de un
     * distrito no colapse el proceso de sincronización municipal completo.
     */
    try {
      // 1. DELEGACIÓN AL MAPEADOR ATÓMICO (Swiss-Watch Pattern)
      const mappedEntitySnapshot = MapIbgeToTerritorialEntity(
        rawDistrictSnapshot,
        correlationIdentifier
      );

      // 2. INYECCIÓN DE SOBERANÍA RELACIONAL
      normalizedEntitiesCollection.push({
        ...mappedEntitySnapshot,
        parentTerritoryIdentifier: parentMunicipalityIdentifier
      });

    } catch (caughtMappingError: unknown) {
      failedRecordsCountQuantity++;

      /**
       * 🛡️ SANEADO Zenith: Extracción segura de metadatos.
       * Eliminamos el rastro de 'any' utilizando el contrato 'IIbgeDistrictRawResponse'.
       */
      const typedDistrictSnapshot = rawDistrictSnapshot as IIbgeDistrictRawResponse;
      const errorDescriptionLiteral = caughtMappingError instanceof Error
        ? caughtMappingError.message
        : String(caughtMappingError);

      // 3. REPORTE DE ANOMALÍA INDIVIDUAL (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: ATOM_IDENTIFIER,
        operationCodeLiteral: 'INDIVIDUAL_DISTRICT_MAPPING_FAULT',
        correlationIdentifier,
        messageContentLiteral: 'Error al procesar un distrito específico; el enjambre continúa la operación.',
        contextMetadataSnapshot: {
          errorTraceLiteral: errorDescriptionLiteral,
          sourceDistrictNameLiteral: typedDistrictSnapshot.nome,
          sourceDistrictIdLiteral: typedDistrictSnapshot.id
        }
      });
    }
  }

  return {
    normalizedEntitiesCollection,
    failedRecordsCountQuantity
  };
};
