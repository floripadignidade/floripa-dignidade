/**
 * @section Discovery DNA - Search & Interlinking Schema
 * @description Contrato soberano para la indexación y recuperación de entidades.
 * Define la estructura de búsqueda compatible con RBAC de forma agnóstica.
 *
 * Protocolo OEDP-V13.0 - Entity Sovereignty & Zero Abbreviations.
 * Saneamiento: Eliminación de dependencia de 'identity' para cumplir Module Boundaries.
 *
 * @author Raz  Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @section ADN de Autoridad Agnóstica
 * Define los rangos de autoridad de forma literal para evitar acoplamiento con módulos.
 */
export const SearchAuthorityRoleSchema = z
  .enum([
    'INFRASTRUCTURE_SOVEREIGN_AUDITOR',
    'PLATFORM_GLOBAL_MANAGER',
    'ORGANIZATION_ADMINISTRATOR',
    'ORGANIZATION_OPERATOR',
    'CITIZEN_REGISTERED',
    'CITIZEN_ANONYMOUS',
  ])
  .describe('Rangos de autoridad institucional reconocidos por el motor.');

export type SearchAuthorityRole = z.infer<typeof SearchAuthorityRoleSchema>;

/**
 * Identificador Nominal para Entidades Buscables.
 */
export const SearchableEntityIdentifierSchema = z
  .string()
  .uuid()
  .brand<'SearchableEntityIdentifier'>();
export type SearchableEntityIdentifier = z.infer<typeof SearchableEntityIdentifierSchema>;

/**
 * Esquema de Categorías de Entidad.
 */
export const SearchEntityCategorySchema = z
  .enum(['INSTITUTIONAL_CONTENT', 'NEWS_ARTICLE', 'HUMAN_RIGHTS_REPORT', 'SOLIDARITY_RESOURCE'])
  .describe('Categorización semántica para el motor de descubrimiento.');

/**
 * @name SearchIndexSchema
 * @description Contrato maestro para objetos localizables en el portal.
 */
export const SearchIndexSchema = z
  .object({
    searchableEntityIdentifier: SearchableEntityIdentifierSchema.describe(
      'Identificador único e inalterable en el índice de búsqueda.',
    ),

    titleLiteral: z
      .string()
      .min(3)
      .max(150)
      .describe('Título optimizado para el motor de búsqueda y rastreo SEO.'),

    indexKeywordsCollection: z
      .array(z.string())
      .min(1)
      .describe('Colección de términos clave para el sistema de interconexión semántica.'),

    contentDescriptionSnippet: z
      .string()
      .max(300)
      .describe('Resumen breve para visualización en los resultados de búsqueda.'),

    internalPathRouteLiteral: z
      .string()
      .regex(/^\//)
      .describe('Ruta relativa ISO dentro del ecosistema (Debe iniciar con /).'),

    requiredAuthorityRole: SearchAuthorityRoleSchema.default('CITIZEN_ANONYMOUS').describe(
      'Mínimo nivel de autoridad institucional para descubrir este resultado.',
    ),

    discoveryRelevanceWeightScore: z
      .number()
      .min(0)
      .max(1)
      .default(0.5)
      .describe('Prioridad de visualización (1.0 representa máxima relevancia).'),
  })
  .readonly();

/** Interfaces e Inferencias */
export type ISearchableEntity = z.infer<typeof SearchIndexSchema>;
export type SearchEntityCategory = z.infer<typeof SearchEntityCategorySchema>;

export const SearchResponseSchema = z.array(SearchIndexSchema).readonly();
export type ISearchResponse = z.infer<typeof SearchResponseSchema>;
