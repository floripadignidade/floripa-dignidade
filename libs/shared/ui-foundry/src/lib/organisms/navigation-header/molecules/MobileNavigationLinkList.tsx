'use client';

/**
 * @section UI Molecule - Mobile Navigation Link List
 * @description Molécula encargada de agrupar y orquestar la colección de enlaces
 * institucionales en el cajón móvil. Implementa el patrón "Swarm Assembly"
 * delegando la interactividad en átomos individuales.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Functional Atomicity.
 * SANEADO Zenith: Resolución de TS2305 (Sincronización de Exportación),
 * validación de ADN lingüístico mediante Zod y cumplimiento de Prosa ISO.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { Info, Newspaper, ShieldCheck } from 'lucide-react';
import { z } from 'zod';

/* 1. Átomos Locales (Internal Swarm - Clean Paths) */
import { MobileNavigationLink } from '../atoms/MobileNavigationLink';

/* 2. ADN Estructural (Blueprints Layer) */
import type { IMainNavigationHeaderI18n } from '@floripa-dignidade/shared-ui-contracts';

/**
 * @section Aduana de ADN (Prop Validation)
 */
const MobileNavigationLinkListPropertiesSchema = z
  .object({
    /** Fragmento del diccionario lingüístico dedicado a las rutas de navegación. */
    translationDictionary: z
      .object({
        identity: z.string().min(1),
        transparency: z.string().min(1),
        press: z.string().min(1),
      })
      .readonly(),
  })
  .readonly();

export interface IMobileNavigationLinkListProperties {
  readonly translationDictionary: IMainNavigationHeaderI18n['navigationPaths'];
}

/**
 * Aparato encargado de la disposición estructural de la jerarquía de enlaces.
 *
 * @param propertiesSnapshot - Snapshot conteniendo los literales localizados.
 * @returns {React.ReactElement} Enjambre de enlaces táctiles.
 */
export const MobileNavigationLinkList: React.FC<IMobileNavigationLinkListProperties> = (
  propertiesSnapshot,
) => {
  // 1. ADUANA DE ADN: Purificación de los literales de navegación
  const { translationDictionary } =
    MobileNavigationLinkListPropertiesSchema.parse(propertiesSnapshot);

  return (
    <div className="flex flex-col gap-2" role="group" aria-label="Links Institucionais">
      {/* 1. EJE DE IDENTIDAD */}
      <MobileNavigationLink
        hrefLiteral="/identidad"
        labelLiteral={translationDictionary.identity}
        iconNode={<Info size={20} aria-hidden="true" />}
      />

      {/* 2. EJE DE TRANSPARENCIA */}
      <MobileNavigationLink
        hrefLiteral="/transparencia"
        labelLiteral={translationDictionary.transparency}
        iconNode={<ShieldCheck size={20} aria-hidden="true" />}
      />

      {/* 3. EJE DE PRENSA Y DIFUSIÓN */}
      <MobileNavigationLink
        hrefLiteral="/prensa"
        labelLiteral={translationDictionary.press}
        iconNode={<Newspaper size={20} aria-hidden="true" />}
      />
    </div>
  );
};
