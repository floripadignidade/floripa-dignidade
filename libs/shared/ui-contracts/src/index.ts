/**
 * @section Shared UI Contracts - Enterprise Package Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para los planos, contratos de datos
 * y esquemas de validación visual del ecosistema Floripa Dignidade. Orquestra la
 * visibilidad de la arquitectura de interfaz para que la Fundición Visual (Foundry)
 * y las Aplicaciones operen bajo un Grafo de Tipos inexpugnable.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Clean Paths.
 * SANEADO Zenith: Erradicación de extensiones de archivo en exportaciones,
 * sincronización de exportaciones nominales para Verbatim Module Syntax
 * y cumplimiento de Prosa ISO (Zero Abbreviations).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.3.0
 * Estatus: Nivelación Zenith completada. Grafo de tipos estabilizado para
 * compatibilidad con React 19 y Next.js 16.
 */
export const SHARED_UI_CONTRACTS_VERSION = '1.3.0';

/**
 * @section Capa 0: Fundamentos de Accesibilidad (WAI-ARIA)
 * @description Contratos de identidad para tecnologías asistivas.
 */
export {
  AriaAttributesSchema
} from './lib/accessibility/AriaContract.schema';

export type {
  IAriaAttributes
} from './lib/accessibility/AriaContract.schema';


/**
 * @section Capa 1: Primitivos Atómicos (Base ADN)
 * @description Ladrillos estructurales compartidos por todos los componentes.
 */
export {
  UiPrimitivesBaseSchema,
  UiPrimitivesSchema
} from './lib/primitives/UiPrimitives.schema';

export type {
  IUiPrimitives
} from './lib/primitives/UiPrimitives.schema';


/**
 * @section Capa 2: Identidad Institucional (Branding Atoms)
 */
export {
  GlobalBrandLogoPropertiesSchema
} from './lib/primitives/GlobalBrandLogo.schema';

export type {
  IGlobalBrandLogoProperties
} from './lib/primitives/GlobalBrandLogo.schema';


/**
 * @section Capa 3: Motores de Descubrimiento (Search Blueprints)
 */
export {
  GlobalSearchWidgetPropertiesSchema
} from './lib/primitives/GlobalSearchWidget.schema';

export type {
  IGlobalSearchWidgetProperties
} from './lib/primitives/GlobalSearchWidget.schema';


/**
 * @section Capa 4: Captación Ciudadana (Newsletter & Conversion)
 * @description Contratos de datos para el embudo de suscripción institucional.
 */
export {
  NewsletterSubscriptionFormPropertiesSchema,
  NewsletterSubscriptionFormSchema
} from './lib/primitives/NewsletterForm.schema';

export type {
  INewsletterSubscriptionForm,
  INewsletterSubscriptionFormProperties
} from './lib/primitives/NewsletterForm.schema';

export {
  NewsletterSubscriptionFormI18nSchema
} from './lib/composition/NewsletterFormI18n.schema';

export type {
  INewsletterSubscriptionFormI18n
} from './lib/composition/NewsletterFormI18n.schema';


/**
 * @section Capa 5: Orquestación de Composición (Layout & Organisms)
 * @description Planos para ensambles complejos y jerarquías de visualización.
 */

// 5.1. Composición Atómica de Layout
export {
  CompositeUiSchema,
  InteractionStateSchema,
  ResponsiveVisibilitySchema,
  VisualLayoutVariantSchema
} from './lib/composition/CompositeUi.schema';

export type {
  ICompositeUi
} from './lib/composition/CompositeUi.schema';

// 5.2. Navegación Institucional (Global Header)
export {
  MainNavigationHeaderI18nSchema
} from './lib/composition/MainNavigationHeader.schema';

export type {
  IMainNavigationHeaderI18n
} from './lib/composition/MainNavigationHeader.schema';
