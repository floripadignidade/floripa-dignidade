/**
 * @section CMS Component - Learning Materials
 * @description Componente visual encargado de renderizar los enlaces técnicos y documentación oficial.
 *
 * Protocolo OEDP-V18.1 - High Performance UI & ISO Technical Naming.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';
import { BookOpen, ExternalLink, Terminal } from 'lucide-react';

/**
 * @interface ILearningDictionarySnapshot
 * @description Contrato inmutable para la inyección de textos localizados.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
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
 * @interface ILearningMaterialsSectionProperties
 * @description Contrato inmutable de propiedades para la sección de recursos.
 * Preserva compatibilidad absoluta con el orquestador principal (page.tsx).
 */
interface ILearningMaterialsSectionProperties {
  readonly dictionary: ILearningDictionarySnapshot;
}

/**
 * @interface ICmsResourceLinkProperties
 * @description Contrato inmutable para los enlaces de recursos técnicos con accesibilidad.
 */
interface ICmsResourceLinkProperties {
  readonly hrefLiteral: string;
  readonly labelLiteral: string;
  readonly descriptionLiteral: string;
  readonly iconNode: React.ReactNode;
}

/**
 * Componente interno: CmsResourceLink
 * Renderiza un enlace individual con feedback visual de interacción y accesibilidad externa.
 */
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
    aria-label={`${labelLiteral} - ${descriptionLiteral}`}
  >
    <div
      className="mt-1 text-slate-400 group-hover:text-amber-600 transition-colors"
      aria-hidden="true"
    >
      {iconNode}
    </div>
    <div className="flex-grow">
      <span className="block font-bold text-slate-900 group-hover:text-amber-700 transition-colors">
        {labelLiteral}
      </span>
      <span className="block text-xs text-slate-500 font-medium mt-0.5">{descriptionLiteral}</span>
    </div>
    <ExternalLink
      size={14}
      className="text-slate-300 mt-1 opacity-0 group-hover:opacity-100 transition-opacity"
      aria-hidden="true"
    />
  </a>
);

/**
 * Renderiza el bloque de recursos de aprendizaje técnico y documentación.
 *
 * @param propertiesSnapshot - Snapshot inmutable conteniendo los literales localizados.
 * @returns {React.ReactElement} Bloque visual de documentación para el CMS.
 */
export const LearningMaterialsSection: React.FC<ILearningMaterialsSectionProperties> = ({
  dictionary,
}): React.ReactElement => (
  <div
    id="learning-materials"
    className="rounded-[2rem] bg-white p-8 shadow-sm border border-slate-100"
  >
    <h2 className="text-xl font-black text-slate-900 mb-8 flex items-center gap-3">
      <BookOpen className="text-amber-500" size={22} aria-hidden="true" />
      <span>{dictionary.sectionHeadingLiteral}</span>
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
