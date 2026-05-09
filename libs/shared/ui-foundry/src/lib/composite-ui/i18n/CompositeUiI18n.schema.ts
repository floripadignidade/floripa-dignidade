import { z } from 'zod';

/**
 * @section Aduana Lingüística - Shared Composite UI
 */
export const CompositeUiI18nSchema = z.object({
  common: z.object({
    loadingMessage: z.string().describe('Texto mostrado durante la carga de bloques complejos'),
    errorMessage: z.string().describe('Texto de error genérico para fallos de renderizado de sección'),
    emptyStateMessage: z.string().describe('Texto mostrado cuando un contenedor no posee contenido'),
    retryButton: z.string().describe('Etiqueta para el botón de reintento en secciones fallidas'),
  })
}).readonly();

export type ICompositeUiI18n = z.infer<typeof CompositeUiI18nSchema>;
