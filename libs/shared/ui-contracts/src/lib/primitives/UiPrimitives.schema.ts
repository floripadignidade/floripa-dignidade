/**
 * @section UI Contracts - Atomic Base Schema
 * @description Contrato maestro de propiedades para componentes de nivel Átomo.
 * SANEADO Zenith: Separación de Base y Readonly para permitir composición (Fix TS2345).
 */

import { z } from 'zod';
import { AriaAttributesSchema } from '../accessibility/AriaContract.schema';

/**
 * @name UiPrimitivesBaseSchema
 * @description Objeto Zod puro para composición interna mediante .merge() o .extend().
 */
export const UiPrimitivesBaseSchema = z.object({
  technicalIdentifier: z.string().optional().describe('Atributo "id" nativo de HTML.'),
  externalClassName: z.string().optional().describe('Clases CSS externas.'),
  isPolymorphicBoolean: z.boolean().default(false).describe('Soporte para patrón Slot/asChild.'),
  forensicTestIdentifier: z.string().optional().describe('ID inalterable para auditoría E2E.'),
  accessibilityConfiguration: AriaAttributesSchema.optional(),
});

/**
 * @name UiPrimitivesSchema
 * @description Versión sellada para consumo externo en la fundición visual.
 */
export const UiPrimitivesSchema = UiPrimitivesBaseSchema.readonly();

export type IUiPrimitives = z.infer<typeof UiPrimitivesSchema>;
