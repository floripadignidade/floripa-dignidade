'use client';

/**
 * @section Shared UI Foundry - Main Navigation Header (Orchestrator)
 * @description Orquestador supremo de la navegación institucional. Ensambla el
 * enjambre de descubrimiento, identidad de marca y controles de acceso móvil.
 * Implementa una arquitectura de respuesta al scroll para optimizar el
 * contraste visual y el rendimiento (SRE Performance).
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de directivas de supresión obsoletas (Fix TS2578),
 * cumplimiento de Prosa ISO 11179 e integridad de tipos de contratos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo, useRef } from 'react';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm - Clean Paths) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer - Redirección de ADN Maestro) */
/** 🛡️ SANEADO Zenith: Importación nominal validada por el Santuario de Tipos. */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Swiss-Watch Swarm - Clean Paths) */
import { GlobalBrandLogo } from '../atoms/GlobalBrandLogo';
import { useHeaderSentry } from './navigation-header/hooks/useHeaderSentry';
import { DesktopNavigationMenu } from './navigation-header/molecules/DesktopNavigationMenu';
import { MobileNavigationDrawer } from './navigation-header/molecules/MobileNavigationDrawer';
import { NavigationActionsSwarm } from './navigation-header/molecules/NavigationActionsSwarm';
import { NavigationMobileTrigger } from './navigation-header/atoms/NavigationMobileTrigger';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MAIN_NAVIGATION_HEADER_ORCHESTRATOR';

/**
 * @interface IGlobalMainNavigationHeaderProperties
 * @description Contrato inmutable para la parametrización del encabezado global.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
export interface IGlobalMainNavigationHeaderProperties {
  /** Diccionario de traducciones íntegro validado por la aduana Zod. */
  readonly translationDictionary: IMainNavigationHeaderI18n;
  /** Clases CSS externas para ajustes de posicionamiento perimetral. */
  readonly externalClassName?: string;
}

/**
 * Componente encargado de la orquestación de la identidad y tránsito ciudadano.
 * Implementa vigilancia sensorial de hardware (Scroll) y telemetría de montaje.
 *
 * @param propertiesSnapshot - Snapshot de configuración y lenguaje.
 * @returns {React.ReactElement} Estructura de navegación de alta fidelidad.
 */
export const GlobalMainNavigationHeader: React.FC<IGlobalMainNavigationHeaderProperties> = (
  propertiesSnapshot,
) => {
  const { translationDictionary, externalClassName } = propertiesSnapshot;

  // --- 1. INYECCIÓN DE INTELIGENCIA SENSORIAL (Sensor Swarm) ---
  const { isMobileMenuOpenBoolean, isScrollThresholdExceededBoolean, toggleMobileMenuAction } =
    useHeaderSentry(ORCHESTRATOR_IDENTIFIER);

  /** 🛡️ SRE SENTRY: Previene doble rastro en React 19 Strict Mode. */
  const hasMountedBooleanReference = useRef(false);

  // --- 2. TELEMETRÍA DE MONTAJE (Audit Trail) ---
  useEffect(() => {
    if (hasMountedBooleanReference.current) return;
    hasMountedBooleanReference.current = true;

    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
      operationCodeLiteral: 'HEADER_ORCHESTRATOR_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: 'Encabezado institucional activo y sensores de hardware vinculados.',
      semanticIntentTag: 'UI_COMPONENT_MOUNT',
      contextMetadataSnapshot: {
        renderTimestampISO: new Date().toISOString(),
      },
    });
  }, []);

  /**
   * @section Arquitectura de Estilos Dinámicos
   * 🛡️ LEY SRE: El uso de 'useMemo' protege el Main Thread ante re-renderizados
   * por ráfagas de scroll, asegurando que la fusión de clases no degrade el INP.
   */
  const headerContainerStylesLiteral = useMemo(
    () =>
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
    <header
      className={headerContainerStylesLiteral}
      role="banner"
      aria-label="Navegación Institucional Principal"
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        {/* ÁREA A: IDENTIDAD (Logo Atom) */}
        <GlobalBrandLogo
          imageWidthPixelQuantity={isScrollThresholdExceededBoolean ? 140 : 180}
          imageHeightPixelQuantity={60}
          isNavigationLinkEnabledBoolean={true}
          isPolymorphicBoolean={false}
          forensicTestIdentifier="BRAND_LOGO_MAIN_HEADER"
          labels={{
            logoAlternativeTextLiteral: 'Floripa Dignidade',
            navigationAriaLabelLiteral: translationDictionary.navigationPaths.identity,
          }}
          visualVariantLiteral={isScrollThresholdExceededBoolean ? 'STANDARD' : 'MONOCHROME_WHITE'}
        />

        {/* ÁREA B: NAVEGACIÓN ESCRITORIO (Molecule Swarm) */}
        <DesktopNavigationMenu
          translationDictionarySnapshot={translationDictionary.navigationPaths}
        />

        {/* ÁREA C: ACCIONES DE CONVERSIÓN (Discovery & Conversion Swarm) */}
        <NavigationActionsSwarm actionsDictionary={translationDictionary.actions} />

        {/* ÁREA D: DISPARADOR TÁCTIL (Atom Delegation) */}
        <NavigationMobileTrigger
          isOpenBoolean={isMobileMenuOpenBoolean}
          isScrolledBoolean={isScrollThresholdExceededBoolean}
          toggleAction={toggleMobileMenuAction}
          ariaLabelLiteral={translationDictionary.actions.mobileMenuToggle}
        />
      </div>

      {/* CAJÓN DE NAVEGACIÓN MÓVIL (Off-canvas Molecule) */}
      <MobileNavigationDrawer
        isOpenBoolean={isMobileMenuOpenBoolean}
        translationDictionary={translationDictionary}
      />
    </header>
  );
};
