'use client';

/**
 * @section Composite UI - Main Navigation Header (Orchestrator)
 * @description Orquestador supremo de la navegación institucional. Ensambla el
 * logotipo, la búsqueda universal, los enlaces de navegación y la conversión
 * primaria (donaciones). Gestiona el estado de scroll y la visibilidad móvil.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Atomic Visual DNA.
 * SANEADO Zenith: Resolución de rutas TS2307/TS2305, Prosa ISO y Telemetría.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';
import { Heart, Menu, X } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
} from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Átomos y Primitivos Locales (Internal Relative Paths) */
import { GlobalActionButton } from '../atoms/GlobalActionButton';
import { GlobalBrandLogo } from '../atoms/GlobalBrandLogo';
import { GlobalSearchWidget } from '../molecules/GlobalSearchWidget';
import { NavigationLink } from './navigation-header/atoms/NavigationLink';
import { MobileNavigationDrawer } from './navigation-header/molecules/MobileNavigationDrawer';

/* 3. ADN Estructural (Silos Lingüísticos) */
import type { IMainNavigationHeaderI18n } from '../composite-ui/i18n/MainNavigationHeaderI18n.schema';

/**
 * @interface IGlobalMainNavigationHeaderProperties
 * @description Contrato inmutable para la configuración del encabezado global.
 */
interface IGlobalMainNavigationHeaderProperties {
  /** Diccionario de traducciones validado por la aduana Zod. */
  readonly translationDictionary: IMainNavigationHeaderI18n;
  /** Ruta actual para resaltado de navegación (Opcional). */
  readonly currentActivePathLiteral?: string;
  /** Clases CSS externas para personalización de layout. */
  readonly externalClassName?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const HEADER_MODULE_IDENTIFIER = 'MAIN_NAVIGATION_HEADER_COMPOSITE';

export const GlobalMainNavigationHeader: React.FC<IGlobalMainNavigationHeaderProperties> = ({
  translationDictionary,
  externalClassName,
}) => {
  // 1. ESTADOS ATÓMICOS DE INTERFAZ
  const [isMobileMenuOpenBoolean, setIsMobileMenuOpenBoolean] = useState(false);
  const [isScrollThresholdExceededBoolean, setIsScrollThresholdExceededBoolean] = useState(false);

  /**
   * @section Gestión de Hardware (Scroll Sentry)
   * 🛡️ LEY ZENITH: Uso de rastro telemétrico para auditar la activación del encabezado.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    const handleWindowScrollAction = () => {
      // Umbral de 40px para la transición visual de 'Sticky'
      setIsScrollThresholdExceededBoolean(window.scrollY > 40);
    };

    window.addEventListener('scroll', handleWindowScrollAction, { passive: true });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: HEADER_MODULE_IDENTIFIER,
      operationCodeLiteral: 'HEADER_ORCHESTRATOR_ACTIVE',
      correlationIdentifier,
      messageContentLiteral: 'Encabezado institucional hidratado y sensores de scroll activos.',
    });

    return () => window.removeEventListener('scroll', handleWindowScrollAction);
  }, []);

  const toggleMobileMenuAction = useCallback(() => {
    setIsMobileMenuOpenBoolean((previousStateBoolean) => !previousStateBoolean);
  }, []);

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

        {/* LADO A: IDENTIDAD (Logo) */}
        <div className="flex-shrink-0">
          <GlobalBrandLogo
            imageWidthPixelQuantity={isScrollThresholdExceededBoolean ? 140 : 180}
            imageHeightPixelQuantity={60}
            isNavigationLinkEnabledBoolean={true}
            labels={{
              logoAlternativeTextLiteral: 'Floripa Dignidade',
              navigationAriaLabelLiteral: translationDictionary.navigationPaths.identity,
            }}
            visualVariantLiteral={isScrollThresholdExceededBoolean ? 'STANDARD' : 'MONOCHROME_WHITE'}
          />
        </div>

        {/* LADO B: NAVEGACIÓN DESKTOP (Radix UI) */}
        <NavigationMenu.Root className="hidden lg:flex relative">
          <NavigationMenu.List className="flex gap-12 items-center">
            <NavigationLink
              hrefLiteral="/identidad"
              labelLiteral={translationDictionary.navigationPaths.identity}
            />
            <NavigationLink
              hrefLiteral="/transparencia"
              labelLiteral={translationDictionary.navigationPaths.transparency}
            />
            <NavigationLink
              hrefLiteral="/prensa"
              labelLiteral={translationDictionary.navigationPaths.press}
            />
          </NavigationMenu.List>
        </NavigationMenu.Root>

        {/* LADO C: ACCIONES (Search + Conversion) */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="w-80">
            <GlobalSearchWidget
              labels={{
                inputPlaceholderLiteral: translationDictionary.actions.searchPlaceholder,
                accessibilityLabelLiteral: translationDictionary.actions.searchPlaceholder,
                searchingStatusLiteral: 'EXPLORANDO...',
              }}
            />
          </div>
          <GlobalActionButton
            visualIntentConfigurationLiteral="CONVERSION"
            actionIdentifierLiteral="HEADER_DONATE_CTA"
            className="px-10"
          >
            <Heart className="w-4 h-4 fill-current" />
            <span>{translationDictionary.actions.donateCallToAction}</span>
          </GlobalActionButton>
        </div>

        {/* DISPARADOR MÓVIL (Touch-First) */}
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

      {/* COMPONENTE DE CAJÓN (Delegación Atómica) */}
      <MobileNavigationDrawer
        isOpenBoolean={isMobileMenuOpenBoolean}
        translationDictionary={translationDictionary}
      />
    </header>
  );
};
