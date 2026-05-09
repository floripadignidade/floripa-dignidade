/**
 * @section Composite UI Bunker - Sovereign Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para componentes de alta
 * jerarquía (Organismos) y sus contratos de internacionalización asociados.
 * Centraliza la visibilidad de los esquemas de navegación y layout global.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ISO Technical Naming.
 * SANEADO Zenith: Resolución de visibilidad TS2305 para Navegación e i18n.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.0
 * Estatus: Nivelación de contratos de navegación consolidada.
 */
export const SHARED_COMPOSITE_UI_VERSION = '1.2.0';

/**
 * @section 1. ADN de Infraestructura Base
 * @description Contratos genéricos para la orquestación de componentes compuestos.
 */
export * from './schemas/CompositeUi.schema';
export * from './i18n/CompositeUiI18n.schema';

/**
 * @section 2. Búnker de Navegación Institucional
 * @description Esquemas de integridad para el encabezado global y diccionarios de ruteo.
 */

// 2.1. ADN Estructural de Navegación
export {
  MainNavigationHeaderPropertiesSchema,
} from './schemas/MainNavigationHeader.schema';

export type {
  IMainNavigationHeaderProperties,
} from './schemas/MainNavigationHeader.schema';

// 2.2. Almas Lingüísticas de Navegación
export {
  MainNavigationHeaderI18nSchema,
} from './i18n/MainNavigationHeaderI18n.schema';

export type {
  IMainNavigationHeaderI18n,
} from './i18n/MainNavigationHeaderI18n.schema';

/**
 * @section 3. Futuros Ensambles Institucionales
 * @todo Registrar aquí los contratos para:
 * - ImpactFooter (Fase 6)
 * - DonationWidget (Fase 8)
 * - TransparencyDashboard (Fase 10)
 */
