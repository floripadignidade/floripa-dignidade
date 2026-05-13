/**
 * @section Discovery Logic - Universal Discovery Orchestrator (Master)
 * @description Orquestador supremo encargado de coordinar la búsqueda institucional
 * con filtros de autoridad (RBAC). Actúa como la aduana de seguridad para el
 * descubrimiento de contenidos, garantizando la soberanía de datos del ciudadano.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Atomización de filtrado perimetral, validación de ADN en
 * frontera e integración de telemetría ontológica para la IA.
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

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import { SearchResponseSchema } from '../schemas/SearchEngine.schema';
import type { ISearchableEntity, SearchAuthorityRole } from '../schemas/SearchEngine.schema';
import { ExecuteFuzzySearchParametersSchema } from './atomic/schemas/ExecuteFuzzySearch.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { ExecuteTechnicalFuzzySearch } from '../drivers/ExecuteTechnicalFuzzySearch';
import { FilterSearchIndexByAuthority } from './atomic/FilterSearchIndexByAuthority';

/** Identificador técnico del motor para el Neural Sentinel. */
const SEARCH_ORCHESTRATOR_IDENTIFIER = 'UNIVERSAL_SEARCH_ENGINE_ORCHESTRATOR';

/**
 * Ejecuta una búsqueda difusa integral respetando la jerarquía de soberanía.
 * Implementa el patrón "Security-by-Design": el filtrado ocurre antes de que el
 * algoritmo de búsqueda toque el índice para prevenir fugas de información.
 *
 * @param searchQueryLiteral - Cadena de búsqueda ingresada por el ciudadano.
 * @param completeIndexCollection - Universo total de datos indexados (News, Reports, etc).
 * @param authenticatedUserAuthorityRole - Rango de autoridad del actor (Default: CITIZEN_ANONYMOUS).
 * @returns {Promise<ISearchableEntity[]>} Resultados filtrados, ordenados y validados.
 * @throws {ValidationException} Si los parámetros o el resultado violan el ADN estructural.
 * @throws {InternalSystemException} Si el motor de computación difusa colapsa.
 */
export const ExecuteFuzzySearch = async (
  searchQueryLiteral: string,
  completeIndexCollection: ISearchableEntity[],
  authenticatedUserAuthorityRole: SearchAuthorityRole = 'CITIZEN_ANONYMOUS',
): Promise<ISearchableEntity[]> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    SEARCH_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_FUZZY_DISCOVERY_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        // --- FASE 1: ADUANA DE ENTRADA (Sovereign Validation) ---
        /**
         * 🛡️ LEY ZENITH: Validamos la integridad del índice y la consulta antes del despacho.
         * Si la consulta está vacía, el esquema lanzará una ValidationException.
         */
        const inputValidationResult = ExecuteFuzzySearchParametersSchema.safeParse({
          searchQueryLiteral,
          completeIndexCollection,
          authenticatedUserAuthorityRole
        });

        if (!inputValidationResult.success) {
          throw new ValidationException('CONTRATO_DE_SOLICITUD_DE_BUSQUEDA_CORRUPTO', {
            structuralIssuesCollection: inputValidationResult.error.flatten(),
            correlationIdentifier
          });
        }

        const {
          searchQueryLiteral: validatedQuery,
          completeIndexCollection: validatedIndex,
          authenticatedUserAuthorityRole: validatedRole
        } = inputValidationResult.data;

        // --- FASE 2: FILTRO PERIMETRAL (RBAC Guard Delegation) ---
        /**
         * Delegamos en el átomo guardián para purgar el índice de contenidos no autorizados.
         */
        const authorizedEntityCollection = FilterSearchIndexByAuthority(
          [...validatedIndex],
          validatedRole
        );

        // --- FASE 3: COMPUTACIÓN DIFUSA (Asynchronous Driver) ---
        /**
         * Invocación del motor técnico (Fuse.js).
         * Realiza la coincidencia semántica sobre el set de datos ya securizado.
         */
        const rawMatchResultsCollection = await ExecuteTechnicalFuzzySearch(
          validatedQuery,
          authorizedEntityCollection
        );

        // --- FASE 4: ADUANA DE SALIDA (Integrity Check) ---
        /**
         * Certificamos que los hallazgos cumplan con el contrato de respuesta del búnker.
         */
        const validatedDiscoveryResults = SearchResponseSchema.parse(rawMatchResultsCollection);

        // --- FASE 5: REPORTE DE ÉXITO (SRE Visibility) ---
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: SEARCH_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'SEARCH_DISCOVERY_NOMINAL',
          correlationIdentifier,
          /** Uso de clave soberana para internacionalización técnica */
          messageContentLiteral: 'SEARCH_ENGINE.LOGS.SEARCH_COMPLETED',
          semanticIntentTag: 'USER_CONTENT_DISCOVERY',
          contextMetadataSnapshot: {
            queryLengthQuantity: validatedQuery.length,
            resultsFoundQuantity: validatedDiscoveryResults.length,
            actorAuthorityRoleLiteral: validatedRole,
            preFilterIndexSizeQuantity: completeIndexCollection.length
          }
        });

        return [...validatedDiscoveryResults];

      } catch (caughtError: unknown) {
        // --- FASE 6: GESTIÓN FORENSE DE COLAPSO (Resilience Layer) ---

        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : 'UNKNOWN_SEARCH_FAULT';

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: SEARCH_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'SEARCH_ORCHESTRATION_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de búsqueda universal.',
          semanticIntentTag: 'SEARCH_ENGINE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            searchQuerySnapshot: searchQueryLiteral
          },
        });

        throw new InternalSystemException('FALLO_CRITICO_EN_MOTOR_DE_BUSQUEDA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
