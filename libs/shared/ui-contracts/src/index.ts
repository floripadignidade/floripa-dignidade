/**
 * @section Shared UI Contracts - Package Entry Point (Master Barrel)
 * @description Única Fuente de Verdad (SSOT) para los planos y contratos visuales
 * del ecosistema Floripa Dignidade. Centraliza la visibilidad de esquemas Zod,
 * contratos de accesibilidad y definiciones de layout institucional.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & Verbatim Module Syntax.
 * SANEADO Zenith: Erradicación de 'Star Exports', inyección de exportaciones
 * nominales y sincronización con el patrón Base/Readonly (Fix TS2345).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.2
 * Estatus: Nivelación Zenith completada. Grafo de contratos estabilizado
 * tras la resolución de la paradoja de inmutabilidad en Zod.
 */
export const SHARED_UI_CONTRACTS_VERSION = '1.2.2';

/**
 * @section Capa 1: Accesibilidad Universal (WAI-ARIA DNA)
 */
export {
  AriaAttributesSchema,
} from './lib/accessibility/AriaContract.schema';

export type {
  IAriaAttributes,
} from './lib/accessibility/AriaContract.schema';

/**
 * @section Capa 2: Ladrillos Atómicos (Foundations)
 */

// 2.1. Primitivos Base
export {
  UiPrimitivesBaseSchema,
  UiPrimitivesSchema,
} from './lib/primitives/UiPrimitives.schema';

export type {
  IUiPrimitives,
} from './lib/primitives/UiPrimitives.schema';

// 2.2. Identidad Visual (Branding Atoms)
export {
  GlobalBrandLogoPropertiesSchema,
} from './lib/primitives/GlobalBrandLogo.schema';

export type {
  IGlobalBrandLogoProperties,
} from './lib/primitives/GlobalBrandLogo.schema';

/**
 * @section Capa 3: Orquestación de Composición (Organisms & Layout)
 */

// 3.1. Esquemas de Composición Genéricos
export {
  CompositeUiSchema,
  InteractionStateSchema,
  ResponsiveVisibilitySchema,
  VisualLayoutVariantSchema,
} from './lib/composition/CompositeUi.schema';

export type {
  ICompositeUi,
} from './lib/composition/CompositeUi.schema';

// 3.2. Contratos de Navegación Institucional
export {
  MainNavigationHeaderI18nSchema,
} from './lib/composition/MainNavigationHeader.schema';

export type {
  IMainNavigationHeaderI18n,
} from './lib/composition/MainNavigationHeader.schema';
