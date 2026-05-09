// libs/shared/ui-foundry/src/index.ts

// Atoms
export * from './lib/atoms/GlobalActionButton';
export * from './lib/atoms/GlobalBrandLogo';

// Molecules
export * from './lib/molecules/GlobalSearchWidget';

// Organisms
export * from './lib/organisms/MainNavigationHeader';
export * from './lib/organisms/NewsletterSubscriptionForm';

// Contracts (Asegurando exportación de tipos)
export type { IMainNavigationHeaderI18n } from './lib/composite-ui/i18n/MainNavigationHeaderI18n.schema';
export type { INewsletterSubscriptionFormI18n } from './lib/ui-primitives/i18n/NewsletterSubscriptionFormI18n.schema';
