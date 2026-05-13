/**
 * @section UI Molecule - Public Expenditure Forensic Table (Orchestrator)
 * @description Orquestador de visualización tabular. Ensambla y coordina el
 * enjambre de átomos (Header, Row, Footer) para garantizar el cumplimiento del
 * Principio de Responsabilidad Única (SRP) en la renderización de datos fiscales.
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Atomic Visual DNA.
 * SANEADO Zenith: Inyección de Rutas Limpias (Clean Paths), Prosa ISO
 * y blindaje de propiedades inmutables (ReadOnly).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. ADN Estructural de Dominio (Verbatim Module Syntax) */
import type { IPublicExpenditure } from '@floripa-dignidade/pmf-open-data-engine';

/* 2. Enjambre Atómico Local (Clean Paths) */
import { ExpenditureTableHeader } from './ExpenditureTableHeader';
import { ExpenditureTableRow } from './ExpenditureTableRow';
import { ExpenditureTableFooter } from './ExpenditureTableFooter';

/**
 * @interface IExpenditureTableProperties
 * @description Contrato inmutable de propiedades para la orquestación visual.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IExpenditureTableProperties {
  /** Colección purificada de gastos emitidos por el motor de la PMF. */
  readonly publicExpenditureCollection: readonly IPublicExpenditure[];
  /** Título localizado para el encabezado de la sección. */
  readonly tableHeadlineLiteral: string;
}

/**
 * Molécula encargada de coordinar el enjambre visual de la tabla presupuestaria.
 *
 * @param propertiesSnapshot - Snapshot inmutable de configuración y datos.
 * @returns {React.ReactElement} Interfaz tabular de alta fidelidad.
 */
export const ExpenditureTable: React.FC<IExpenditureTableProperties> = ({
  publicExpenditureCollection,
  tableHeadlineLiteral,
}) => {
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
          {/* ÁTOMO A: Encabezado Técnico */}
          <ExpenditureTableHeader />

          <tbody className="text-sm">
            {/* ENJAMBRE B: Iteración de Filas Físicas */}
            {publicExpenditureCollection.map((expenditureSnapshot) => (
              <ExpenditureTableRow
                key={expenditureSnapshot.expenditureIdentifier}
                expenditureSnapshot={expenditureSnapshot}
              />
            ))}
          </tbody>
        </table>
      </div>

      {/* ÁTOMO C: Pie de Trazabilidad */}
      <ExpenditureTableFooter />
    </section>
  );
};