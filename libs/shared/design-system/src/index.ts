/**
 * @section Shared Design System - Package Entry Point (SSOT)
 * @description Única Fuente de Verdad (SSOT) para el ADN Visual del ecosistema
 * Floripa Dignidade. Centraliza la exportación de tokens cromáticos, tipográficos
 * y la configuración del tema global validada por la aduana Zod.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Visual Integrity.
 * 🛡️ LEY ZENITH: El orden de los miembros de importación es auditado para
 * garantizar la previsibilidad del motor de análisis de la IA.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura de Esquemas y Tipos (Verbatim Module Syntax) */
import { DesignSystemSchema } from './lib/schemas/DesignSystem.schema';

/**
 * 🛡️ SANEADO Zenith: Miembros ordenados alfabéticamente (C < D)
 * para erradicar la violación de lint 'sort-imports'.
 */
import type { IColorHex, IDesignSystem } from './lib/schemas/DesignSystem.schema';

/* 2. Definiciones de Tokens (Ground Truth) */
import { GLOBAL_COLOR_DEFINITION } from './lib/tokens/ColorPalette.tokens';

/**
 * Versión técnica del búnker de diseño.
 * Sincronizada con el ciclo de vida del monorepo.
 */
export const SHARED_DESIGN_SYSTEM_VERSION = '1.3.0';

/**
 * @name GlobalThemeConfiguration
 * @description Instancia inmutable y validada de la identidad visual institucional.
 * Este objeto actúa como la referencia maestra para el 'ui-foundry' y los
 * motores de renderizado del CMS.
 *
 * @throws {ZodError} Si los tokens físicos no cumplen con el contrato de integridad.
 */
export const GlobalThemeConfiguration: IDesignSystem = DesignSystemSchema.parse({
  schemaVersion: SHARED_DESIGN_SYSTEM_VERSION,
  themeMode: 'SYSTEM',
  tokens: {
    colorPalette: {
      brandPrimary: GLOBAL_COLOR_DEFINITION.navyDeepBlue,
      brandSecondary: GLOBAL_COLOR_DEFINITION.bridgeLightBlue,
      actionCall: GLOBAL_COLOR_DEFINITION.actionAmberOrange,
      /** 🛡️ SANEADO: Casting soberano de color de interacción. */
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
    /** 🛡️ SANEADO: Cumplimiento de Prosa Booleana Estricta. */
    isReducedMotionEnabledBoolean: false,
    isHighContrastEnabledBoolean: false,
    minimumTouchAreaSizeQuantity: 44,
  },
});

/**
 * @section Exportación de ADN
 * Permite la reconstrucción de tipos y la validación en búnkeres superiores.
 */
export * from './lib/schemas/DesignSystem.schema';
export * from './lib/tokens/ColorPalette.tokens';
