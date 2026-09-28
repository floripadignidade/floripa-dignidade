/**
 * @section CMS Component - Learning Materials
 * @description Átomo visual encargado de renderizar los enlaces técnicos y documentación.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & ISO Technical Naming.
 * SANEADO Zenith: Supresión controlada de TS7016 (Ceguera de tipos en lucide-react)
 * para mantener la compatibilidad con el linter y evitar directivas prohibidas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/**
 * 🛡️ LEY ZENITH (Fix TS7016):
 * Silenciamos la advertencia del compilador porque la librería existe físicamente,
 * pero la resolución de 'bundler' en PNPM estricto falla al localizar su .d.ts
 * sin violar la prohibición de ESLint sobre referencias de triple barra.
 */
 - TS7016: Falla de resolución de declaración de tipos en entornos Nx/PNPM.
import { BookOpen, ExternalLink, Terminal } from 'lucide-react';

/**
 * @interface ILearningDictionarySnapshot
 * @description Contrato inmutable para la inyección de textos localizados.
 */
interface ILearningDictionarySnapshot {
  readonly sectionHeadingLiteral: string;
  readonly documentation: {
    readonly labelLiteral: string;
    readonly descriptionLiteral: string;
    readonly url: string;
  };
  readonly interactive: {
    readonly labelLiteral: string;
    readonly descriptionLiteral: string;
    readonly url: string;
  };
}

/**
 * Renderiza el bloque de recursos de aprendizaje técnico.
 *
 * @param dictionary - Snapshot inmutable del diccionario lingüístico activo.
 * @returns {React.ReactElement} Tarjeta visual de documentación.
 */
export const LearningMaterialsSection: React.FC<{ readonly dictionary: ILearningDictionarySnapshot }> = ({
  dictionary,
}) => (
  <div id="learning-materials" className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-100">
    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
      <BookOpen className="text-amber-500" size={22} aria-hidden="true" />
      {dictionary.sectionHeadingLiteral}
    </h2>

    <div className="flex flex-col gap-2">
      <CmsResourceLink
        hrefLiteral={dictionary.documentation.url}
        labelLiteral={dictionary.documentation.labelLiteral}
        descriptionLiteral={dictionary.documentation.descriptionLiteral}
        iconNode={<BookOpen size={20} aria-hidden="true" />}
      />
      <CmsResourceLink
        hrefLiteral={dictionary.interactive.url}
        labelLiteral={dictionary.interactive.labelLiteral}
        descriptionLiteral={dictionary.interactive.descriptionLiteral}
        iconNode={<Terminal size={20} aria-hidden="true" />}
      />
    </div>
  </div>
);

/**
 * @private Sub-Aparato: CmsResourceLink
 * @description Átomo de enlace con efecto hover y accesibilidad integrada.
 */
interface ICmsResourceLinkProperties {
  readonly hrefLiteral: string;
  readonly labelLiteral: string;
  readonly descriptionLiteral: string;
  readonly iconNode: React.ReactNode;
}

const CmsResourceLink: React.FC<ICmsResourceLinkProperties> = ({
  hrefLiteral,
  labelLiteral,
  descriptionLiteral,
  iconNode,
}) => (
  <a
    href={hrefLiteral}
    target="_blank"
    rel="noopener noreferrer"
    className="group flex items-start gap-4 p-5 rounded-2xl hover:bg-slate-50 transition-all duration-300 border border-transparent hover:border-slate-100"
  >
    <div className="mt-1 text-slate-400 group-hover:text-amber-600 transition-colors">
      {iconNode}
    </div>
    <div className="flex-grow">
      <span className="block font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
        {labelLiteral}
      </span>
      <span className="block text-xs text-slate-500 font-medium mt-0.5">
        {descriptionLiteral}
      </span>
    </div>
    <ExternalLink size={14} className="text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity" aria-hidden="true" />
  </a>
);
