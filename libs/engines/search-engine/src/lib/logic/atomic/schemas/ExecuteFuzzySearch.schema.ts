/**
 * @section Search Engine DNA - Discovery Execution Contract
 * @description Define el contrato de integridad para la operación de búsqueda universal.
 * Garantiza que la consulta y el índice cumplan con el estándar institucional
 * antes de iniciar la computación asíncrona.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * SANEADO Zenith: Corrección de orden alfabético en importaciones (sort-imports).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * 🛡️ SANEADO Zenith: Ordenamiento alfabético estricto de miembros.
 * 'SearchAuthorityRoleSchema' (A) precede a 'SearchIndexSchema' (I).
 */
import {
  SearchAuthorityRoleSchema,
  SearchIndexSchema,
} from '../../../schemas/SearchEngine.schema.js';

/**
 * @name ExecuteFuzzySearchParametersSchema
 * @description Aduana de entrada para el orquestador de búsqueda.
 * Implementa el patrón "Fail-Fast" para proteger el Main Thread.
 */
export const ExecuteFuzzySearchParametersSchema = z
  .object({
    /** El término de búsqueda ingresado por el ciudadano. */
    searchQueryLiteral: z
      .string()
      .trim()
      .min(1, { message: 'SEARCH_QUERY_TOO_SHORT' })
      .describe('Cadena de caracteres capturada para el análisis de coincidencia.'),

    /** La colección completa de entidades registradas en el índice. */
    completeIndexCollection: z
      .array(SearchIndexSchema)
      .min(1, { message: 'SEARCH_INDEX_COLLECTION_EMPTY' })
      .describe('Universo total de datos autorizados para el descubrimiento.'),

    /** Rango de autoridad institucional del actor que realiza la consulta. */
    authenticatedUserAuthorityRole: SearchAuthorityRoleSchema.default('CITIZEN_ANONYMOUS').describe(
      'Nivel de acceso RBAC del ciudadano (Identity Sync).',
    ),
  })
  .readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IExecuteFuzzySearchParameters = z.infer<typeof ExecuteFuzzySearchParametersSchema>;
