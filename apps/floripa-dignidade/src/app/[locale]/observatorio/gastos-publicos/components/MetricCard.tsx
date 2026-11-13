/**
 * @section UI Atom - Expenditure Metric Card
 * @description Representación visual de un indicador financiero o de impacto
 * con soporte para estados de alerta (SRE Visibility).
 *
 * Protocolo OEDP-V17.0 - High Performance UI & Atomic Visual DNA.
 * SANEADO Zenith: Resolución de TS2307 (Shared Utility), erradicación de React
 * fantasma y cumplimiento estricto de Prosa ISO (ADR 0002).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura de Utilidades (Sovereign Boundaries) */
import { GlobalStyleClassMerger } from '@floripa-dignidade/shared-utility';

/**
 * @interface IMetricCardProperties
 * @description Contrato inmutable para la parametrización de la tarjeta de métrica.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IMetricCardProperties {
  /** Icono vectorial de la librería Lucide o componente React. */
  readonly iconNode: React.ReactNode;
  /** Etiqueta descriptiva de la métrica (ej: "Total Invertido"). */
  readonly labelLiteral: string;
  /** Valor numérico o textual de la métrica (ej: "R$ 1.000.000,00"). */
  readonly valueLiteral: string;
  /** Indica si la métrica representa una anomalía o estado crítico. */
  readonly isAlertVariantBoolean?: boolean;
}

/**
 * Aparato encargado de la visualización de indicadores clave de rendimiento (KPIs).
 *
 * @param propertiesSnapshot - Snapshot inmutable con los datos de la métrica.
 * @returns {React.JSX.Element} Tarjeta visual auditada.
 */
export const MetricCard = (propertiesSnapshot: IMetricCardProperties): React.JSX.Element => {
  const {
    iconNode,
    labelLiteral,
    valueLiteral,
    isAlertVariantBoolean = false,
  } = propertiesSnapshot;

  /**
   * @section Arquitectura de Estilos (Atomic Consistency)
   */
  const containerStylesLiteral = GlobalStyleClassMerger(
    'p-8 rounded-[2rem] border transition-all shadow-sm',
    isAlertVariantBoolean ? 'bg-red-50 border-red-100' : 'bg-white border-slate-100',
  );

  const iconContainerStylesLiteral = GlobalStyleClassMerger(
    'flex items-center gap-3 mb-4',
    isAlertVariantBoolean ? 'text-red-500' : 'text-slate-400',
  );

  return (
    <article className={containerStylesLiteral}>
      <div className={iconContainerStylesLiteral}>
        <div aria-hidden="true">{iconNode}</div>
        <span className="text-xs font-black uppercase tracking-widest">{labelLiteral}</span>
      </div>
      <span className="text-3xl font-black text-slate-900">{valueLiteral}</span>
    </article>
  );
};
