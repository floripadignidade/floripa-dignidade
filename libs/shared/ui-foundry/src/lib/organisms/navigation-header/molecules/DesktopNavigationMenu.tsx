'use client';

/**
 * @section Shared UI Foundry - Desktop Navigation Menu (Molecule)
 * @description Ensamble de enlaces institucionales para hardware de escritorio.
 * Implementa la orquestación visual de las rutas primarias del portal mediante
 * los primitivos de Radix UI para cumplimiento de accesibilidad (WAI-ARIA).
 *
 * Protocolo OEDP-V17.0 - High Performance UI & SRE Resilience.
 * SANEADO Zenith: Telemetría de montaje, Prosa ISO estricta,
 * soporte de clases perimetrales y optimización de renderizado (useMemo).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import * as NavigationMenu from '@radix-ui/react-navigation-menu';

/* 1. Infraestructura Core y Utilidades (Sovereign Swarm) */
import { EmitTelemetrySignal, GenerateCorrelationIdentifier } from '@floripa-dignidade/telemetry';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Planos y Contratos (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/* 3. Enjambre Atómico Local (Internal Swarm) */
import { NavigationLink } from '../atoms/NavigationLink';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MOLECULE_IDENTIFIER = 'DESKTOP_NAVIGATION_MENU_MOLECULE';

/**
 * @interface IDesktopNavigationMenuProperties
 * @description Contrato inmutable para la parametrización del menú de escritorio.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
export interface IDesktopNavigationMenuProperties {
  /** Fragmento del diccionario lingüístico dedicado a las rutas de navegación. */
  readonly translationDictionarySnapshot: IMainNavigationHeaderI18n['navigationPaths'];
  /** Clases CSS externas para ajustes de posicionamiento perimetral. */
  readonly externalClassName?: string;
}

/**
 * Aparato encargado de la disposición estructural de la jerarquía de enlaces
 * en resoluciones grandes (Desktop/Tablet Landscape).
 *
 * @param propertiesSnapshot - Snapshot de configuración inyectado por el orquestador.
 * @returns {React.ReactElement} Enjambre de enlaces WAI-ARIA compliant.
 */
export const DesktopNavigationMenu: React.FC<IDesktopNavigationMenuProperties> = ({
  translationDictionarySnapshot,
  externalClassName,
}) => {
  // --- 1. TELEMETRÍA DE MONTAJE (SRE Visibility) ---
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      severityLevelLiteral: 'DEBUG',
      moduleIdentifierLiteral: MOLECULE_IDENTIFIER,
      operationCodeLiteral: 'DESKTOP_MENU_MOUNTED',
      correlationIdentifier,
      messageContentLiteral: 'Menú de navegación de escritorio ensamblado e inicializado.',
      semanticIntentTag: 'UI_COMPONENT_MOUNT',
      contextMetadataSnapshot: {
        timestampISO: new Date().toISOString(),
      },
    });
  }, []);

  // --- 2. ARQUITECTURA DE ESTILOS (Memoized Performance) ---
  const containerStylesLiteral = useMemo(
    () => GlobalStyleClassMerger('hidden lg:flex relative', externalClassName),
    [externalClassName],
  );

  // --- 3. ENSAMBLAJE VISUAL (Atomic Composition) ---
  return (
    <NavigationMenu.Root className={containerStylesLiteral}>
      <NavigationMenu.List className="flex gap-12 items-center" aria-label="Navegación Primaria">
        {/* EJE DE IDENTIDAD */}
        <NavigationLink
          hrefLiteral="/identidad"
          labelLiteral={translationDictionarySnapshot.identity}
          linkIdentifierLiteral="NAV_LINK_IDENTITY"
        />

        {/* EJE DE TRANSPARENCIA */}
        <NavigationLink
          hrefLiteral="/transparencia"
          labelLiteral={translationDictionarySnapshot.transparency}
          linkIdentifierLiteral="NAV_LINK_TRANSPARENCY"
        />

        {/* EJE DE PRENSA Y DIFUSIÓN */}
        <NavigationLink
          hrefLiteral="/prensa"
          labelLiteral={translationDictionarySnapshot.press}
          linkIdentifierLiteral="NAV_LINK_PRESS"
        />
      </NavigationMenu.List>
    </NavigationMenu.Root>
  );
};
