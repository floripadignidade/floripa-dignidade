/**
 * @section Frontpage Contracts - Feature Action Card Schema (Atom)
 * @description Define el contrato Zod inmutable para la validación de propiedades
 * del componente visual `FeatureActionCard`. Garantiza variantes cromáticas válidas
 * e integridad de los literales localizados antes del renderizado.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { z } from 'zod';

/**
 * @name FeatureActionVisualVariantSchema
 * @description Variantes semánticas de énfasis cromático admitidas por la tarjeta de pilar.
 */
export const FeatureActionVisualVariantSchema = z
  .enum(['RED', 'BLUE', 'AMBER'])
  .describe('Variante cromática semántica para la iconografía del pilar estratégico.');

export type TFeatureActionVisualVariant = z.infer<typeof FeatureActionVisualVariantSchema>;

/**
 * @name FeatureActionCardPropertiesSchema
 * @description Aduana Zod inmutable para las propiedades de entrada de `FeatureActionCard`.
 */
export const FeatureActionCardPropertiesSchema = z
  .object({
    /** Nodo de iconografía vectorial (Lucide o elemento React equivalente). */
    graphicIconNode: z.custom<React.ReactNode>(),

    /** Título de impacto localizado para la funcionalidad o pilar estratégico. */
    headlineTitleLiteral: z.string().trim().min(1),

    /** Descripción localizada del valor social o técnico del pilar. */
    contentDescriptionLiteral: z.string().trim().min(1),

    /** Variante cromática que define el contexto semántico de la tarjeta. */
    visualVariantLiteral: FeatureActionVisualVariantSchema.default('BLUE'),

    /** Identificador técnico para trazabilidad forense y asociación ARIA. */
    featureIdentifierLiteral: z.string().trim().min(1).default('GENERIC_FEATURE'),
  })
  .readonly();

export type IFeatureActionCardProperties = z.input<typeof FeatureActionCardPropertiesSchema>;
