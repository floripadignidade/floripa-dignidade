/**
 * @section Component DNA - UI Primitives Base Schema
 * @description Contrato soberano de propiedades base para el búnker de UI Primitives.
 * Define los estándares inmutables de accesibilidad, estilos y polimorfismo
 * que todo componente compartido debe heredar.
 *
 * Protocolo OEDP-V13.0 - Atomic Visual Consistency & Zero Abbreviations.
 * @author Raz  Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * Esquema de Atributos de Accesibilidad (WAI-ARIA).
 * Garantiza que cada componente posea el ADN necesario para ser
 * interpretado por tecnologías asistivas y cumplir con ISO/IEC 40500 (WCAG).
 */
export const AriaAttributesSchema = z.object({
  accessibilityLabelLiteral: z.string().optional()
    .describe('Equivalente a aria-label: Descripción textual para lectores de pantalla'),

  accessibilityDescribedByReference: z.string().optional()
    .describe('Equivalente a aria-describedby: ID del elemento que detalla el propósito del componente'),

  isAccessibilityHiddenBoolean: z.boolean().optional()
    .describe('Equivalente a aria-hidden: Determina si el elemento es ignorado por el árbol de accesibilidad'),

  semanticRoleLiteral: z.string().optional()
    .describe('Rol semántico explícito según el estándar WAI-ARIA (ej: "button", "navigation")'),

  ariaControlsReference: z.string().optional()
    .describe('ID del elemento que este componente controla (ej: un menú desplegable)'),

  isAriaExpandedBoolean: z.boolean().optional()
    .describe('Indica si el elemento controlado está expandido o colapsado'),
});

/**
 * @name UiPrimitivesSchema
 * @description Esquema maestro para componentes atómicos.
 * Integra gestión de estilos, polimorfismo de Radix UI y trazabilidad forense para QA.
 */
export const UiPrimitivesSchema = z.object({
  /**
   * Identificador técnico único.
   * Utilizado para el anclaje de estilos CSS y scripts de automatización.
   */
  technicalIdentifier: z.string().optional()
    .describe('Atributo "id" nativo de HTML para identificación en el DOM'),

  /**
   * Gestión de Composición Visual.
   * El uso de 'GlobalStyleClassMerger' es obligatorio al consumir este campo.
   */
  externalClassName: z.string().optional()
    .describe('Cadena de clases CSS externas para personalización del componente'),

  /**
   * Polimorfismo (Radix UI "asChild").
   * Permite que el componente actúe como un Slot, delegando el renderizado a su hijo directo.
   */
  isPolymorphicBoolean: z.boolean().default(false)
    .describe('Si es verdadero, el componente utilizará el patrón Slot para preservar la semántica del hijo'),

  /**
   * Trazabilidad Forense de Calidad (QA Tracking).
   * Sustituye el uso informal de data-testid por un estándar ISO de auditoría.
   */
  forensicTestIdentifier: z.string().optional()
    .describe('Identificador inalterable para pruebas de extremo a extremo (E2E) con Playwright'),

  /**
   * Inyección de ADN de Accesibilidad.
   */
  accessibilityConfiguration: AriaAttributesSchema.optional(),

}).readonly();

/**
 * @section Interfaces Inmutables (Inferidas)
 */
export type IUiPrimitives = z.infer<typeof UiPrimitivesSchema>;
export type IAriaAttributes = z.infer<typeof AriaAttributesSchema>;
