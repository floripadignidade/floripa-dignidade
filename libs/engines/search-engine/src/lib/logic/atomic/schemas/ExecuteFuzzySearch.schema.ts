/**
 * @section Search Engine Contracts - Discovery Execution Schema (Atom)
 * @description Define el contrato Zod inmutable para los parámetros de ejecución de
 * búsqueda difusa universal. Valida y acota la consulta contra sobrecarga de CPU,
 * sella la inmutabilidad del índice, sincroniza el rol institucional por defecto con
 * `@floripa-dignidade/contracts` y habilita límites opcionales y correlación forense.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { IDENTITY_ACCESS_ROLES_COLLECTION } from '@floripa-dignidade/contracts';
import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

import { SearchAuthorityRoleSchema, SearchIndexSchema } from '../../../schemas/SearchEngine.schema';

/** Longitud máxima de caracteres admitida en consultas de búsqueda difusa para proteger los 120 FPS. */
export const MAXIMUM_SEARCH_QUERY_LENGTH_QUANTITY = 160;

/**
 * @name ExecuteFuzzySearchParametersSchema
 * @description Aduana Zod inmutable para el orquestador de búsqueda difusa con control RBAC.
 * Implementa el principio Fail-Fast para impedir procesamiento sobre índices o consultas inválidas.
 */
export const ExecuteFuzzySearchParametersSchema = z
  .object({
    /** Cadena de texto de búsqueda ingresada por el ciudadano, acotada para evitar degradación de CPU. */
    searchQueryLiteral: z
      .string()
      .trim()
      .min(1, { message: 'SEARCH_QUERY_TOO_SHORT' })
      .max(MAXIMUM_SEARCH_QUERY_LENGTH_QUANTITY, {
        message: 'SEARCH_QUERY_EXCEEDS_MAXIMUM_LENGTH',
      })
      .describe('Cadena de caracteres purificada para coincidencia semántica difusa.'),

    /** Colección completa e inmutable de entidades autorizadas en el índice de búsqueda. */
    completeIndexCollection: z
      .array(SearchIndexSchema)
      .min(1, { message: 'SEARCH_INDEX_COLLECTION_EMPTY' })
      .readonly()
      .describe('Universo inmutable de entidades indexadas para el proceso de descubrimiento.'),

    /** Rango de autoridad institucional del actor que realiza la consulta (SSOT Contracts). */
    authenticatedUserAuthorityRole: SearchAuthorityRoleSchema.default(
      IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_ANONYMOUS,
    ).describe('Nivel de acceso institucional del actor para el filtrado perimetral previo.'),

    /** Tope opcional de resultados devueltos tras la ordenación por relevancia. */
    maximumResultsLimitQuantity: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Cantidad máxima opcional de hallazgos retornados al consumidor.'),

    /** Identificador UUID v4 opcional para propagar trazabilidad distribuida. */
    correlationIdentifier: CorrelationIdentifierSchema.optional().describe(
      'Identificador de correlación opcional proveniente del flujo llamador.',
    ),
  })
  .readonly()
  .describe('Parámetros validados e inmutables para la ejecución de búsqueda difusa universal.');

export type IExecuteFuzzySearchParameters = z.infer<typeof ExecuteFuzzySearchParametersSchema>;

export type IExecuteFuzzySearchInput = z.input<typeof ExecuteFuzzySearchParametersSchema>;
