/**
 * @section Shared UI Foundry - Enterprise Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para los componentes físicos
 * de la interfaz del ecosistema Floripa Dignidade. Orquestra la visibilidad de
 * los ladrillos visuales (Atoms, Molecules, Organisms) construidos bajo
 * el estándar React 19 y Next.js 16+.
 *
 * Protocolo OEDP-V17.0 - Single Source Resolution & ISO Technical Naming.
 * 🛡️ LEY ZENITH: Este archivo prohíbe el acceso directo a las 'tripas' del búnker,
 * obligando al uso de alias oficiales (@floripa-dignidade/shared-ui-foundry).
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

/**
 * @version 1.2.0
 * Estatus: Nivelación Zenith completada. Complejidad ciclomática saneada en
 * componentes críticos y Grafo de Tipos ambientales estabilizado.
 */
export const SHARED_UI_FOUNDRY_VERSION = '1.2.0';

/**
 * @section Capa 1: Unidades de Interacción Mínima (Atoms)
 * @description Componentes puros con responsabilidad única de interacción y marca.
 */

/** Botón de acción soberano con sensor de carga y telemetría integrada. */
export { GlobalActionButton } from './lib/atoms/GlobalActionButton';

/** Identidad visual institucional optimizada para Core Web Vitals (LCP). */
export { GlobalBrandLogo } from './lib/atoms/GlobalBrandLogo';


/**
 * @section Capa 2: Unidades de Composición Intermedia (Molecules)
 * @description Ensambles de átomos que resuelven patrones de UX específicos.
 */

/** Motor de descubrimiento universal con soporte de atajos de hardware. */
export { GlobalSearchWidget } from './lib/molecules/GlobalSearchWidget';


/**
 * @section Capa 3: Orquestadores de Negocio (Organisms)
 * @description Bloques complejos que vinculan la UI con la lógica de la ONG.
 */

/** Encabezado de navegación institucional con rastro de scroll y menú móvil. */
export { GlobalMainNavigationHeader } from './lib/organisms/MainNavigationHeader';

/** Formulario de captación ciudadana con validación LGPD y persistencia cloud. */
export { NewsletterSubscriptionForm } from './lib/organisms/NewsletterSubscriptionForm';


/**
 * 🛡️ NOTA DE ARQUITECTURA SRE:
 * Queda estrictamente prohibida la exportación de esquemas Zod o tipos de
 * contrato desde este búnker. Toda la "Verdad de Datos" (ADN) reside en:
 * '@floripa-dignidade/shared-ui-contracts'.
 */
