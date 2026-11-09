/**
 * @section Observatory Logic - Public Expenditure Metrics Calculator (Atom)
 * @description Función pura determinística encargada de procesar la colección
 * de partidas presupuestarias para consolidar los indicadores cuantitativos del panel:
 * volumen total ejecutado y cantidad de partidas con sospecha de anomalía fiscal.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Precisión).
 * SANEADO: Conexión canónica con @floripa-dignidade/contracts, inmutabilidad funcional estricta
 * y erradicación de valores literales mágicos.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import type { IPublicExpenditure } from '@floripa-dignidade/contracts';

/**
 * @constant ANOMALY_DETECTION_CRITICAL_THRESHOLD_NUMERIC
 * @description Umbral institucional a partir del cual el coeficiente emitido por el
 * motor de inferencia clasifica una partida fiscal como sujeta a auditoría forense inmediata.
 */
const ANOMALY_DETECTION_CRITICAL_THRESHOLD_NUMERIC = 0.7;

/**
 * @interface IObservatoryMetricsResult
 * @description Contrato inmutable que estructura el resultado del cálculo estadístico para el dashboard.
 * Sigue la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
export interface IObservatoryMetricsResult {
  /** Monto financiero total consolidado en moneda corriente (BRL). */
  readonly totalAuditedAmountNumeric: number;
  /** Cantidad de partidas presupuestarias que superan el umbral crítico de anomalía. */
  readonly anomalyCountQuantity: number;
}

/**
 * Procesa la colección de partidas presupuestarias municipales y calcula los indicadores de resumen.
 * Implementa una función matemática pura sin efectos secundarios ni mutaciones de estado.
 *
 * @param publicExpenditureCollection - Colección inmutable de gastos públicos auditados.
 * @returns {IObservatoryMetricsResult} Snapshot inmutable con las métricas consolidadas del observatorio.
 */
export const CalculateObservatoryMetrics = (
  publicExpenditureCollection: readonly IPublicExpenditure[],
): IObservatoryMetricsResult => {
  // 1. CÁLCULO DE VOLUMEN FINANCIERO TOTAL CONSOLIDADO
  const totalAuditedAmountNumeric = publicExpenditureCollection.reduce(
    (accumulatedAmountNumeric, currentExpenditureSnapshot) =>
      accumulatedAmountNumeric + currentExpenditureSnapshot.totalExecutedAmountNumeric,
    0,
  );

  // 2. INFERENCIA DE VOLUMEN DE ANOMALÍAS FISCALES
  const anomalyCountQuantity = publicExpenditureCollection.filter(
    (currentExpenditureSnapshot) =>
      currentExpenditureSnapshot.auditMetadata.lastAnomalyScoreNumeric >
      ANOMALY_DETECTION_CRITICAL_THRESHOLD_NUMERIC,
  ).length;

  // 3. CONSTRUCCIÓN DE SNAPSHOT INMUTABLE SELLADO
  return Object.freeze({
    totalAuditedAmountNumeric,
    anomalyCountQuantity,
  });
};