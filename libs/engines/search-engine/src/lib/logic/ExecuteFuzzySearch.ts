/**
 * @section Discovery Logic - Universal Discovery Orchestrator
 * @description Orquestador superior encargado de coordinar la búsqueda institucional
 * con filtros de autoridad (RBAC). Actúa como la aduana de seguridad para el
 * descubrimiento de contenidos en el portal ciudadano.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Sincronización con Driver Atómico, erradicación de obsolescencia
 * y cumplimiento estricto de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural y Contratos (Verbatim Module Syntax) */
import {
  SearchResponseSchema
} from '../schemas/SearchEngine.schema';

import type {
  ISearchableEntity,
  SearchAuthorityRole,
} from '../schemas/SearchEngine.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
/** 🛡️ SANEADO Zenith: Importación del nuevo átomo de ejecución asíncrona. */
import { ExecuteTechnicalFuzzySearch } from '../drivers/ExecuteTechnicalFuzzySearch';

/** Identificador técnico del motor para el Neural Sentinel. */
const SEARCH_ENGINE_IDENTIFIER = 'UNIVERSAL_SEARCH_ENGINE';

/**
 * Ejecuta una búsqueda difusa integral respetando la jerarquía de soberanía.
 * Implementa el patrón "Security-by-Design" filtrando el índice antes de la computación.
 *
 * @param searchQueryLiteral - Cadena de búsqueda ingresada por el ciudadano.
 * @param completeIndexCollection - Universo total de datos indexados.
 * @param authenticatedUserAuthorityRole - Rango de autoridad del actor (Default: CITIZEN_ANONYMOUS).
 * @returns {Promise<ISearchableEntity[]>} Resultados filtrados, ordenados y validados.
 */
export const ExecuteFuzzySearch = async (
  searchQueryLiteral: string,
  completeIndexCollection: ISearchableEntity[],
  authenticatedUserAuthorityRole: SearchAuthorityRole = 'CITIZEN_ANONYMOUS',
): Promise<ISearchableEntity[]> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  // 1. FILTRO DE ATOMICIDAD (Return Early)
  if (!searchQueryLiteral.trim()) {
    return [];
  }

  return await TraceExecutionTime(
    SEARCH_ENGINE_IDENTIFIER,
    'EXECUTE_FUZZY_DISCOVERY_TRANSACTION',
    correlationIdentifier,
    async () => {
      /**
       * 2. FILTRO PERIMETRAL (RBAC Enforcement)
       * 🛡️ LEY ZENITH: El motor solo procesa entidades que el ciudadano está
       * autorizado a ver, protegiendo la privacidad desde la memoria.
       */
      const authorizedEntityCollection = completeIndexCollection.filter((entitySnapshot) => {
        const hasAdministrativeBypassBoolean =
          authenticatedUserAuthorityRole === 'INFRASTRUCTURE_SOVEREIGN_AUDITOR' ||
          authenticatedUserAuthorityRole === 'PLATFORM_GLOBAL_MANAGER';

        // Acceso total para auditores SRE y gestores globales.
        if (hasAdministrativeBypassBoolean) return true;

        // Acceso público nominal.
        if (entitySnapshot.requiredAuthorityRole === 'CITIZEN_ANONYMOUS') return true;

        // Coincidencia exacta de rango institucional.
        return entitySnapshot.requiredAuthorityRole === authenticatedUserAuthorityRole;
      });

      /**
       * 3. INVOCACIÓN DEL DRIVER (Delegación Atómica)
       * SANEADO Zenith: Transición a llamada asíncrona hacia el nuevo motor Fuse.js.
       */
      const rawMatchResultsCollection = await ExecuteTechnicalFuzzySearch(
        searchQueryLiteral,
        authorizedEntityCollection
      );

      // 4. ADUANA DE ADN (Safe Parsing)
      const validatedDiscoveryResults = SearchResponseSchema.parse(rawMatchResultsCollection);

      // 5. REPORTE DE ÉXITO (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: SEARCH_ENGINE_IDENTIFIER,
        operationCodeLiteral: 'SEARCH_DISCOVERY_COMPLETED',
        correlationIdentifier,
        messageContentLiteral: `Operación de búsqueda finalizada con éxito. Hallazgos: [${validatedDiscoveryResults.length}]`,
        /** Clasificación ontológica para el motor de salud algorítmica */
        semanticIntentTag: 'USER_CONTENT_DISCOVERY',
        contextMetadataSnapshot: {
          resultsCountQuantity: validatedDiscoveryResults.length,
          authorityRoleLiteral: authenticatedUserAuthorityRole,
          indexVolumeQuantity: completeIndexCollection.length
        }
      });

      return [...validatedDiscoveryResults];
    },
  );
};
