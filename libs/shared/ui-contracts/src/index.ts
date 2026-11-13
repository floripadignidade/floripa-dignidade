/**
 * @section Shared UI Contracts - Enterprise Global Package Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para los planos, contratos de datos
 * y esquemas de validación visual del ecosistema Floripa Dignidade. Orquestra la
 * visibilidad de la arquitectura de interfaz para que la Fundición Visual (Foundry)
 * y las Aplicaciones operen bajo un Grafo de Tipos inexpugnable.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Verbatim Module Syntax.
 * SANEADO: Normalización de resolución de rutas a especificación canónica 'bundler'
 * (remoción de extensiones virtuales .js para empaquetado directo en Next.js/Turbopack).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.1
 * Estatus: Nivelación Zenith completada. Grafo de visibilidad sanado para
 * compatibilidad total con React 19 y motores de resolución 'bundler'.
 */
export const SHARED_UI_CONTRACTS_VERSION = '1.3.1';

/**
 * @domain 1. ACCESIBILIDAD UNIVERSAL (WAI-ARIA DNA)
 * @description Contratos de identidad para tecnologías asistivas (ISO/IEC 40500).
 */
export { AriaAttributesSchema } from './lib/accessibility/AriaContract.schema';

export type { IAriaAttributes } from './lib/accessibility/AriaContract.schema';

/**
 * @domain 2. PRIMITIVOS ATÓMICOS (Base UI Blueprints)
 * @description Ladrillos estructurales compartidos por todos los componentes del sistema.
 */
export { UiPrimitivesBaseSchema, UiPrimitivesSchema } from './lib/primitives/UiPrimitives.schema';

export type { IUiPrimitives } from './lib/primitives/UiPrimitives.schema';

/**
 * @domain 3. IDENTIDAD INSTITUCIONAL (Branding Atoms)
 * @description Esquemas de validación para logotipos y activos de marca.
 */
export { GlobalBrandLogoPropertiesSchema } from './lib/primitives/GlobalBrandLogo.schema';

export type { IGlobalBrandLogoProperties } from './lib/primitives/GlobalBrandLogo.schema';

/**
 * @domain 4. MOTORES DE DESCUBRIMIENTO (Search Intelligence)
 * @description Planos para el widget de búsqueda universal y triaje de resultados.
 */
export { GlobalSearchWidgetPropertiesSchema } from './lib/primitives/GlobalSearchWidget.schema';

export type { IGlobalSearchWidgetProperties } from './lib/primitives/GlobalSearchWidget.schema';

/**
 * @domain 5. CAPTACIÓN CIUDADANA (Newsletter & Conversion)
 * @description Contratos de datos para el embudo de suscripción y validación LGPD.
 */
export {
  NewsletterSubscriptionFormPropertiesSchema,
  NewsletterSubscriptionFormSchema,
} from './lib/primitives/NewsletterForm.schema';

export type {
  INewsletterSubscriptionForm,
  INewsletterSubscriptionFormProperties,
} from './lib/primitives/NewsletterForm.schema';

export { NewsletterSubscriptionFormI18nSchema } from './lib/composition/NewsletterFormI18n.schema';

export type { INewsletterSubscriptionFormI18n } from './lib/composition/NewsletterFormI18n.schema';

/**
 * @domain 6. ORQUESTACIÓN DE COMPOSICIÓN (Layout & Organisms)
 * @description Planos para ensambles complejos, navegación y jerarquías visuales.
 */

/** 6.1. Composición Atómica de Layout y Estados de Interacción */
export {
  CompositeUiSchema,
  InteractionStateSchema,
  ResponsiveVisibilitySchema,
  VisualLayoutVariantSchema,
} from './lib/composition/CompositeUi.schema';

export type { ICompositeUi } from './lib/composition/CompositeUi.schema';

/** 6.2. Navegación Institucional (Global Header & Sentry) */
export { MainNavigationHeaderI18nSchema } from './lib/composition/MainNavigationHeader.schema';

export type { IMainNavigationHeaderI18n } from './lib/composition/MainNavigationHeader.schema';
