import { z } from 'zod';

/**
 * @section Design System DNA - Visual Sovereignty
 * @description Contrato maestro de tokens inmutables.
 */

const RawColorHexSchema = z
  .string()
  .trim()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'INVALID_COLOR_HEX_FORMAT' })
  .transform((value) => value.toUpperCase());

export const ColorHexSchema = RawColorHexSchema.brand<'ColorHex'>();
export type IColorHex = z.infer<typeof ColorHexSchema>;

export const TypographyScaleSchema = z.enum([
  'DISPLAY', 'HEADING_1', 'HEADING_2', 'HEADING_3',
  'BODY_LARGE', 'BODY_DEFAULT', 'BODY_SMALL', 'CAPTION'
]);

export const DesignSystemSchema = z.object({
  schemaVersion: z.string().default('1.3.0'),
  themeMode: z.enum(['LIGHT', 'DARK', 'SYSTEM']).default('SYSTEM'),
  tokens: z.object({
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
    }),
    spacingSystem: z.object({
      baseUnit: z.number().default(4),
      containerMaxWidth: z.number().default(1280),
    }),
    typographyHierarchy: z.object({
      fontFamilyPrimary: z.string(),
      fontFamilySecondary: z.string(),
      baseLineHeight: z.number().default(1.5),
    })
  }),
  accessibilityStandard: z.object({
    isReducedMotionEnabled: z.boolean().default(false),
    isHighContrastEnabled: z.boolean().default(false),
    minimumTouchAreaSize: z.number().default(44),
  }),
}).readonly();

export type IDesignSystem = z.infer<typeof DesignSystemSchema>;
