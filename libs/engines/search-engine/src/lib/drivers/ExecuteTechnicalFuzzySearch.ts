/**
 * @section Discovery Drivers - Fuse.js Implementation
 * @description Ejecuta el algoritmo de búsqueda difusa sobre una colección inmutable.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Erradicación de TS7006, PascalCase e integración telemétrica.
 *
 * @author Raz Podestá - MetaShark Tech
 */

import Fuse from 'fuse.js';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. ADN Estructural y Configuración */
import type { ISearchableEntity } from '../schemas/SearchEngine.schema';
import { GLOBAL_FUSE_CONFIGURATION_OPTIONS } from '../constants/SearchEngineConfiguration';

/** Identificador técnico del aparato para el Neural Sentinel. */
const DRIVER_IDENTIFIER = 'FUSE_SEARCH_DRIVER_ATOM';

/**
 * @interface IFuseMatchResult
 * @description Representación técnica de un hallazgo del motor Fuse.js.
 * 🛡️ SANEADO Zenith: Resuelve el error TS7006 inyectando el contrato de tipo.
 */
interface IFuseMatchResult {
  readonly item: ISearchableEntity;
  readonly score?: number;
}

/**
 * Ejecuta la búsqueda técnica purificada sobre el universo de datos.
 *
 * @param searchQueryLiteral - Término de búsqueda ingresado.
 * @param searchableEntityCollection - Colección de entidades autorizadas.
 * @returns {ISearchableEntity[]} Hallazgos ordenados por relevancia.
 */
export const ExecuteTechnicalFuzzySearch = async (
  searchQueryLiteral: string,
  searchableEntityCollection: ISearchableEntity[]
): Promise<ISearchableEntity[]> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. FILTRO DE ATOMICIDAD (Return Early)
  if (!searchQueryLiteral.trim()) {
    return [];
  }

  return await TraceExecutionTime(
    DRIVER_IDENTIFIER,
    'EXECUTE_FUZZY_ALGORITHM_COMPUTATION',
    correlationIdentifier,
    async () => {
      /**
       * 2. INSTANCIACIÓN DEL MOTOR
       * Utilizamos el tipo genérico <ISearchableEntity> para asegurar
       * que el motor de búsqueda sea Type-Safe desde la construcción.
       */
      const discoveryEngineInstance = new Fuse<ISearchableEntity>(
        searchableEntityCollection,
        GLOBAL_FUSE_CONFIGURATION_OPTIONS
      );

      // 3. EJECUCIÓN DEL ALGORITMO
      const rawMatchResultsCollection = discoveryEngineInstance.search(searchQueryLiteral);

      // 4. REPORTE DE ESTADO (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: DRIVER_IDENTIFIER,
        operationCodeLiteral: 'FUZZY_MATCH_COMPLETED',
        correlationIdentifier,
        messageContentLiteral: `Búsqueda ejecutada. Hallazgos:[${rawMatchResultsCollection.length}]`,
        contextMetadataSnapshot: {
          queryLengthQuantity: searchQueryLiteral.length,
          resultsCountQuantity: rawMatchResultsCollection.length
        }
      });

      /**
       * 5. EXTRACCIÓN DE RESULTADOS (Clean Mapping)
       * SANEADO Zenith: Tipado explícito de la captura para eliminar el rastro de 'any'.
       */
      return rawMatchResultsCollection.map((matchResultSnapshot: IFuseMatchResult) => {
        return matchResultSnapshot.item;
      });
    }
  );
};
