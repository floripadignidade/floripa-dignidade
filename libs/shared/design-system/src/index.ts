/**
 * @section Shared Design System - Package Master Entry Point (SSOT)
 * @description Única Fuente de Verdad (SSOT) para la identidad visual institucional
 * del ecosistema Floripa Dignidade. Centraliza la exportación de tokens cromáticos,
 * tipográficos, medidas de espaciado y la instancia maestra del tema global validada
 * y sellada inmutablemente contra `DesignSystemSchema` (ADR 0029).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura de Esquemas y Tipos (Verbatim Module Syntax) */
import {
  ColorHexSchema,
  DesignSystemSchema,
  type IColorHex,
  type IDesignSystem,
} from './lib/schemas/DesignSystem.schema';

/* 2. Definiciones de Tokens Institucionales (Ground Truth) */
import { GLOBAL_COLOR_DEFINITION } from './lib/tokens/ColorPalette.tokens';

/**
 * Versión técnica del paquete de diseño institucional sincronizada con package.json.
 */
export const SHARED_DESIGN_SYSTEM_VERSION = '1.3.1';

/**
 * Color de interacción hover institucional calibrado para contraste WCAG 2.2.
 */
const ACTION_AMBER_HOVER_COLOR_HEX: IColorHex = ColorHexSchema.parse('#D48806');

/**
 * Fondo institucional de lienzo suave calibrado para pantallas OLED y descanso visual.
 */
const CANVAS_SLATE_PAGE_COLOR_HEX: IColorHex = ColorHexSchema.parse('#F8FAFC');

/**
 * @name GlobalThemeConfiguration
 * @description Instancia inmutable y certificada de la identidad visual institucional.
 * Actúa como la referencia maestra para `@floripa-dignidade/shared-ui-foundry` y
 * los motores de renderizado de `apps/floripa-dignidade` y `apps/content-manager-system`.
 *
 * @throws {ZodError} Si la configuración viola las restricciones de formato o rango de Zod.
 */
export const GlobalThemeConfiguration: IDesignSystem = Object.freeze(
  DesignSystemSchema.parse({
    schemaVersion: SHARED_DESIGN_SYSTEM_VERSION,
    themeMode: 'SYSTEM',
    tokens: {
      colorPalette: {
        brandPrimary: GLOBAL_COLOR_DEFINITION.navyDeepBlue,
        brandSecondary: GLOBAL_COLOR_DEFINITION.bridgeLightBlue,
        actionCall: GLOBAL_COLOR_DEFINITION.actionAmberOrange,
        actionHover: ACTION_AMBER_HOVER_COLOR_HEX,
        backgroundPage: CANVAS_SLATE_PAGE_COLOR_HEX,
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
        baseUnitQuantity: 4,
        containerMaxWidthQuantity: 1280,
      },
      typographyHierarchy: {
        fontFamilyPrimary: "'Inter', system-ui, sans-serif",
        fontFamilySecondary: "'Lexend', system-ui, sans-serif",
        baseLineHeightNumeric: 1.6,
      },
    },
    accessibilityStandard: {
      isReducedMotionEnabledBoolean: false,
      isHighContrastEnabledBoolean: false,
      minimumTouchAreaSizeQuantity: 44,
    },
  }),
);

/**
 * @section Exportación Reutilizable del ADN Visual
 * Expone esquemas y tokens para consumo en tailwind.config, contratos y apps.
 */
export * from './lib/schemas/DesignSystem.schema';
export * from './lib/tokens/ColorPalette.tokens';
