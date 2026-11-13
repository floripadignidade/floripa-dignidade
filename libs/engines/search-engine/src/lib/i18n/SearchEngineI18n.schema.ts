/**
 * @section Search Engine Contracts - Linguistic Integrity Schema (SSOT)
 * @description Contrato Zod inmutable para validar los diccionarios de traducción del motor
 * de búsqueda difusa (`@floripa-dignidade/search-engine`). Garantiza paridad semántica con las
 * categorías de `SearchEntityCategorySchema`, cobertura para señales de telemetría operativa
 * e integridad no-vacía en todos los literales mostrados al ciudadano.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0030).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * Crea un validador estricto para literales de traducción no vacíos.
 *
 * @param semanticDescriptionLiteral - Descripción técnica para auditoría automatizada de contratos.
 * @returns Esquema Zod de cadena purificada con longitud mínima de 1 carácter.
 */
const createRequiredTranslationLiteralSchema = (semanticDescriptionLiteral: string) =>
  z
    .string()
    .trim()
    .min(1, { message: 'SEARCH_ENGINE_I18N_EMPTY_TRANSLATION_LITERAL' })
    .describe(semanticDescriptionLiteral);

/**
 * @name SearchEngineI18nSchema
 * @description Esquema maestro inmutable para la validación de diccionarios del motor de búsqueda.
 */
export const SearchEngineI18nSchema = z
  .object({
    /** Estados operativos visibles durante la ejecución de consultas en el cliente. */
    status: z
      .object({
        searchingStatusLiteral: createRequiredTranslationLiteralSchema(
          'Indicador textual mostrado mientras el algoritmo de búsqueda procesa el índice.',
        ),
        emptyResultsMessageLiteral: createRequiredTranslationLiteralSchema(
          'Mensaje presentado al ciudadano cuando la consulta no arroja coincidencias autorizadas.',
        ),
        resultsFoundLabelLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta descriptiva que acompaña al contador numérico de resultados encontrados.',
        ),
      })
      .readonly()
      .describe('Mensajes de estado en tiempo real del flujo de búsqueda.'),

    /** Etiquetas localizadas sincronizadas 1:1 con `SearchEntityCategorySchema`. */
    categories: z
      .object({
        INSTITUTIONAL_CONTENT: createRequiredTranslationLiteralSchema(
          'Etiqueta visible para resultados de contenido institucional y transparencia.',
        ),
        NEWS_ARTICLE: createRequiredTranslationLiteralSchema(
          'Etiqueta visible para artículos periodísticos y comunicados de prensa.',
        ),
        HUMAN_RIGHTS_REPORT: createRequiredTranslationLiteralSchema(
          'Etiqueta visible para reportes y seguimiento de derechos humanos.',
        ),
        SOLIDARITY_RESOURCE: createRequiredTranslationLiteralSchema(
          'Etiqueta visible para recursos de asistencia comunitaria y apoyo territorial.',
        ),
      })
      .readonly()
      .describe('Catálogo localizado de categorías de entidades indexadas.'),

    /** Textos guía y accesibilidad de entrada en el widget de búsqueda. */
    placeholders: z
      .object({
        searchInputPlaceholderLiteral: createRequiredTranslationLiteralSchema(
          'Texto de sugerencia dentro del campo de entrada de búsqueda.',
        ),
        keyboardShortcutHintLiteral: createRequiredTranslationLiteralSchema(
          'Etiqueta accesible para el atajo de teclado de apertura rápida del buscador.',
        ),
      })
      .readonly()
      .describe('Textos guía de interfaz y accesibilidad para el campo de búsqueda.'),

    /** Mensajes técnicos estructurados emitidos hacia el flujo de telemetría. */
    logs: z
      .object({
        SEARCH_COMPLETED: createRequiredTranslationLiteralSchema(
          'Literal técnico emitido tras finalizar una consulta de búsqueda difusa con RBAC.',
        ),
      })
      .readonly()
      .describe('Catálogo de mensajes de registro operativo del motor de búsqueda.'),
  })
  .readonly()
  .describe('Contrato lingüístico integral del motor de búsqueda institucional.');

/**
 * @name ISearchEngineI18n
 * @description Tipo inmutable inferido del diccionario validado del motor de búsqueda.
 */
export type ISearchEngineI18n = z.infer<typeof SearchEngineI18nSchema>;
