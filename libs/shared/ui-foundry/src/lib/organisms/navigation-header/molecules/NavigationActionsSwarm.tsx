'use client';

/**
 * @section Shared UI Foundry - Navigation Actions Swarm (Molecule)
 * @description Ensamble de descubrimiento y conversión para el encabezado.
 * Orquesta la búsqueda universal y el llamado a la acción primario.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Rendimiento).
 * SANEADO Turbopack: Erradicación definitiva de extensiones '.js' a favor de Rutas Limpias (Extensionless).
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import React from 'react';
import { Heart } from 'lucide-react';

/* 1. Átomos y Moléculas Locales (Clean Paths) */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';
import { GlobalSearchWidget } from '../../../molecules/GlobalSearchWidget';

/* 2. Planos y Contratos (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @interface INavigationActionsProperties
 * @description Contrato inmutable para los gatillos de conversión del encabezado.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface INavigationActionsProperties {
  /** Fragmento del diccionario lingüístico dedicado a las acciones institucionales. */
  readonly actionsDictionary: IMainNavigationHeaderI18n['actions'];
}

/**
 * Aparato encargado de agrupar las herramientas de interacción rápida en Desktop.
 * Implementa el patrón de ensamble atómico preservando la accesibilidad WAI-ARIA.
 *
 * @param propertiesSnapshot - Snapshot de literales de texto e identificadores.
 * @returns {React.ReactElement} Enjambre de herramientas de búsqueda y conversión.
 */
export const NavigationActionsSwarm: React.FC<INavigationActionsProperties> = (
  propertiesSnapshot,
) => {
  const { actionsDictionary } = propertiesSnapshot;

  return (
    <div className="hidden lg:flex items-center gap-8">
      {/* 1. MOTOR DE DESCUBRIMIENTO (Search Widget Orchestrator) */}
      <div className="w-80">
        <GlobalSearchWidget
          forensicTestIdentifier="HEADER_SEARCH_WIDGET"
          labels={{
            inputPlaceholderLiteral: actionsDictionary.searchPlaceholder,
            accessibilityLabelLiteral: actionsDictionary.searchPlaceholder,
            searchingStatusLiteral: 'EXPLORANDO...',
          }}
        />
      </div>

      {/* 2. GATILLO DE CONVERSIÓN PRIMARIA (Donation Call-To-Action) */}
      <GlobalActionButton
        visualIntentConfigurationLiteral="CONVERSION"
        actionIdentifierLiteral="HEADER_DONATE_CTA"
        className="px-10"
        isPolymorphicBoolean={false}
        forensicTestIdentifier="CTA_HEADER_DONATE"
        accessibilityConfiguration={{
          accessibilityLabelLiteral: actionsDictionary.donateCallToAction,
        }}
      >
        <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
        <span className="uppercase tracking-widest text-xs font-black">
          {actionsDictionary.donateCallToAction}
        </span>
      </GlobalActionButton>
    </div>
  );
};
