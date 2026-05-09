/**
 * @section i18n DNA - Main Navigation Header Dictionary Schema
 * @description Contrato soberano para la internacionalización del encabezado global.
 * Define la estructura obligatoria de los diccionarios lingüísticos, garantizando
 * que la navegación institucional y los llamados a la acción (CTA) sean coherentes
 * en todos los idiomas soportados.
 *
 * Protocolo OEDP-V13.0 - Linguistic Sovereignty & Zero Abbreviations.
 * @author Raz  Podestá - MetaShark Tech
 */

import { z } from 'zod';

/**
 * @name MainNavigationHeaderI18nSchema
 * @description Aduana de ADN para el búnker de navegación.
 * Valida la existencia de etiquetas de ruta, acciones de conversión y
 * descriptores de accesibilidad universal.
 */
export const MainNavigationHeaderI18nSchema = z.object({

  /**
   * Etiquetas de Rutas de Navegación.
   * Define el texto visible en los enlaces del menú principal.
   */
  navigationPaths: z.object({
    identity: z.string()
      .describe('Etiqueta para la sección institucional: Misión, Visión y Valores.'),

    transparency: z.string()
      .describe('Etiqueta para el portal de rendición de cuentas y datos abiertos.'),

    solidarity: z.string()
      .describe('Etiqueta para el ecosistema de apoyo y red de voluntarios.'),

    press: z.string()
      .describe('Etiqueta para el búnker de noticias, prensa y comunicados oficiales.'),

    complaint: z.string()
      .describe('Etiqueta crítica para el acceso al sistema de denuncias de Derechos Humanos.'),
  }),

  /**
   * Etiquetas de Acción y Conversión Social.
   * Define los textos para botones, placeholders y micro-copy de interacción.
   */
  actions: z.object({
    donateCallToAction: z.string()
      .describe('Texto de alto impacto para el botón de captación de donaciones.'),

    searchPlaceholder: z.string()
      .describe('Texto de sugerencia (hint) dentro del widget de búsqueda universal.'),

    mobileMenuToggle: z.string()
      .describe('Descriptor ARIA para el botón de apertura/cierre del menú en dispositivos móviles.'),

    reportEmergencyLabel: z.string()
      .describe('Texto de alerta para el botón de denuncia urgente en el menú móvil.'),
  })

}).readonly(); // Inmutabilidad estructural absoluta

/**
 * @section Interfaces Inmutables (Inferidas)
 */
export type IMainNavigationHeaderI18n = z.infer<typeof MainNavigationHeaderI18nSchema>;
