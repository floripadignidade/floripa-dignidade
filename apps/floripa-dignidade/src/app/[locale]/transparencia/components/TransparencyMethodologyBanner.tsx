/**
 * @file apps/floripa-dignidade/src/app/[locale]/transparencia/components/TransparencyMethodologyBanner.tsx
 * @section Transparency Gazette UI - Editorial Methodology Banner (Atom)
 * @description Renderiza el sello institucional de metodología editorial, independencia
 * cívica y fundamento jurídico (LAI Lei 12.527/2011, MROSC Lei 13.019/2014 y LGPD
 * Lei 13.709/2018) para el Periódico de Transparencia Activa. Diseñado como Server
 * Component puro con contraste WCAG 2.2 Nivel AAA (>= 7:1) y cero cadenas fijas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029 / ADR 0035).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type React from 'react';
import { useId } from 'react';
import { Scale, ShieldCheck } from 'lucide-react';

import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

import type { ITransparencyPageI18n } from '../i18n/schemas/TransparencyPage.i18n.schema';

/**
 * @interface ITransparencyMethodologyBannerProperties
 * @description Contrato inmutable de propiedades para el banner metodológico y legal.
 */
export interface ITransparencyMethodologyBannerProperties {
  /** Snapshot localizado del bloque `methodologyBanner` validado por `TransparencyPageI18nSchema`. */
  readonly methodologyBannerDictionary: ITransparencyPageI18n['methodologyBanner'];
  /** Clases CSS opcionales para composición externa del contenedor. */
  readonly externalClassName?: string;
}

/**
 * Renderiza el bloque institucional de transparencia editorial y respaldo normativo.
 *
 * @param propertiesSnapshot - Snapshot inmutable con literales localizados del sello metodológico.
 * @returns {React.JSX.Element} Sección semántica accesible con contraste WCAG 2.2 AAA.
 */
export const TransparencyMethodologyBanner: React.FC<ITransparencyMethodologyBannerProperties> = ({
  methodologyBannerDictionary,
  externalClassName,
}) => {
  const componentInstanceIdentifier = useId();
  const headingElementIdentifier = `transparency-methodology-heading-${componentInstanceIdentifier}`;

  return (
    <section
      aria-labelledby={headingElementIdentifier}
      className={GlobalStyleClassMerger(
        'w-full relative overflow-hidden rounded-[2.5rem] bg-navy-950 text-white border border-navy-800 shadow-2xl p-8 md:p-12 lg:p-14',
        externalClassName,
      )}
    >
      <div
        className="absolute top-0 right-0 w-1/3 h-full translate-x-16 skew-x-12 bg-amber-500/10 pointer-events-none"
        aria-hidden="true"
      />

      <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
        <div className="flex items-start gap-5 max-w-3xl">
          <div
            className="w-12 h-12 rounded-2xl bg-navy-900 border border-white/20 text-amber-300 flex items-center justify-center flex-shrink-0 shadow-inner"
            aria-hidden="true"
          >
            <ShieldCheck size={24} />
          </div>

          <div className="flex flex-col gap-3">
            <h2
              id={headingElementIdentifier}
              className="text-2xl lg:text-3xl font-black font-display tracking-tight text-white leading-tight"
            >
              {methodologyBannerDictionary.headlineLiteral}
            </h2>

            <p className="text-sm md:text-base text-slate-100 leading-relaxed font-medium mb-0">
              {methodologyBannerDictionary.descriptionLiteral}
            </p>
          </div>
        </div>

        <div className="lg:max-w-md w-full lg:w-auto flex-shrink-0">
          <div className="inline-flex lg:flex items-center gap-3 px-5 py-3.5 rounded-2xl bg-navy-900 border border-white/20 text-amber-300 text-xs font-extrabold tracking-wide leading-relaxed">
            <Scale size={18} className="flex-shrink-0 text-amber-300" aria-hidden="true" />
            <span>{methodologyBannerDictionary.legalBasisLiteral}</span>
          </div>
        </div>
      </div>
    </section>
  );
};
