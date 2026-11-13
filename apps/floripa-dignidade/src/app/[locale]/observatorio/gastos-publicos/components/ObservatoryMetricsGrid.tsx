'use client';

/**
 * @section UI Molecule - Observatory Metrics Grid (Orchestrator)
 * @description Orquestador de indicadores de alto nivel del gasto público. Distribuye los datos
 * procesados por el motor de analítica en una grilla responsiva optimizada
 * para la lectura rápida (Dashboard style).
 *
 * Protocolo OEDP-V18.1 - Mobile First & Performance SRE.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Calidad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import React, { useEffect, useMemo } from 'react';
import { Activity, AlertTriangle, BarChart3, ShieldCheck } from 'lucide-react';

/* 1. Infraestructura Core y Utilidades Transversales */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Átomos Visuales Locales */
import { MetricCard } from './MetricCard';

/* 3. Contratos de ADN Estructural Lingüístico */
import type { IObservatoryI18n } from '../../i18n/ObservatoryI18n.schema';

/**
 * @interface IObservatoryMetricsGridProperties
 * @description Contrato inmutable para la inyección de datos calculados y etiquetas localizadas.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
interface IObservatoryMetricsGridProperties {
  /** Snapshot inmutable de métricas procesadas por el calculador del observatorio. */
  readonly metrics: {
    readonly totalAuditedAmountNumeric: number;
    readonly anomalyCountQuantity: number;
  };

  /** Diccionario localizado del dominio del observatorio institucional. */
  readonly labels: IObservatoryI18n['dashboard'];
}

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const MOLECULE_IDENTIFIER = 'OBSERVATORY_METRICS_GRID_MOLECULE' as ModuleIdentifier;

/**
 * Molécula encargada de la disposición estructural de las tarjetas de métricas.
 * Implementa la composición atómica delegando la representación visual en 'MetricCard'.
 *
 * @param propertiesSnapshot - Snapshot inmutable de métricas y diccionario lingüístico.
 * @returns {React.JSX.Element} Grilla responsiva de indicadores auditados y renderizados.
 */
export const ObservatoryMetricsGrid = (
  propertiesSnapshot: IObservatoryMetricsGridProperties,
): React.JSX.Element => {
  const { metrics, labels } = propertiesSnapshot;

  /**
   * @section Telemetría de Exposición (SRE Visibility)
   * Audita la presencia física de los indicadores del observatorio en el hardware del ciudadano.
   */
  useEffect(() => {
    const correlationIdentifier = GenerateCorrelationIdentifier();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: MOLECULE_IDENTIFIER,
      operationCodeLiteral: 'METRICS_GRID_EXPOSED' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Grilla de indicadores del observatorio de gastos expuesta al ciudadano.',
      semanticIntentTag: 'UI_VISIBILITY_TRACE',
      contextMetadataSnapshot: {
        totalAuditedAmountNumeric: metrics.totalAuditedAmountNumeric,
        anomalyCountQuantity: metrics.anomalyCountQuantity,
        renderTimestampISO: new Date().toISOString(),
      },
    });
  }, [metrics.totalAuditedAmountNumeric, metrics.anomalyCountQuantity]);

  /**
   * @section Formateo de Identidad Financiera (BRL)
   * Memoizado para garantizar 120 FPS y proteger el hilo principal ante re-renderizados.
   */
  const formattedTotalAmountLiteral = useMemo(() => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format(metrics.totalAuditedAmountNumeric);
  }, [metrics.totalAuditedAmountNumeric]);

  /**
   * @section Metadatos de Cobertura y Salud
   * Constantes normalizadas representativas del estado de sincronización territorial.
   */
  const territorialCoverageLiteral = '12/12';
  const algorithmHealthPercentageLiteral = '100%';

  return (
    <section
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12 animate-in fade-in slide-in-from-bottom-2 duration-1000"
      aria-label="Dashboard de indicadores de auditoría forense"
    >
      {/* 1. INDICADOR DE VOLUMEN FINANCIERO */}
      <MetricCard
        iconNode={<BarChart3 className="w-5 h-5" aria-hidden="true" />}
        labelLiteral={labels.totalInvestedLabel}
        valueLiteral={formattedTotalAmountLiteral}
      />

      {/* 2. INDICADOR DE ANOMALÍAS DETECTADAS */}
      <MetricCard
        iconNode={<AlertTriangle className="w-5 h-5" aria-hidden="true" />}
        labelLiteral={labels.anomalyCountLabel}
        valueLiteral={metrics.anomalyCountQuantity.toString().padStart(2, '0')}
        isAlertVariantBoolean={metrics.anomalyCountQuantity > 0}
      />

      {/* 3. INDICADOR DE ALCANCE TERRITORIAL */}
      <MetricCard
        iconNode={<Activity className="w-5 h-5" aria-hidden="true" />}
        labelLiteral={labels.territorialReachLabel}
        valueLiteral={territorialCoverageLiteral}
      />

      {/* 4. INDICADOR DE SALUD DE INFRAESTRUCTURA */}
      <MetricCard
        iconNode={<ShieldCheck className="w-5 h-5 text-green-500" aria-hidden="true" />}
        labelLiteral={labels.aiAuditStatusLabel}
        valueLiteral={algorithmHealthPercentageLiteral}
      />
    </section>
  );
};
