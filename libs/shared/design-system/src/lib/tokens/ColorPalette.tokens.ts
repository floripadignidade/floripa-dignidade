/**
 * @section Design System - Color Palette Tokens
 * @description Definición inmutable de la identidad cromática institucional.
 * Protocolo OEDP-V17.0 - Branded Type Integrity.
 */

import type { IColorHex } from '../schemas/DesignSystem.schema';

/**
 * @name GLOBAL_COLOR_DEFINITION
 * @description Catálogo maestro de colores bajo estándar hexadecimal estricto.
 */
export const GLOBAL_COLOR_DEFINITION = {
  navyDeepBlue: '#003366' as IColorHex,
  bridgeLightBlue: '#4A90E2' as IColorHex,
  actionAmberOrange: '#F5A623' as IColorHex,
  pureWhite: '#FFFFFF' as IColorHex,
  slateDarkGray: '#1E293B' as IColorHex,
  slateMutedGray: '#64748B' as IColorHex,
  statusErrorRed: '#E11D48' as IColorHex,
  statusSuccessGreen: '#10B981' as IColorHex,
  statusWarningAmber: '#FBBF24' as IColorHex,
} as const;
