/**
 * @section Search Engine Contracts - Discovery & RBAC Index Schema (SSOT)
 * @description Contratos Zod inmutables para la indexación, categorización semántica y
 * recuperación segura de entidades en el motor de búsqueda difusa. Consume el catálogo
 * oficial de roles RBAC desde `@floripa-dignidade/contracts` e impone validación
 * estructural estricta contra rutas externas y cadenas vacías.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  IdentityAccessRoleSchema,
  type TIdentityAccessRole,
} from '@floripa-dignidade/contracts';

/**
 * @name LegacySearchAuthorityRoleAliasSchema
 * @description Alias de compatibilidad transicional mientras se nivelan los consumidores internos
 * de `search-engine` hacia los identificadores canónicos de `@floripa-dignidade/contracts`.
 * @deprecated Utilizar exclusivamente `IdentityAccessRoleSchema` en nuevos índices.
 */
export const LegacySearchAuthorityRoleAliasSchema = z
  .enum(['INFRASTRUCTURE_SOVEREIGN_AUDITOR', 'CITIZEN_REGISTERED', 'CITIZEN_ANONYMOUS'])
  .describe('Alias transicionales heredados para rangos de autoridad en índices previos.');

/**
 * @name SearchAuthorityRoleSchema
 * @description Validador de rangos de autoridad RBAC sincronizado con `@floripa-dignidade/contracts`.
 */
export const SearchAuthorityRoleSchema = z
  .union([IdentityAccessRoleSchema, LegacySearchAuthorityRoleAliasSchema])
  .describe('Rangos de autoridad institucional reconocidos por el motor de descubrimiento.');

/** Tipo nominal canónico sincronizado con `@floripa-dignidade/contracts`. */
export type TCanonicalSearchAuthorityRole = TIdentityAccessRole;

/** Tipo de autoridad reconocido por el motor de búsqueda (incluye alias transicionales). */
export type SearchAuthorityRole = z.infer<typeof SearchAuthorityRoleSchema>;

/**
 * @name SearchableEntityIdentifierSchema
 * @description Identificador único universal (UUID v4) sellado nominalmente para entidades indexadas.
 */
export const SearchableEntityIdentifierSchema = z
  .string()
  .trim()
  .uuid({ message: 'SEARCHABLE_ENTITY_IDENTIFIER_MUST_BE_UUID_V4' })
  .describe('Identificador nominal inalterable de una entidad indexada en búsqueda.')
  .brand<'SearchableEntityIdentifier'>();

export type SearchableEntityIdentifier = z.infer<typeof SearchableEntityIdentifierSchema>;

/**
 * @name SearchEntityCategorySchema
 * @description Taxonomía semántica de categorías indexadas en el observatorio y portal ciudadano.
 */
export const SearchEntityCategorySchema = z
  .enum(['INSTITUTIONAL_CONTENT', 'NEWS_ARTICLE', 'HUMAN_RIGHTS_REPORT', 'SOLIDARITY_RESOURCE'])
  .describe('Categorización semántica para el motor de descubrimiento institucional.');

export type SearchEntityCategory = z.infer<typeof SearchEntityCategorySchema>;

/**
 * @name SearchIndexSchema
 * @description Contrato maestro inmutable para objetos localizables en el portal ciudadano.
 */
export const SearchIndexSchema = z
  .object({
    searchableEntityIdentifier: SearchableEntityIdentifierSchema.describe(
      'Identificador único e inalterable en el índice de búsqueda.',
    ),

    titleLiteral: z
      .string()
      .trim()
      .min(3, { message: 'SEARCH_ENTITY_TITLE_TOO_SHORT' })
      .max(150, { message: 'SEARCH_ENTITY_TITLE_EXCEEDS_MAXIMUM_LENGTH' })
      .describe('Título optimizado para el motor de búsqueda y rastreo SEO.'),

    indexKeywordsCollection: z
      .array(z.string().trim().min(1, { message: 'SEARCH_KEYWORD_MUST_NOT_BE_EMPTY' }))
      .min(1, { message: 'SEARCH_KEYWORDS_COLLECTION_REQUIRED' })
      .readonly()
      .describe('Colección inmutable de términos clave para interconexión semántica.'),

    contentDescriptionSnippet: z
      .string()
      .trim()
      .max(300, { message: 'SEARCH_SNIPPET_EXCEEDS_MAXIMUM_LENGTH' })
      .describe('Resumen breve para visualización en los resultados de búsqueda.'),

    internalPathRouteLiteral: z
      .string()
      .trim()
      .regex(/^\/(?!\/)[^\s]*$/, { message: 'INVALID_INTERNAL_SEARCH_ROUTE_PATH' })
      .describe(
        'Ruta relativa interna ISO dentro del ecosistema (inicia con / único sin espacios).',
      ),

    requiredAuthorityRole: SearchAuthorityRoleSchema.default(
      IDENTITY_ACCESS_ROLES_COLLECTION.IDENTITY_ANONYMOUS,
    ).describe('Mínimo nivel de autoridad institucional requerido para descubrir este resultado.'),

    entityCategoryLiteral: SearchEntityCategorySchema.optional().describe(
      'Categoría semántica opcional para filtrado y agrupación visual en interfaz.',
    ),

    discoveryRelevanceWeightScore: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .describe('Prioridad de visualización en resultados (1.0 representa máxima relevancia).'),
  })
  .readonly();

export type ISearchableEntity = z.infer<typeof SearchIndexSchema>;

/**
 * @name SearchResponseSchema
 * @description Contrato inmutable de salida para colecciones de entidades descubiertas.
 */
export const SearchResponseSchema = z
  .array(SearchIndexSchema)
  .readonly()
  .describe('Colección inmutable de entidades autorizadas resultantes de la búsqueda.');

export type ISearchResponse = z.infer<typeof SearchResponseSchema>;
