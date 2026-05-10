'use client';

/**
 * @section Composite UI - Main Navigation Header (Orchestrator)
 * @description Orquestador supremo de la navegación institucional.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de TS2305/TS7016, pulverización de acciones
 * y cumplimiento estricto de la Triada Visual.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useMemo } from 'react';
import { Menu, X } from 'lucide-react';

/* 1. Infraestructura y Hooks (Sovereign Swarm) */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';
import { useHeaderSentry } from './navigation-header/hooks/useHeaderSentry';

/* 2. Átomos y Moléculas Locales (Swiss-Watch Swarm) */
import { GlobalBrandLogo } from '../atoms/GlobalBrandLogo';
import { DesktopNavigationMenu } from './navigation-header/molecules/DesktopNavigationMenu';
import { MobileNavigationDrawer } from './navigation-header/molecules/MobileNavigationDrawer';
import { NavigationActionsSwarm } from './navigation-header/molecules/NavigationActionsSwarm';

/* 3. Planos y Contratos (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/** Identificador técnico del aparato para el Neural Sentinel. */
const HEADER_MODULE_IDENTIFIER = 'MAIN_NAVIGATION_HEADER_COMPOSITE';

interface IGlobalMainNavigationHeaderProperties {
  readonly translationDictionary: IMainNavigationHeaderI18n;
  readonly externalClassName?: string;
}

export const GlobalMainNavigationHeader: React.FC<IGlobalMainNavigationHeaderProperties> = ({
  translationDictionary,
  externalClassName,
}) => {

  // 1. INYECCIÓN DE INTELIGENCIA SENSORIAL (SRP Hook)
  const {
    isMobileMenuOpenBoolean,
    isScrollThresholdExceededBoolean,
    toggleMobileMenuAction
  } = useHeaderSentry(HEADER_MODULE_IDENTIFIER);

  /**
   * @section Arquitectura de Estilos (Atomic Consistency)
   */
  const headerContainerStylesLiteral = useMemo(() =>
    GlobalStyleClassMerger(
      'fixed top-0 w-full z-[100] transition-all duration-500 border-b',
      isScrollThresholdExceededBoolean
        ? 'bg-white/90 backdrop-blur-md py-2 shadow-2xl border-slate-200'
        : 'bg-transparent py-6 border-transparent',
      externalClassName,
    ),
    [isScrollThresholdExceededBoolean, externalClassName],
  );

  return (
    <header className={headerContainerStylesLiteral} role="banner">
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* ÁREA A: IDENTIDAD (Logo) */}
        <GlobalBrandLogo
          imageWidthPixelQuantity={isScrollThresholdExceededBoolean ? 140 : 180}
          imageHeightPixelQuantity={60}
          isNavigationLinkEnabledBoolean={true}
          isPolymorphicBoolean={false}
          forensicTestIdentifier="BRAND_LOGO_MAIN"
          labels={{
            logoAlternativeTextLiteral: 'Floripa Dignidade',
            navigationAriaLabelLiteral: translationDictionary.navigationPaths.identity,
          }}
          visualVariantLiteral={isScrollThresholdExceededBoolean ? 'STANDARD' : 'MONOCHROME_WHITE'}
        />

        {/* ÁREA B: NAVEGACIÓN DESKTOP */}
        <DesktopNavigationMenu dictionary={translationDictionary.navigationPaths} />

        {/* ÁREA C: ACCIONES (Swarm Delegation) */}
        <NavigationActionsSwarm actionsDictionary={translationDictionary.actions} />

        {/* DISPARADOR MÓVIL (Touch-First Trigger) */}
        <button
          className={GlobalStyleClassMerger(
            'lg:hidden p-3 rounded-2xl backdrop-blur shadow-sm border transition-all active:scale-90',
            isScrollThresholdExceededBoolean
              ? 'text-navy-900 bg-slate-50 border-slate-200'
              : 'text-white bg-white/10 border-white/20',
          )}
          onClick={toggleMobileMenuAction}
          aria-expanded={isMobileMenuOpenBoolean}
          aria-label={translationDictionary.actions.mobileMenuToggle}
        >
          {isMobileMenuOpenBoolean ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* CAJÓN MÓVIL (Off-canvas) */}
      <MobileNavigationDrawer
        isOpenBoolean={isMobileMenuOpenBoolean}
        translationDictionary={translationDictionary}
      />
    </header>
  );
};
