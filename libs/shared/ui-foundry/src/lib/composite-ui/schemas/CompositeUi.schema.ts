/**
 * @section Component DNA - Composite UI Orchestration Schema
 * @description Contrato soberano para componentes de alta jerarquía (Organismos).
 * Define el ADN para ensambles complejos, gestionando variantes de layout,
 * estados de interacción proactiva y visibilidad responsiva atómica.
 *
 * Protocolo OEDP-V13.0 - Atomic Visual Integrity & Zero Abbreviations.
 * @author Raz  Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Esquema de Variantes de Layout Visual.
 * Define la anatomía del contenedor en el sistema de grilla del portal.
 */
export const VisualLayoutVariantSchema = z.enum([
  'STANDARD_CONTAINER',     // Ancho máximo definido por el Design System (1280px)
  'FULL_STRETCH_WIDTH',     // Ocupa el 100% del viewport (Hero sections, Footers)
  'NARROW_READING_COLUMN',  // Optimizado para legibilidad de artículos (768px)
  'DYNAMIC_GRID_SYSTEM'     // Delegado al control de grilla interna del componente
]).describe('Variantes anatómicas de posicionamiento para componentes complejos');

/**
 * Esquema de Estados de Interacción Proactiva.
 * Permite que el orquestador gestione el ciclo de vida visual de forma atómica
 * y reporte latencias o fallos al Neural Sentinel.
 */
export const InteractionStateSchema = z.object({
  isProcessingLoadingBoolean: z.boolean().default(false)
    .describe('Indica si el búnker está en fase de hidratación o fetching de datos'),

  isExecutionErrorDetectedBoolean: z.boolean().default(false)
    .describe('Indica si se ha capturado una excepción durante el renderizado del bloque'),

  isDataContentMissingBoolean: z.boolean().default(false)
    .describe('Indica si el búnker no posee información para mostrar (Empty State)'),
});

/**
 * Esquema de Configuración de Visibilidad Responsiva.
 * Controla la presencia del componente en los breakpoints críticos de la ONG.
 */
export const ResponsiveVisibilityConfigurationSchema = z.object({
  isMobileVisibleBoolean: z.boolean().default(true)
    .describe('Breakpoint: 320px - 480px'),

  isTabletVisibleBoolean: z.boolean().default(true)
    .describe('Breakpoint: 481px - 1024px'),

  isDesktopVisibleBoolean: z.boolean().default(true)
    .describe('Breakpoint: 1025px+'),
});

/**
 * @name CompositeUiSchema
 * @description Esquema Maestro para Componentes Compuestos (Composite UI).
 * Actúa como la base de herencia para orquestadores de layout.
 */
export const CompositeUiSchema = z.object({
  /**
   * Variante anatómica del componente.
   */
  visualLayoutVariant: VisualLayoutVariantSchema.default('STANDARD_CONTAINER'),

  /**
   * Estado vital de la interacción.
   */
  interactionStates: InteractionStateSchema.optional(),

  /**
   * Estrategia de visibilidad multi-dispositivo.
   */
  responsiveVisibilityConfiguration: ResponsiveVisibilityConfigurationSchema.optional(),

}).readonly(); // Inmutabilidad de ADN forzada

/**
 * @section Interfaces Inmutables (Inferidas)
 */
export type ICompositeUi = z.infer<typeof CompositeUiSchema>;
export type IVisualLayoutVariant = z.infer<typeof VisualLayoutVariantSchema>;
export type IInteractionState = z.infer<typeof InteractionStateSchema>;
export type IResponsiveVisibilityConfiguration = z.infer<typeof ResponsiveVisibilityConfigurationSchema>;
