'use client';

/**
 * @section UI Atoms - Feature Action Card
 * @description Tarjeta de presentación de funcionalidades y pilares estratégicos
 * con variantes semánticas de intención visual. Delega la validación estructural en
 * `FeatureActionCardPropertiesSchema`, la observabilidad en `useFeatureCardExposureTelemetry`
 * y garantiza unicidad de identificadores ARIA mediante `useId()` de React 19.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useId, useMemo } from 'react';

/* 1. Utilidades Transversales */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/* 2. Contrato Local y Hook de Telemetría (Clean Paths) */
import {
  FeatureActionCardPropertiesSchema,
  type IFeatureActionCardProperties,
  type TFeatureActionVisualVariant,
} from '../schemas/FeatureActionCard.schema';
import { useFeatureCardExposureTelemetry } from './hooks/useFeatureCardExposureTelemetry';

export {
  FeatureActionCardPropertiesSchema,
  type IFeatureActionCardProperties,
  type TFeatureActionVisualVariant,
};

/** Mapa inmutable de estilos por variante semántica para rendimiento a 120 FPS. */
const VARIANT_STYLES_MAPPING: Readonly<Record<TFeatureActionVisualVariant, string>> = Object.freeze(
  {
    RED: 'bg-red-50 text-red-600',
    BLUE: 'bg-blue-50 text-blue-600',
    AMBER: 'bg-amber-50 text-amber-600',
  },
);

/**
 * Representa visualmente un pilar estratégico del portal ciudadano con accesibilidad WCAG.
 *
 * @param propertiesSnapshot - Propiedades inyectadas por el orquestador de sección.
 * @returns {React.ReactElement} Tarjeta visual auditada, accesible y validada por Zod.
 */
export const FeatureActionCard: React.FC<IFeatureActionCardProperties> = (propertiesSnapshot) => {
  const {
    graphicIconNode,
    headlineTitleLiteral,
    contentDescriptionLiteral,
    visualVariantLiteral,
    featureIdentifierLiteral,
  } = FeatureActionCardPropertiesSchema.parse(propertiesSnapshot);

  useFeatureCardExposureTelemetry({
    headlineTitleLiteral,
    featureIdentifierLiteral,
    visualVariantLiteral,
  });

  const reactInstanceIdentifier = useId();
  const headingElementIdentifier = `feature-title-${featureIdentifierLiteral}-${reactInstanceIdentifier}`;

  const iconContainerStylesLiteral = useMemo(
    () =>
      GlobalStyleClassMerger(
        'w-14 h-14 rounded-2xl flex items-center justify-center shadow-inner transition-transform group-hover:scale-110',
        VARIANT_STYLES_MAPPING[visualVariantLiteral],
      ),
    [visualVariantLiteral],
  );

  return (
    <article
      className="flex flex-col items-start gap-5 p-6 rounded-3xl transition-all duration-500 hover:bg-white hover:shadow-xl group border border-transparent hover:border-slate-100"
      aria-labelledby={headingElementIdentifier}
    >
      <div className={iconContainerStylesLiteral} aria-hidden="true">
        {graphicIconNode}
      </div>

      <div className="flex flex-col gap-2">
        <h3
          id={headingElementIdentifier}
          className="text-2xl font-black text-slate-900 tracking-tight"
        >
          {headlineTitleLiteral}
        </h3>
        <p className="text-slate-500 leading-relaxed font-medium">{contentDescriptionLiteral}</p>
      </div>
    </article>
  );
};
