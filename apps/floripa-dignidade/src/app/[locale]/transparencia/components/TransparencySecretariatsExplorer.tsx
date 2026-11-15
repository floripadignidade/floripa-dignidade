'use client';

/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencySecretariatsExplorer.tsx
 * @section Transparency Gazette UI - Interactive Secretariats Explorer (Organism)
 * @description Organismo cliente encargado de coordinar el estado de filtrado instantáneo
 * por secretaría municipal (`CLS = 0`, sin recarga de página) entre `SecretariatFilterTabs`
 * y `SecretariatDeskSection`, preservando serialización limpia desde el Server Component.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { useId, useMemo, useState } from 'react';

import type { ITransparencyPageI18n } from '../i18n/schemas/TransparencyPage.i18n.schema';
import { SecretariatDeskSection } from './SecretariatDeskSection';
import { ALL_SECRETARIATS_FILTER_IDENTIFIER, SecretariatFilterTabs } from './SecretariatFilterTabs';

/**
 * @interface ITransparencySecretariatsExplorerProperties
 * @description Contrato inmutable de propiedades serializables inyectadas desde `page.tsx`.
 */
export interface ITransparencySecretariatsExplorerProperties {
  readonly navigationDictionary: ITransparencyPageI18n['navigation'];
  readonly secretariatsSectionDictionary: ITransparencyPageI18n['secretariatsSection'];
  readonly statusLabelsDictionary: ITransparencyPageI18n['statusLabels'];
  readonly activeLocaleLiteral: string;
}

/**
 * Orquesta el filtrado interactivo en tiempo real de los cuadernos por secretaría.
 *
 * @param propertiesSnapshot - Diccionarios localizados e idioma activo validado.
 * @returns {React.JSX.Element} Barra sticky de pestañas y cuadernos filtrados.
 */
export const TransparencySecretariatsExplorer: React.FC<
  ITransparencySecretariatsExplorerProperties
> = ({
  navigationDictionary,
  secretariatsSectionDictionary,
  statusLabelsDictionary,
  activeLocaleLiteral,
}) => {
  const componentInstanceIdentifier = useId();
  const sectionHeadingIdentifier = `secretariats-section-heading-${componentInstanceIdentifier}`;

  const [activeSecretariatIdentifier, setActiveSecretariatIdentifier] = useState<string>(
    ALL_SECRETARIATS_FILTER_IDENTIFIER,
  );

  const totalArticlesCountQuantity = useMemo(
    () =>
      secretariatsSectionDictionary.secretariatsCollection.reduce(
        (accumulatedQuantity, currentDeskSnapshot) =>
          accumulatedQuantity + currentDeskSnapshot.articlesCollection.length,
        0,
      ),
    [secretariatsSectionDictionary.secretariatsCollection],
  );

  const displayedSecretariatsCollection = useMemo(() => {
    if (activeSecretariatIdentifier === ALL_SECRETARIATS_FILTER_IDENTIFIER) {
      return secretariatsSectionDictionary.secretariatsCollection;
    }

    return secretariatsSectionDictionary.secretariatsCollection.filter(
      (secretariatSnapshot) =>
        secretariatSnapshot.secretariatIdentifier === activeSecretariatIdentifier,
    );
  }, [activeSecretariatIdentifier, secretariatsSectionDictionary.secretariatsCollection]);

  return (
    <section aria-labelledby={sectionHeadingIdentifier} className="w-full">
      <SecretariatFilterTabs
        secretariatsCollection={secretariatsSectionDictionary.secretariatsCollection}
        activeSecretariatIdentifier={activeSecretariatIdentifier}
        allSecretariatsLabelLiteral={navigationDictionary.allSecretariatsLabelLiteral}
        filterHeadingLiteral={navigationDictionary.filterHeadingLiteral}
        totalArticlesCountQuantity={totalArticlesCountQuantity}
        articlesCountSuffixLiteral={navigationDictionary.articlesCountSuffixLiteral}
        onSelectSecretariatAction={setActiveSecretariatIdentifier}
      />

      <div className="container mx-auto px-4 pt-12 lg:pt-16">
        <header className="max-w-3xl mb-4">
          <h2
            id={sectionHeadingIdentifier}
            className="text-3xl lg:text-5xl font-black font-display text-navy-950 tracking-tight mb-4"
          >
            {secretariatsSectionDictionary.sectionHeadingLiteral}
          </h2>
          <p className="text-base lg:text-lg text-slate-700 leading-relaxed font-medium mb-0">
            {secretariatsSectionDictionary.sectionSubtitleLiteral}
          </p>
        </header>

        <SecretariatDeskSection
          displayedSecretariatsCollection={displayedSecretariatsCollection}
          summaryHeadingLiteral={secretariatsSectionDictionary.summaryHeadingLiteral}
          sourcePrefixLiteral={secretariatsSectionDictionary.sourcePrefixLiteral}
          activeLocaleLiteral={activeLocaleLiteral}
          statusLabelsDictionary={statusLabelsDictionary}
        />
      </div>
    </section>
  );
};
