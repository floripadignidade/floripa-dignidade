/**
 * @section Search Engine Contracts - Technical Fuzzy Driver Options Schema (Atom)
 * @description Contrato Zod inmutable para validar los parámetros y opciones de ejecución
 * del driver de búsqueda difusa (Fuse.js), acotando el tamaño de consulta y el límite
 * máximo de hallazgos para proteger el rendimiento del hilo principal y el Edge Runtime.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Rendimiento y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { CorrelationIdentifierSchema } from '@floripa-dignidade/telemetry';

import { MAXIMUM_SEARCH_QUERY_LENGTH_QUANTITY } from '../../logic/atomic/schemas/ExecuteFuzzySearch.schema';

/**
 * @name TechnicalFuzzySearchOptionsSchema
 * @description Aduana Zod inmutable para validar consulta y opciones opcionales del driver Fuse.js.
 */
export const TechnicalFuzzySearchOptionsSchema = z
  .object({
    searchQueryLiteral: z
      .string()
      .trim()
      .max(MAXIMUM_SEARCH_QUERY_LENGTH_QUANTITY, {
        message: 'SEARCH_QUERY_EXCEEDS_MAXIMUM_LENGTH',
      })
      .describe('Término de búsqueda acotado para evitar agotamiento de CPU en Fuse.js.'),

    maximumResultsLimitQuantity: z
      .number()
      .int()
      .min(1)
      .max(100)
      .optional()
      .describe('Límite máximo opcional de resultados devueltos por el motor difuso.'),

    correlationIdentifier: CorrelationIdentifierSchema.optional().describe(
      'Identificador UUID v4 propagado desde el orquestador padre.',
    ),
  })
  .readonly();

/** Opciones extensibles opcionales aceptadas por el driver de búsqueda difusa. */
export type ITechnicalFuzzySearchOptions = Omit<
  z.input<typeof TechnicalFuzzySearchOptionsSchema>,
  'searchQueryLiteral'
>;
