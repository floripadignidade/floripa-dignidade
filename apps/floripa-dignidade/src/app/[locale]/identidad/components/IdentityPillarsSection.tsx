/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/components/IdentityPillarsSection.tsx
 * @section Institutional Identity - Impact Pillars Section (Organism)
 * @description Renderiza la tríada de impacto cívico institucional: Pão, Teto e Lei
 * conforme al Manifiesto de Branding e Identidad Visual (ADR 0029).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { HeartHandshake, Home, Scale, Utensils } from 'lucide-react';

import type { IIdentityPageI18n } from '../i18n/schemas/IdentityPage.i18n.schema';

interface IIdentityPillarsSectionProperties {
  readonly pillarsSectionDictionary: IIdentityPageI18n['pillarsSection'];
}

const PILLAR_ICONS_MAPPING: Readonly<Record<string, React.ReactNode>> = Object.freeze({
  PAO: <Utensils size={28} className="text-amber-500" aria-hidden="true" />,
  TETO: <Home size={28} className="text-bridge-500" aria-hidden="true" />,
  LEI: <Scale size={28} className="text-status-error" aria-hidden="true" />,
});

export const IdentityPillarsSection: React.FC<IIdentityPillarsSectionProperties> = ({
  pillarsSectionDictionary,
}) => (
  <section
    className="max-w-6xl w-full mb-20 text-center"
    aria-labelledby="pillars-section-headline"
  >
    <span className="inline-block text-xs font-black uppercase tracking-[0.2em] text-amber-600 mb-3">
      {pillarsSectionDictionary.badgeLiteral}
    </span>
    <h2
      id="pillars-section-headline"
      className="text-3xl lg:text-5xl font-black text-slate-900 tracking-tight mb-4"
    >
      {pillarsSectionDictionary.headlineLiteral}
    </h2>
    <p className="text-lg text-slate-600 max-w-2xl mx-auto mb-12 font-medium">
      {pillarsSectionDictionary.descriptionLiteral}
    </p>

    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
      {pillarsSectionDictionary.pillarsCollection.map((pillarSnapshot) => (
        <article
          key={pillarSnapshot.identifier}
          className="p-8 rounded-[2rem] bg-white border border-slate-100 shadow-md hover:shadow-xl transition-all duration-300 flex flex-col justify-between group"
        >
          <div>
            <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mb-6 border border-slate-100 group-hover:scale-110 transition-transform">
              {PILLAR_ICONS_MAPPING[pillarSnapshot.identifier] ?? (
                <HeartHandshake size={28} className="text-amber-500" aria-hidden="true" />
              )}
            </div>
            <span className="text-xs font-black text-amber-600 uppercase tracking-widest block mb-1">
              {pillarSnapshot.subtitleLiteral}
            </span>
            <h3 className="text-2xl font-black text-slate-900 tracking-tight mb-3">
              {pillarSnapshot.titleLiteral}
            </h3>
            <p className="text-sm text-slate-600 leading-relaxed font-medium">
              {pillarSnapshot.descriptionLiteral}
            </p>
          </div>
        </article>
      ))}
    </div>
  </section>
);
