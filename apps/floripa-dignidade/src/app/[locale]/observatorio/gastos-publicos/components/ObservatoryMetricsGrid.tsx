/**
 * @section UI Molecule - Observatory Metrics Grid
 * @description Orquestador de indicadores de alto nivel. Distribuye los datos
 * procesados por el motor de analítica en una grilla responsiva optimizada
 * para la lectura rápida (Dashboard style).
 *
 * Protocolo OEDP-V17.0 - Mobile First & Performance SRE.
 * SANEADO Zenith: Sincronización alfabética de importaciones y memorización de cálculos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useMemo } from 'react';
import { Activity, AlertTriangle, BarChart3, ShieldCheck } from 'lucide-react';

/* 1. Átomos Locales */
import { MetricCard } from './MetricCard';

/* 2. ADN Lingüístico (Verbatim Module Syntax) */
import type { IObservatoryI18n } from '../../i18n/ObservatoryI18n.schema';

/**
 * @interface IObservatoryMetricsGridProperties
 * @description Contrato inmutable para la inyección de datos calculados y etiquetas.
 */
interface IObservatoryMetricsGridProperties {
  /** Snapshot de métricas procesadas por el átomo de cálculo del observatorio. */
  readonly metrics: {
    readonly totalAuditedAmountNumeric: number;
    readonly anomalyCountQuantity: number;
  };

  /** Diccionario localizado del dominio del observatorio (Silo Lingüístico). */
  readonly labels: IObservatoryI18n['dashboard'];
}

/**
 * Aparato encargado de la disposición estructural de las tarjetas de métricas.
 * Implementa una arquitectura de enjambre visual delegando en 'MetricCard'.
 *
 * @param properties - Propiedades de datos y lenguaje.
 * @returns {React.ReactElement} Grilla responsiva de indicadores auditados.
 */
export const ObservatoryMetricsGrid: React.FC<IObservatoryMetricsGridProperties> = ({
  metrics,
  labels,
}) => {
  /**
   * @section Formateo de Identidad Financiera (BRL)
   * SANEADO: Se utiliza useMemo para garantizar que el formateo ocurra
   * solo cuando el valor numérico cambie, protegiendo los 120 FPS.
   */
  const formattedTotalAmountLiteral = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(metrics.totalAuditedAmountNumeric);
  }, [metrics.totalAuditedAmountNumeric]);

  /**
   * @section Metadatos de Progreso de Fase
   * TODO: En la Fase 8, estos valores se inyectarán desde el 'territorial-engine'
   * y el 'reputation-engine' para eliminar los literales estáticos.
   */
  const territorialCoverageLiteral = "12/12";
  const algorithmHealthPercentageLiteral = "100%";

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-2 duration-1000"
      aria-label="Dashboard de indicadores de auditoría forense"
    >
      {/* 1. INDICADOR DE VOLUMEN FINANCIERO (Quantitative Impact) */}
      <MetricCard
        iconNode={<BarChart3 className="w-5 h-5" />}
        labelLiteral={labels.totalInvestedLabel}
        valueLiteral={formattedTotalAmountLiteral}
      />

      {/* 2. INDICADOR DE RIESGO COGNITIVO (Anomaly Detection) */}
      <MetricCard
        iconNode={<AlertTriangle className="w-5 h-5" />}
        labelLiteral={labels.anomalyCountLabel}
        valueLiteral={metrics.anomalyCountQuantity.toString().padStart(2, '0')}
        isAlertVariantBoolean={metrics.anomalyCountQuantity > 0}
      />

      {/* 3. INDICADOR DE ALCANCE TERRITORIAL (Geographic Footprint) */}
      <MetricCard
        iconNode={<Activity className="w-5 h-5" />}
        labelLiteral={labels.territorialReachLabel}
        valueLiteral={territorialCoverageLiteral}
      />

      {/* 4. INDICADOR DE SALUD DEL ALGORITMO (System Integrity) */}
      <MetricCard
        iconNode={<ShieldCheck className="w-5 h-5 text-green-500" />}
        labelLiteral={labels.aiAuditStatusLabel}
        valueLiteral={algorithmHealthPercentageLiteral}
      />
    </section>
  );
};
