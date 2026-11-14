/**
 * @section Search Engine Drivers - Fuse.js Technical Driver
 * @description Ejecuta la búsqueda difusa en memoria sobre colecciones previamente
 * autorizadas por RBAC. Valida límites de consulta mediante Zod, aplica retorno temprano
 * ante entradas o índices vacíos, mide latencia con `TraceExecutionTime`, normaliza fallos
 * con `InternalSystemException` y emite telemetría SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import Fuse from 'fuse.js';

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { GLOBAL_FUSE_CONFIGURATION_OPTIONS } from '../constants/SearchEngineConfiguration';
import type { ISearchableEntity } from '../schemas/SearchEngine.schema';
import {
  type ITechnicalFuzzySearchOptions,
  TechnicalFuzzySearchOptionsSchema,
} from './schemas/TechnicalFuzzySearch.schema';

export type { ITechnicalFuzzySearchOptions };

const DRIVER_MODULE_IDENTIFIER: ModuleIdentifier =
  ModuleIdentifierSchema.parse('FUSE_SEARCH_DRIVER_ATOM');

const FUZZY_COMPUTATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_FUZZY_ALGORITHM_COMPUTATION',
);

const FUZZY_MATCH_COMPLETED_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('FUZZY_MATCH_COMPLETED');

const FUZZY_OPTIONS_INVALID_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'FUZZY_SEARCH_OPTIONS_INVALID',
);

const FUZZY_DRIVER_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'FUZZY_SEARCH_DRIVER_FAULT',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Ejecuta el algoritmo de búsqueda difusa Fuse.js sobre un universo autorizado e inmutable.
 *
 * @param searchQueryLiteral - Término de búsqueda ingresado por el usuario.
 * @param searchableEntityCollection - Colección inmutable de entidades previamente filtradas por RBAC.
 * @param executionOptionsSnapshot - Opciones opcionales de límite de resultados y correlación distribuida.
 * @returns {Promise<ISearchableEntity[]>} Hallazgos ordenados por relevancia semántica.
 * @throws {ValidationException} Si la consulta excede el máximo permitido o las opciones son inválidas.
 * @throws {InternalSystemException} Si ocurre un fallo inesperado durante la ejecución de Fuse.js.
 */
export const ExecuteTechnicalFuzzySearch = async (
  searchQueryLiteral: string,
  searchableEntityCollection: readonly ISearchableEntity[],
  executionOptionsSnapshot: ITechnicalFuzzySearchOptions = {},
): Promise<ISearchableEntity[]> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    executionOptionsSnapshot.correlationIdentifier,
  );

  const trimmedQueryLiteral = searchQueryLiteral.trim();
  if (trimmedQueryLiteral.length === 0 || searchableEntityCollection.length === 0) {
    return [];
  }

  const optionsValidationResult = TechnicalFuzzySearchOptionsSchema.safeParse({
    searchQueryLiteral: trimmedQueryLiteral,
    maximumResultsLimitQuantity: executionOptionsSnapshot.maximumResultsLimitQuantity,
    correlationIdentifier,
  });

  if (!optionsValidationResult.success) {
    const validationIssuesCollection = optionsValidationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
      operationCodeLiteral: FUZZY_OPTIONS_INVALID_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Ejecución difusa rechazada por consulta excesiva u opciones de búsqueda inválidas.',
      semanticIntentTag: 'SEARCH_DRIVER_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('SEARCH_DRIVER_OPTIONS_INVALID', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const { searchQueryLiteral: validatedQueryLiteral, maximumResultsLimitQuantity } =
    optionsValidationResult.data;

  return await TraceExecutionTime(
    DRIVER_MODULE_IDENTIFIER,
    FUZZY_COMPUTATION_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<ISearchableEntity[]> => {
      try {
        const discoveryEngineInstance = new Fuse<ISearchableEntity>(
          searchableEntityCollection,
          GLOBAL_FUSE_CONFIGURATION_OPTIONS,
        );

        const rawMatchResultsCollection =
          maximumResultsLimitQuantity !== undefined
            ? discoveryEngineInstance.search(validatedQueryLiteral, {
                limit: maximumResultsLimitQuantity,
              })
            : discoveryEngineInstance.search(validatedQueryLiteral);

        const matchedEntitiesCollection = rawMatchResultsCollection.map(
          (matchResultSnapshot) => matchResultSnapshot.item,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
          operationCodeLiteral: FUZZY_MATCH_COMPLETED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: `Búsqueda difusa completada. Hallazgos: [${matchedEntitiesCollection.length}].`,
          semanticIntentTag: 'SEARCH_FUZZY_MATCH_COMPLETED',
          contextMetadataSnapshot: Object.freeze({
            queryLengthQuantity: validatedQueryLiteral.length,
            indexedEntitiesQuantity: searchableEntityCollection.length,
            resultsCountQuantity: matchedEntitiesCollection.length,
          }),
        });

        return matchedEntitiesCollection;
      } catch (caughtExecutionError: unknown) {
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : new InternalSystemException('FUZZY_SEARCH_DRIVER_EXECUTION_FAILURE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
              });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: DRIVER_MODULE_IDENTIFIER,
          operationCodeLiteral: FUZZY_DRIVER_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo crítico durante la ejecución del algoritmo de búsqueda difusa.',
          semanticIntentTag: 'SEARCH_DRIVER_FAULT',
          contextMetadataSnapshot: Object.freeze({
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
