/**
 * @section UI Contracts - Composition Orchestration Schema
 * @description Define el ADN para organismos y ensambles complejos.
 */

import { z } from 'zod';

export const VisualLayoutVariantSchema = z.enum([
  'STANDARD_CONTAINER',
  'FULL_STRETCH_WIDTH',
  'NARROW_READING_COLUMN',
  'DYNAMIC_GRID_SYSTEM',
]);

export const InteractionStateSchema = z.object({
  isProcessingLoadingBoolean: z.boolean().default(false),
  isExecutionErrorDetectedBoolean: z.boolean().default(false),
  isDataContentMissingBoolean: z.boolean().default(false),
});

export const ResponsiveVisibilitySchema = z.object({
  isMobileVisibleBoolean: z.boolean().default(true),
  isTabletVisibleBoolean: z.boolean().default(true),
  isDesktopVisibleBoolean: z.boolean().default(true),
});

export const CompositeUiSchema = z
  .object({
    visualLayoutVariant: VisualLayoutVariantSchema.default('STANDARD_CONTAINER'),
    interactionStates: InteractionStateSchema.optional(),
    responsiveVisibility: ResponsiveVisibilitySchema.optional(),
  })
  .readonly();

export type ICompositeUi = z.infer<typeof CompositeUiSchema>;
