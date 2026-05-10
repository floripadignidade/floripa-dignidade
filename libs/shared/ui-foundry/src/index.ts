/**
 * @section Shared UI Foundry - Package Entry Point (Barrel)
 * @description Único punto de exportación autorizado para componentes React.
 * Protocolo OEDP-V17.0 - Single Source Resolution.
 */

// 1. Átomos (Interaction Units)
export { GlobalActionButton } from './lib/atoms/GlobalActionButton';
export { GlobalBrandLogo } from './lib/atoms/GlobalBrandLogo';

// 2. Moléculas (Composite Units)
export { GlobalSearchWidget } from './lib/molecules/GlobalSearchWidget';

// 3. Organismos (Business Blocks)
export { GlobalMainNavigationHeader } from './lib/organisms/MainNavigationHeader';
export { NewsletterSubscriptionForm } from './lib/organisms/NewsletterSubscriptionForm';

/**
 * 🛡️ NOTA DE ARQUITECTURA:
 * Los esquemas i18n y contratos estructurales ahora se consumen desde
 * @floripa-dignidade/shared-ui-contracts para evitar duplicidad.
 */
