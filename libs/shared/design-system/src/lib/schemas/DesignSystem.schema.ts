/**
 * @section Shared Design System - DNA Schema
 * @description Define el contrato de integridad absoluto para la identidad visual
 * del ecosistema. Implementa tipos nominales (Branding) para blindar la escala
 * cromática y asegura el cumplimiento de la norma ISO para variables de estado y magnitud.
 *
 * Protocolo OEDP-V17.0 - Sovereign Data & ReadOnly Integrity.
 * 🛡️ LEY ZENITH: El uso de '.describe()' es obligatorio para que el Neural Sentinel
 * comprenda la semántica de los tokens durante auditorías lógicas.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/**
 * @section ADN Criptográfico - Tipificación Nominal (Branding)
 */
const RawColorHexSchema = z
  .string()
  .trim()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'INVALID_COLOR_HEX_FORMAT' })
  .transform((value) => value.toUpperCase());

/**
 * @name ColorHexSchema
 * @description Sello de marca para identificadores de color hexadecimal.
 */
export const ColorHexSchema = RawColorHexSchema
  .brand<'ColorHex'>()
  .describe('Representación hexadecimal purificada de un token cromático.');

export type IColorHex = z.infer<typeof ColorHexSchema>;

/**
 * @section Escalas y Jerarquías Tipográficas
 */
export const TypographyScaleSchema = z.enum([
  'DISPLAY', 'HEADING_1', 'HEADING_2', 'HEADING_3',
  'BODY_LARGE', 'BODY_DEFAULT', 'BODY_SMALL', 'CAPTION'
]).describe('Catálogo institucional de niveles de escala tipográfica.');

/**
 * @name DesignSystemSchema
 * @description Contrato maestro de Verdad Única (SSOT) para el diseño institucional.
 */
export const DesignSystemSchema = z.object({
  schemaVersion: z.string().default('1.3.0')
    .describe('Versión técnica del ADN visual para control de migraciones.'),

  themeMode: z.enum(['LIGHT', 'DARK', 'SYSTEM']).default('SYSTEM')
    .describe('Modo de visualización activo en la interfaz.'),

  tokens: z.object({
    /** 🛡️ Bóveda Cromática Inmutable */
    colorPalette: z.object({
      brandPrimary: ColorHexSchema,
      brandSecondary: ColorHexSchema,
      actionCall: ColorHexSchema,
      actionHover: ColorHexSchema,
      backgroundPage: ColorHexSchema,
      surfaceCard: ColorHexSchema,
      surfaceOverlay: ColorHexSchema,
      statusError: ColorHexSchema,
      statusSuccess: ColorHexSchema,
      statusWarning: ColorHexSchema,
      statusInfo: ColorHexSchema,
      neutralText: ColorHexSchema,
      neutralMuted: ColorHexSchema,
    }).readonly(),

    /** 🛡️ Sistema de Espaciado (Sincronizado con Prosa ISO) */
    spacingSystem: z.object({
      baseUnitQuantity: z.number().default(4)
        .describe('Unidad base de la grilla en píxeles (4px standard).'),
      containerMaxWidthQuantity: z.number().default(1280)
        .describe('Ancho máximo permitido para contenedores estándar.'),
    }).readonly(),

    /** 🛡️ Jerarquía de Fuentes */
    typographyHierarchy: z.object({
      fontFamilyPrimary: z.string()
        .describe('Fuente principal para lectura y cuerpo de datos.'),
      fontFamilySecondary: z.string()
        .describe('Fuente secundaria para titulares e identidad.'),
      baseLineHeightNumeric: z.number().default(1.5)
        .describe('Multiplicador de altura de línea para legibilidad ISO.'),
    }).readonly()
  }),

  /**
   * @section Estándares de Accesibilidad (WAI-ARIA & ISO/IEC 40500)
   * SANEADO Zenith: Aplicación de sufijos 'Boolean' y 'Quantity' según bitácora.
   */
  accessibilityStandard: z.object({
    isReducedMotionEnabledBoolean: z.boolean().default(false)
      .describe('Bandera para suprimir animaciones pesadas en el hardware del ciudadano.'),
    isHighContrastEnabledBoolean: z.boolean().default(false)
      .describe('Bandera para activar la paleta de contraste forzado.'),
    minimumTouchAreaSizeQuantity: z.number().default(44)
      .describe('Tamaño mínimo de áreas interactivas en píxeles (Touch-first).'),
  }).readonly(),

}).readonly();

/** 🛡️ ADN Tipado para exportación Verbatim */
export type IDesignSystem = z.infer<typeof DesignSystemSchema>;
