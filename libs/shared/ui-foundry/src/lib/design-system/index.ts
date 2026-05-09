/**
 * @section Design System - Global Configuration
 * @description Centraliza la identidad visual y los tokens cromáticos institucionales.
 *
 * Protocolo OEDP-V15.0 - Verbatim Module Syntax.
 * @author Raz Podestá - MetaShark Tech
 */

import { DesignSystemSchema } from './schemas/DesignSystem.schema';

/** 🛡️ SANEAMIENTO TÉCNICO: Importación exclusiva de ADN (tipos) */
import type { IColorHex, IDesignSystem } from './schemas/DesignSystem.schema';

export const GLOBAL_DESIGN_SYSTEM_VERSION = '1.3.0';

/**
 * Definición de la paleta cromática bajo estándar hexadecimal estricto.
 */
const GlobalColorDefinition = {
  navyDeepBlue: '#003366' as IColorHex,
  bridgeLightBlue: '#4A90E2' as IColorHex,
  actionAmberOrange: '#F5A623' as IColorHex,
  pureWhite: '#FFFFFF' as IColorHex,
  slateDarkGray: '#1E293B' as IColorHex,
  slateMutedGray: '#64748B' as IColorHex,
} as const;

/**
 * Configuración maestra del sistema visual.
 */
const GlobalThemeConfigurationObject: IDesignSystem = {
  schemaVersion: GLOBAL_DESIGN_SYSTEM_VERSION,
  themeMode: 'SYSTEM',
  tokens: {
    colorPalette: {
      brandPrimary: GlobalColorDefinition.navyDeepBlue,
      brandSecondary: GlobalColorDefinition.bridgeLightBlue,
      actionCall: GlobalColorDefinition.actionAmberOrange,
      actionHover: '#D48806' as IColorHex,
      backgroundPage: '#F1F5F9' as IColorHex,
      surfaceCard: GlobalColorDefinition.pureWhite,
      surfaceOverlay: GlobalColorDefinition.pureWhite,
      statusError: '#E11D48' as IColorHex,
      statusSuccess: '#10B981' as IColorHex,
      statusWarning: '#FBBF24' as IColorHex,
      statusInfo: GlobalColorDefinition.bridgeLightBlue,
      neutralText: GlobalColorDefinition.slateDarkGray,
      neutralMuted: GlobalColorDefinition.slateMutedGray,
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
};

/**
 * Exportación de la configuración validada mediante esquema Zod.
 */
export const GlobalThemeConfiguration = DesignSystemSchema.parse(GlobalThemeConfigurationObject);

export * from './schemas/DesignSystem.schema';
