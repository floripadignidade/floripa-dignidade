'use client';

/**
 * @section Composite UI - Main Navigation Header (Orchestrator)
 * @description Punto de ensamblaje soberano para la navegación institucional.
 * Gestiona el ciclo de vida del scroll, la visibilidad del enjambre móvil y
 * la inyección de herramientas de conversión (Donaciones/Búsqueda).
 *
 * Protocolo OEDP-V17.0 - Swiss-Watch Architecture & High Performance SRE.
 * SANEADO Zenith: Erradicación de código muerto (TS6133), optimización de identidad y memorización.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useCallback, useEffect, useMemo, useState } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

/** 🛡️ SANEADO Zenith: Miembros ordenados alfabéticamente (ISO Sort) */
import { Heart, Menu, X } from 'lucide-react';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier
} from '@floripa-dignidade/telemetry';

/* 2. Primitivos y Utilidades Sincronizadas (Shared Swarm) */
import {
  GlobalActionButton,
  GlobalBrandLogo,
  GlobalSearchWidget
} from '../ui-primitives';
import { GlobalStyleClassMerger } from '../utility/GlobalStyleMerger';

/* 3. Átomos y Moléculas Locales (Enjambre Atomizado) */
import { NavigationLink } from './navigation-header/atoms/NavigationLink';
import { MobileNavigationDrawer } from './navigation-header/molecules/MobileNavigationDrawer';
import type { IMainNavigationHeaderI18n } from './i18n/MainNavigationHeaderI18n.schema';

/**
 * @interface IGlobalMainNavigationHeaderProperties
 * @description Contrato inmutable para el componente de navegación superior.
 */
interface IGlobalMainNavigationHeaderProperties {
  /** Diccionario de traducciones validado por la aduana lingüística. */
  readonly translationDictionary: IMainNavigationHeaderI18n;
  /** Ruta activa para el resaltado visual de la sección. */
  readonly currentActivePathLiteral?: string;
  /** Clases externas para ajustes de profundidad (Z-Index) o margen. */
  readonly externalClassName?: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const HEADER_MODULE_IDENTIFIER = 'MAIN_NAVIGATION_HEADER_COMPOSITE';

/**
 * Componente funcional de navegación global.
 * Implementa estrategias de visibilidad condicional y rastro telemétrico.
 */
export const GlobalMainNavigationHeader: React.FC<IGlobalMainNavigationHeaderProperties> = ({
  translationDictionary,
  externalClassName,
}) => {
  // --- ESTADOS ATÓMICOS ---
  const [isMobileMenuOpenBoolean, setIsMobileMenuOpenBoolean] = useState(false);
  const [hasUserScrolledPastThresholdBoolean, setHasUserScrolledPastThresholdBoolean] = useState(false);

  // --- ESCUCHA DE SENSORES (Hardware Listeners) ---
  useEffect(() => {
    /**
     * 🛡️ SANEADO Zenith: La identidad se genera dentro del efecto
     * para evitar creaciones de UUID innecesarias en cada re-render.
     */
    const correlationIdentifier = GenerateCorrelationIdentifier();

    const handleWindowScrollEvent = () => {
      /** Umbral de activación para la firma visual Glassmorphism (40px) */
      const scrollThresholdInPixelsQuantity = 40;
      setHasUserScrolledPastThresholdBoolean(window.scrollY > scrollThresholdInPixelsQuantity);
    };

    /** Optimización: Passive Listener para fluidez total en mobile */
    window.addEventListener('scroll', handleWindowScrollEvent, { passive: true });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: HEADER_MODULE_IDENTIFIER,
      operationCodeLiteral: 'HEADER_MOUNTED_AND_ACTIVE',
      correlationIdentifier,
      messageContentLiteral: 'Encabezado institucional hidratado y sincronizado con sensores físicos.'
    });

    return () => window.removeEventListener('scroll', handleWindowScrollEvent);
  }, []);

  /**
   * Orquesta el estado de visibilidad del cajón móvil.
   */
  const toggleMobileMenuAction = useCallback(() => {
    setIsMobileMenuOpenBoolean((previousStateBoolean) => !previousStateBoolean);
  }, []);

  // --- ARQUITECTURA DE ESTILOS (Performance SRE) ---
  /**
   * Memorizamos la fusión de clases para proteger el hilo principal durante el scroll.
   */
  const headerContainerStylesLiteral = useMemo(() => GlobalStyleClassMerger(
    "fixed top-0 w-full z-[100] transition-all duration-500 border-b",
    hasUserScrolledPastThresholdBoolean
      ? "bg-white/90 backdrop-blur-md py-2 shadow-2xl border-slate-200"
      : "bg-transparent py-6 border-transparent",
    externalClassName
  ), [hasUserScrolledPastThresholdBoolean, externalClassName]);

  return (
    <header className={headerContainerStylesLiteral} role="banner">
      <div className="container mx-auto px-4 flex items-center justify-between">

        {/* LADO IZQUIERDO: Identidad Soberana */}
        <div className="flex-shrink-0">
          <GlobalBrandLogo
            imageWidthPixelQuantity={hasUserScrolledPastThresholdBoolean ? 140 : 180}
            labels={{
              logoAlternativeTextLiteral: "Floripa Dignidade",
              navigationAriaLabelLiteral: "Volver a la página de inicio"
            }}
          />
        </div>

        {/* CENTRO: Navegación Estratégica (Desktop Only) */}
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

        {/* LADO DERECHO: Herramientas de Conversión (Desktop Only) */}
        <div className="hidden lg:flex items-center gap-8">
          <div className="w-80">
            <GlobalSearchWidget
              placeholderTextLiteral={translationDictionary.actions.searchPlaceholder}
            />
          </div>
          <GlobalActionButton visualIntentConfiguration="CONVERSION" className="px-10">
            <Heart className="w-4 h-4 fill-current" />
            <span>{translationDictionary.actions.donateCallToAction}</span>
          </GlobalActionButton>
        </div>

        {/* GESTIÓN DE FRONTERA MÓVIL (ISO Accessibility) */}
        <button
          className="lg:hidden p-3 text-navy-900 rounded-2xl bg-white/50 backdrop-blur shadow-sm border border-white focus:ring-2 focus:ring-amber-500 transition-all active:scale-90"
          onClick={toggleMobileMenuAction}
          aria-expanded={isMobileMenuOpenBoolean}
          aria-label={translationDictionary.actions.mobileMenuToggle}
        >
          {isMobileMenuOpenBoolean ? <X size={28} /> : <Menu size={28} />}
        </button>
      </div>

      {/* CAJÓN DE NAVEGACIÓN (Enjambre Atómico) */}
      <MobileNavigationDrawer
        isOpenBoolean={isMobileMenuOpenBoolean}
        translationDictionary={translationDictionary}
      />
    </header>
  );
};
