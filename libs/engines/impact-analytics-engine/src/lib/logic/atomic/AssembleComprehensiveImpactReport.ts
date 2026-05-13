/**
 * @section Impact Analytics - Comprehensive Report Assembler
 * @description Átomo de lógica pura encargado de empaquetar los resultados
 * de la analítica bayesiana y territorial en una unidad de verdad inmutable.
 * Garantiza la integridad del rastro forense compuesto.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Mathematical Precision.
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { IPopularAcceptanceIndicator } from '../../schemas/PopularAcceptanceIndicator.schema';
import type { ITerritorialImpactReport } from '../../schemas/TerritorialImpactReport.schema';

/**
 * @interface IComprehensiveReportResult
 * @description Snapshot total del impacto social detectado.
 * Estructura de nivel 'Lost Artifact' para persistencia en el Ledger histórico.
 */
export interface IComprehensiveReportResult {
  /** Resultado del motor de confianza bayesiana ponderada. */
  readonly globalIndicator: IPopularAcceptanceIndicator;
  /** Resultados del clúster geográfico por distritos. */
  readonly territorialReport: ITerritorialImpactReport;
  /** Metadatos de auditoría del proceso de ensamblaje. */
  readonly metadata: {
    /** Versión del protocolo de agregación utilizado. */
    readonly aggregationProtocolLiteral: string;
    /** Marca temporal exacta de la generación del reporte. */
    readonly reportOccurrenceTimestampISO: string;
  };
}

/**
 * Ensambla y sella el reporte final de impacto bajo estándares forenses.
 * Realiza la unión de los enjambres lógicos en una entidad inmutable (Readonly).
 *
 * @param globalIndicator - Resultado purificado del motor bayesiano.
 * @param territorialReport - Snapshot validado de impacto geográfico.
 * @returns {IComprehensiveReportResult} Reporte consolidado e inmutable.
 */
export const AssembleComprehensiveImpactReport = (
  globalIndicator: IPopularAcceptanceIndicator,
  territorialReport: ITerritorialImpactReport
): IComprehensiveReportResult => {
  /**
   * @section Sello de Soberanía (Inmutabilidad)
   * Aplicamos Object.freeze para asegurar que el rastro no sea mutado
   * durante su tránsito por el bus de datos hacia el Data Lake.
   */
  return Object.freeze({
    globalIndicator,
    territorialReport,
    metadata: {
      aggregationProtocolLiteral: 'MULTIDIMENSIONAL_SWARM_V1',
      reportOccurrenceTimestampISO: new Date().toISOString()
    }
  });
};
