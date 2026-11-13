'use client';

/**
 * @section Shared UI Foundry - Main Navigation Header (Orchestrator)
 * @description Orquestador de navegación institucional del portal ciudadano.
 * Ensambla identidad visual, menú de escritorio, acciones de descubrimiento/conversión,
 * disparador móvil y cajón lateral táctil delegando lógica de contraste y telemetría
 * en átomos especializados (OEDP-V18.1).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) y WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useMemo } from 'react';

import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';
import type { ModuleIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalBrandLogo } from '../atoms/GlobalBrandLogo';
import { NavigationMobileTrigger } from './navigation-header/atoms/NavigationMobileTrigger';
import { useHeaderMountTelemetry } from './navigation-header/hooks/useHeaderMountTelemetry';
import { useHeaderSentry } from './navigation-header/hooks/useHeaderSentry';
import {
  ResolveHeaderPresentationState,
  type THeaderSurfaceToneLiteral,
} from './navigation-header/logic/ResolveHeaderPresentationState';
import { DesktopNavigationMenu } from './navigation-header/molecules/DesktopNavigationMenu';
import { MobileNavigationDrawer } from './navigation-header/molecules/MobileNavigationDrawer';
import { NavigationActionsSwarm } from './navigation-header/molecules/NavigationActionsSwarm';

const HEADER_ORCHESTRATOR_MODULE_IDENTIFIER =
  'MAIN_NAVIGATION_HEADER_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @interface IGlobalMainNavigationHeaderProperties
 * @description Contrato inmutable de propiedades para el encabezado institucional global.
 */
export interface IGlobalMainNavigationHeaderProperties {
  /** Diccionario de traducciones validado contra `MainNavigationHeaderI18nSchema`. */
  readonly translationDictionary: IMainNavigationHeaderI18n;
  /** Tono de superficie subyacente en reposo (`LIGHT` por defecto para contraste WCAG). */
  readonly surfaceToneLiteral?: THeaderSurfaceToneLiteral;
  /** Clases CSS externas para ajustes de layout perimetral. */
  readonly externalClassName?: string;
}

export type { THeaderSurfaceToneLiteral };

/**
 * Orquesta la navegación superior responsiva con contraste garantizado desde `scroll = 0`.
 *
 * @param propertiesSnapshot - Diccionario localizado y configuración opcional de superficie.
 * @returns {React.ReactElement} Encabezado institucional accesible y atomizado.
 */
export const GlobalMainNavigationHeader: React.FC<IGlobalMainNavigationHeaderProperties> = (
  propertiesSnapshot,
) => {
  const {
    translationDictionary,
    surfaceToneLiteral = 'LIGHT',
    externalClassName,
  } = propertiesSnapshot;

  const { isMobileMenuOpenBoolean, isScrollThresholdExceededBoolean, toggleMobileMenuAction } =
    useHeaderSentry(HEADER_ORCHESTRATOR_MODULE_IDENTIFIER);

  useHeaderMountTelemetry(HEADER_ORCHESTRATOR_MODULE_IDENTIFIER);

  const presentationStateSnapshot = useMemo(
    () =>
      ResolveHeaderPresentationState({
        isScrollThresholdExceededBoolean,
        surfaceToneLiteral,
        externalClassName,
      }),
    [isScrollThresholdExceededBoolean, surfaceToneLiteral, externalClassName],
  );

  const headerLandmarkAriaLabelLiteral = `${translationDictionary.navigationPaths.identity} — Floripa Dignidade`;

  return (
    <header
      className={presentationStateSnapshot.containerStylesLiteral}
      role="banner"
      aria-label={headerLandmarkAriaLabelLiteral}
    >
      <div className="container mx-auto px-4 flex items-center justify-between">
        <GlobalBrandLogo
          imageWidthPixelQuantity={presentationStateSnapshot.logoWidthPixelQuantity}
          imageHeightPixelQuantity={60}
          isNavigationLinkEnabledBoolean={true}
          isPolymorphicBoolean={false}
          forensicTestIdentifier="BRAND_LOGO_MAIN_HEADER"
          labels={{
            logoAlternativeTextLiteral: 'Floripa Dignidade',
            navigationAriaLabelLiteral: translationDictionary.navigationPaths.identity,
          }}
          visualVariantLiteral={presentationStateSnapshot.logoVariantLiteral}
        />

        <DesktopNavigationMenu
          translationDictionarySnapshot={translationDictionary.navigationPaths}
        />

        <NavigationActionsSwarm actionsDictionary={translationDictionary.actions} />

        <NavigationMobileTrigger
          isOpenBoolean={isMobileMenuOpenBoolean}
          isScrolledBoolean={presentationStateSnapshot.isDarkForegroundRequiredBoolean}
          toggleAction={toggleMobileMenuAction}
          ariaLabelLiteral={translationDictionary.actions.mobileMenuToggle}
        />
      </div>

      <MobileNavigationDrawer
        isOpenBoolean={isMobileMenuOpenBoolean}
        translationDictionary={translationDictionary}
      />
    </header>
  );
};
