'use client';

/**
 * @section UI Molecule - Navigation Actions Swarm
 * @description Ensamble de descubrimiento y conversión para el encabezado.
 * Orquesta la búsqueda universal y el llamado a la acción primario.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Erradicación de TS7016 mediante Mapeo de Soberanía e inyección
 * de contratos de internacionalización purificados.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { Heart } from 'lucide-react';

/* 1. Átomos y Moléculas (Swiss-Watch Swarm) */
import { GlobalActionButton } from '../../../atoms/GlobalActionButton';
import { GlobalSearchWidget } from '../../../molecules/GlobalSearchWidget';

/* 2. Planos y Contratos (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @interface INavigationActionsProperties
 * @description Contrato inmutable para los gatillos de conversión del encabezado.
 */
interface INavigationActionsProperties {
  /** Fragmento del diccionario lingüístico dedicado a las acciones. */
  readonly actionsDictionary: IMainNavigationHeaderI18n['actions'];
}

/**
 * Aparato encargado de agrupar las herramientas de interacción rápida.
 *
 * @param properties - Literales de texto y labels de accesibilidad.
 */
export const NavigationActionsSwarm: React.FC<INavigationActionsProperties> = ({
  actionsDictionary
}) => {
  return (
    <div className="hidden lg:flex items-center gap-8">
      {/* 1. MOTOR DE DESCUBRIMIENTO (Search Widget) */}
      <div className="w-80">
        <GlobalSearchWidget
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
