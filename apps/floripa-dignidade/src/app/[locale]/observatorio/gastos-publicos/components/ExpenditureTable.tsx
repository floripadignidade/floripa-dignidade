/**
 * @section UI Molecule - Public Expenditure Table (Orchestrator)
 * @description Orquestador de visualización tabular. Ensambla y coordina los componentes
 * de encabezado, filas de partidas fiscales y pie de página para garantizar el cumplimiento del
 * Principio de Responsabilidad Única (SRP) en la presentación de cuentas públicas.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Mantenibilidad).
 * SANEADO: Conexión canónica con @floripa-dignidade/contracts, modernización de firma para React 19
 * y purga de terminología informal.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React from 'react';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/* 2. Componentes Visuales Locales */
import { ExpenditureTableHeader } from './ExpenditureTableHeader';
import { ExpenditureTableRow } from './ExpenditureTableRow';
import { ExpenditureTableFooter } from './ExpenditureTableFooter';

/**
 * @interface IExpenditureTableProperties
 * @description Contrato inmutable de propiedades para la orquestación visual de la tabla presupuestaria.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface IExpenditureTableProperties {
  /** Colección de gastos públicos municipales normalizados y validados. */
  readonly publicExpenditureCollection: readonly IPublicExpenditure[];
  /** Título localizado para el encabezado de la sección tabular. */
  readonly tableHeadlineLiteral: string;
}

/**
 * Molécula encargada de coordinar la composición visual de la tabla presupuestaria.
 *
 * @param propertiesSnapshot - Snapshot inmutable de configuración y datos fiscales.
 * @returns {React.JSX.Element} Interfaz tabular estructurada de alta fidelidad.
 */
export const ExpenditureTable = (
  propertiesSnapshot: IExpenditureTableProperties,
): React.JSX.Element => {
  const { publicExpenditureCollection, tableHeadlineLiteral } = propertiesSnapshot;

  return (
    <section
      className="bg-white rounded-[2.5rem] shadow-2xl border border-slate-200 overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-700"
      aria-label="Tabela de execução orçamentária forense"
    >
      <header className="p-8 border-b border-slate-100 bg-slate-900 text-white">
        <h2 className="text-xl font-black uppercase tracking-tighter">
          {tableHeadlineLiteral}
        </h2>
      </header>

      <div className="overflow-x-auto scrollbar-thin scrollbar-thumb-slate-200">
        <table className="w-full text-left border-collapse min-w-[900px]">
          {/* COMPONENTE A: Encabezado Técnico */}
          <ExpenditureTableHeader />

          <tbody className="text-sm">
            {/* COMPONENTE B: Iteración de Filas de Partidas Fiscales */}
            {publicExpenditureCollection.map((expenditureSnapshot) => (
              <ExpenditureTableRow
                key={expenditureSnapshot.expenditureIdentifier}
                expenditureSnapshot={expenditureSnapshot}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* COMPONENTE C: Pie de Trazabilidad */}
      <ExpenditureTableFooter />
    </section>
  );
};