/**
 * @section Shared Design System - Package Entry Point
 * @description Única Fuente de Verdad para el ADN Visual del ecosistema.
 * Protocolo OEDP-V17.0 - Single Source Resolution.
 */

import { DesignSystemSchema } from './lib/schemas/DesignSystem.schema';
import { GLOBAL_COLOR_DEFINITION } from './lib/tokens/ColorPalette.tokens';
import type { IDesignSystem, IColorHex } from './lib/schemas/DesignSystem.schema';

export const SHARED_DESIGN_SYSTEM_VERSION = '1.3.0';

/**
 * @name GlobalThemeConfiguration
 * @description Instancia validada de la configuración visual del ecosistema.
 */
export const GlobalThemeConfiguration: IDesignSystem = DesignSystemSchema.parse({
  schemaVersion: SHARED_DESIGN_SYSTEM_VERSION,
  themeMode: 'SYSTEM',
  tokens: {
    colorPalette: {
      brandPrimary: GLOBAL_COLOR_DEFINITION.navyDeepBlue,
      brandSecondary: GLOBAL_COLOR_DEFINITION.bridgeLightBlue,
      actionCall: GLOBAL_COLOR_DEFINITION.actionAmberOrange,
      actionHover: '#D48806' as IColorHex,
      backgroundPage: '#F1F5F9' as IColorHex,
      surfaceCard: GLOBAL_COLOR_DEFINITION.pureWhite,
      surfaceOverlay: GLOBAL_COLOR_DEFINITION.pureWhite,
      statusError: GLOBAL_COLOR_DEFINITION.statusErrorRed,
      statusSuccess: GLOBAL_COLOR_DEFINITION.statusSuccessGreen,
      statusWarning: GLOBAL_COLOR_DEFINITION.statusWarningAmber,
      statusInfo: GLOBAL_COLOR_DEFINITION.bridgeLightBlue,
      neutralText: GLOBAL_COLOR_DEFINITION.slateDarkGray,
      neutralMuted: GLOBAL_COLOR_DEFINITION.slateMutedGray,
    },
    spacingSystem: {
      baseUnit: 4,
      containerMaxWidth: 1280,
    },
    typographyHierarchy: {
      fontFamilyPrimary: "'Inter', system-ui, sans-serif",
      fontFamilySecondary: "'Lexend', system-ui, sans-serif",
      baseLineHeight: 1.6,
    },
  },
  accessibilityStandard: {
    isReducedMotionEnabled: false,
    isHighContrastEnabled: false,
    minimumTouchAreaSize: 44,
  },
});

export * from './lib/schemas/DesignSystem.schema';
export * from './lib/tokens/ColorPalette.tokens';
