/**
 * @section UI Molecule - Unauthorized Security & Roadmap Alert Banner
 * @description Banner accesible (`role="alert"`) que informa al ciudadano sobre el
 * registro seguro de auditoría y la futura activación de sistemas pendientes
 * (notificaciones de gobernanza y verificación de identidad `gov.br` Prata/Ouro).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0029).
 * Normas: ISO/IEC 11179, ISO/IEC 25010 y W3C WCAG 2.2 AAA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { BellRing } from 'lucide-react';

import type { IUnauthorizedPageI18n } from '../i18n/schemas/UnauthorizedPage.i18n.schema';

interface IUnauthorizedAccessAlertBannerProperties {
  readonly systemAlertDictionary: IUnauthorizedPageI18n['systemAlert'];
}

/**
 * Renderiza la alerta visual informativa sobre trazabilidad y próxima habilitación `gov.br`.
 *
 * @param propertiesSnapshot - Literales localizados para el bloque de alerta del sistema.
 * @returns {React.ReactElement} Alerta semántica con contraste WCAG 2.2 garantizado.
 */
export const UnauthorizedAccessAlertBanner: React.FC<IUnauthorizedAccessAlertBannerProperties> = ({
  systemAlertDictionary,
}) => (
  <aside
    role="alert"
    aria-live="polite"
    className="text-left p-6 md:p-8 mb-12 rounded-3xl bg-amber-50/80 border border-amber-200 shadow-sm max-w-2xl mx-auto"
  >
    <div className="flex items-start gap-4">
      <div
        className="w-11 h-11 rounded-2xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-sm"
        aria-hidden="true"
      >
        <BellRing size={22} />
      </div>

      <div className="flex flex-col gap-2">
        <h2 className="text-base font-black text-slate-900 uppercase tracking-tight">
          {systemAlertDictionary.titleLiteral}
        </h2>
        <p className="text-sm text-slate-700 leading-relaxed font-medium mb-0">
          {systemAlertDictionary.descriptionLiteral}
        </p>
        <p className="text-xs font-bold text-navy-900 pt-2 border-t border-amber-200/70 mb-0">
          {systemAlertDictionary.roadmapNoteLiteral}
        </p>
      </div>
    </div>
  </aside>
);
