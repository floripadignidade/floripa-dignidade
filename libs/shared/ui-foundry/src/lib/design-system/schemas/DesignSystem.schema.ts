import { z } from 'zod';

/**
 * @section Design System DNA - Visual Sovereignty
 * @description Contrato maestro de tokens inmutables para el portal Floripa Dignidade.
 * Protocolo OEDP-V13.0 - Atomic Consistency & NGO Social Conversion.
 */

/**
 * Esquema de Purificación para Strings Hexadecimales.
 * Valida el formato y normaliza el ADN cromático.
 */
const RawColorHexSchema = z
  .string()
  .trim()
  .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, { message: 'INVALID_COLOR_HEX_FORMAT' })
  .transform((value) => value.toUpperCase());

/**
 * @name ColorHexSchema
 * @description Branded Type para evitar colisiones lógicas entre colores y strings comunes.
 */
export const ColorHexSchema = RawColorHexSchema.brand<'ColorHex'>();
export type IColorHex = z.infer<typeof ColorHexSchema>;

/**
 * Esquema de Niveles Tipográficos.
 * Define la jerarquía para cumplimiento de SEO (H1-H3) y legibilidad de noticias.
 */
export const TypographyScaleSchema = z.enum([
  'DISPLAY',       // Impacto máximo (Hero/Donaciones)
  'HEADING_1',     // Título de noticia principal
  'HEADING_2',     // Subtítulos de sección
  'HEADING_3',     // Títulos de widgets secundarios
  'BODY_LARGE',    // Introducción / Leads
  'BODY_DEFAULT',  // Cuerpo de la noticia (Legibilidad optimizada)
  'BODY_SMALL',    // Metadatos (Fecha, Autor)
  'CAPTION',       // Micro-copys y Tooltips
]).describe('Escala tipográfica soberana del ecosistema');

/**
 * Esquema Maestro del Design System.
 * Alineado con el embudo de conversión social del Hogar de Cristo.
 */
export const DesignSystemSchema = z
  .object({
    /** Versión del ADN Visual para trazabilidad en Neural Sentinel. */
    schemaVersion: z.string().default('1.1.0'),

    themeMode: z
      .enum(['LIGHT', 'DARK', 'SYSTEM'])
      .default('SYSTEM')
      .describe('Preferencia de visualización del motor de temas'),

    tokens: z.object({
      colorPalette: z.object({
        // Colores de Marca y Confianza
        brandPrimary: ColorHexSchema.describe('Color de identidad (Trust Blue/Green)'),
        brandSecondary: ColorHexSchema.describe('Apoyo visual y acentos'),

        // Colores de Acción (Embudo de Ventas Social)
        actionCall: ColorHexSchema.describe('Color para botones de Donación/Conversión'),
        actionHover: ColorHexSchema.describe('Estado activo de interacción'),

        // Superficies (Layout de Portal)
        backgroundPage: ColorHexSchema.describe('Fondo base del sitio'),
        surfaceCard: ColorHexSchema.describe('Fondo para noticias y widgets'),
        surfaceOverlay: ColorHexSchema.describe('Fondo para modales y menús'),

        // Feedback Semántico ISO
        statusError: ColorHexSchema.describe('Alertas de denuncia o fallos'),
        statusSuccess: ColorHexSchema.describe('Confirmación de donación/suscripción'),
        statusWarning: ColorHexSchema.describe('Advertencias de sistema'),
        statusInfo: ColorHexSchema.describe('Información de transparencia'),

        // Neutros
        neutralText: ColorHexSchema.describe('Color de lectura principal'),
        neutralMuted: ColorHexSchema.describe('Texto secundario y bordes'),
      }),

      spacingSystem: z.object({
        baseUnit: z.number().default(4).describe('Multiplicador 8pt Grid System'),
        containerMaxWidth: z.number().default(1280).describe('Ancho máximo del portal'),
      }),

      typographyHierarchy: z.object({
        fontFamilyPrimary: z.string().describe('Fuente para lectura de artículos'),
        fontFamilySecondary: z.string().describe('Fuente para acentos y UI'),
        baseLineHeight: z.number().default(1.5),
      })
    }),

    accessibilityStandard: z.object({
      isReducedMotionEnabled: z.boolean().default(false),
      isHighContrastEnabled: z.boolean().default(false),
      minimumTouchAreaSize: z.number().default(44).describe('Mínimo px según WCAG'),
    }),
  })
  .readonly();

/**
 * @section Interfaces de ADN
 */
export type IDesignSystem = z.infer<typeof DesignSystemSchema>;
export type ITypographyScale = z.infer<typeof TypographyScaleSchema>;
