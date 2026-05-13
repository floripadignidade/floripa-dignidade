'use client';

/**
 * @section Shared UI Foundry - Navigation Actions Swarm (Molecule)
 * @description Ensamble de descubrimiento y conversión para el encabezado.
 * Orquesta la búsqueda universal y el llamado a la acción primario.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Supresión controlada de fricción ambiental (TS7016),
 * inyección de contratos de internacionalización purificados y Prosa ISO.
 *
 * @author Neural Sentinel (IA) en colaboración con Raz Podestá
 * @license UNLICENSED
 */

import React from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Supresión controlada para módulos de terceros en entornos de resolución estricta.
 */
// @ts-expect-error - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { Heart } from 'lucide-react';

/* 1. Átomos y Moléculas (Swiss-Watch Swarm) */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';
import { GlobalSearchWidget } from '../../../molecules/GlobalSearchWidget';

/* 2. Planos y Contratos (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @interface INavigationActionsProperties
 * @description Contrato inmutable para los gatillos de conversión del encabezado.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
interface INavigationActionsProperties {
  /** Fragmento del diccionario lingüístico dedicado a las acciones. */
  readonly actionsDictionary: IMainNavigationHeaderI18n['actions'];
}

/**
 * Aparato encargado de agrupar las herramientas de interacción rápida.
 *
 * @param properties - Literales de texto y labels de accesibilidad inyectados.
 * @returns {React.ReactElement} Enjambre de herramientas de búsqueda y conversión.
 */
export const NavigationActionsSwarm: React.FC<INavigationActionsProperties> = ({
  actionsDictionary
}) => {
  return (
    <div className="hidden lg:flex items-center gap-8">

      {/* 1. MOTOR DE DESCUBRIMIENTO (Search Widget) */}
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

      {/* 2. GATILLO DE CONVERSIÓN PRIMARIA (Donation CTA) */}
      <GlobalActionButton
        visualIntentConfigurationLiteral="CONVERSION"
        actionIdentifierLiteral="HEADER_DONATE_CTA"
        className="px-10"
        /** 🛡️ SANEADO: Cumplimiento del contrato UI Primitives */
        isPolymorphicBoolean={false}
        forensicTestIdentifier="CTA_HEADER_DONATE"
        accessibilityConfiguration={{
          accessibilityLabelLiteral: actionsDictionary.donateCallToAction
        }}
      >
        <Heart className="w-4 h-4 fill-current" aria-hidden="true" />
        <span>{actionsDictionary.donateCallToAction}</span>
      </GlobalActionButton>
    </div>
  );
};
