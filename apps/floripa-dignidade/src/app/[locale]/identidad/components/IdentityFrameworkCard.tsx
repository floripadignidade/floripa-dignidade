/**
 * @file apps/floripa-dignidade/src/app/[locale]/identidad/components/IdentityFrameworkCard.tsx
 * @section Institutional Identity - Legal Framework Card (Atom)
 * @description Renderiza la sección de encuadre normativo MROSC (Lei Federal 13.019/2014)
 * y personería jurídica de la organización civil.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & WCAG 2.2 AAA).
 * Normas: ISO/IEC 11179 e ISO/IEC 25010.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { Award, FileText } from 'lucide-react';

import type { IIdentityPageI18n } from '../i18n/schemas/IdentityPage.i18n.schema';

interface IIdentityFrameworkCardProperties {
  readonly frameworkDictionary: IIdentityPageI18n['framework'];
}

export const IdentityFrameworkCard: React.FC<IIdentityFrameworkCardProperties> = ({
  frameworkDictionary,
}) => (
  <section className="max-w-5xl w-full mb-20 p-8 lg:p-12 rounded-[2.5rem] bg-white border border-slate-200 shadow-xl">
    <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8 border-b border-slate-100 pb-6">
      <div>
        <span className="inline-block text-xs font-black uppercase tracking-[0.15em] text-amber-600 mb-2">
          {frameworkDictionary.badgeLiteral}
        </span>
        <h2 className="text-2xl lg:text-3xl font-black text-navy-900 tracking-tight">
          {frameworkDictionary.headlineLiteral}
        </h2>
      </div>
      <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-bold text-slate-600">
        <Award size={16} className="text-amber-500" aria-hidden="true" />
        <span>{frameworkDictionary.legalFormLiteral}</span>
      </div>
    </div>

    <p className="text-base text-slate-600 leading-relaxed mb-6 font-medium">
      {frameworkDictionary.descriptionLiteral}
    </p>

    <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
      <FileText size={14} aria-hidden="true" />
      <span>{frameworkDictionary.territorialJurisdictionLiteral}</span>
    </div>
  </section>
);
