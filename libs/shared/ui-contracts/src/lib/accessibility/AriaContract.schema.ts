/**
 * @section UI Contracts - WAI-ARIA Accessibility DNA
 * @description Define el contrato de atributos para tecnologías assistivas.
 * Protocolo OEDP-V17.0 - ISO/IEC 40500 Compliance.
 */

import { z } from 'zod';

export const AriaAttributesSchema = z.object({
  accessibilityLabelLiteral: z.string().optional()
    .describe('Equivalente a aria-label.'),
  accessibilityDescribedByReference: z.string().optional()
    .describe('Equivalente a aria-describedby.'),
  isAccessibilityHiddenBoolean: z.boolean().optional()
    .describe('Equivalente a aria-hidden.'),
  semanticRoleLiteral: z.string().optional()
    .describe('Rol semántico WAI-ARIA.'),
  ariaControlsReference: z.string().optional()
    .describe('ID del elemento controlado.'),
  isAriaExpandedBoolean: z.boolean().optional()
    .describe('Indica estado de expansión.'),
}).readonly();

export type IAriaAttributes = z.infer<typeof AriaAttributesSchema>;
