/**
 * @section Adversarial Adapters - Shannon AI Forensic Exporter (Orchestrator)
 * @description Orquestador de salida encargado de coordinar la transformación
 * y persistencia de reportes para Shannon AI.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Atomización completa y delegación a átomos de mapeo e I/O.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural */
import type { IForensicAuditReport } from '../schemas/ForensicAuditReport.schema';

/* 2. Enjambre Atómico Local */
import { MapReportToShannonPayload } from './atomic/MapReportToShannonPayload';
import { PersistForensicReportToDisk } from './atomic/PersistForensicReportToDisk';

/** Identificador técnico del adaptador para el Neural Sentinel. */
const SHANNON_ADAPTER_IDENTIFIER = 'SHANNON_AI_EXPORT_ADAPTER';

/**
 * Ejecuta el flujo integral de exportación forense para consumo de IA.
 *
 * @param forensicReportSnapshot - ADN de la auditoría.
 * @param targetOutputDirectoryLiteral - Ruta de volcado en Vercel/GitHub.
 * @param correlationIdentifier - Identificador de trazabilidad.
 */
export const ExportShannonForensicReport = async (
  forensicReportSnapshot: IForensicAuditReport,
  targetOutputDirectoryLiteral: string,
  correlationIdentifier: string,
): Promise<void> => {
  return await TraceExecutionTime(
    SHANNON_ADAPTER_IDENTIFIER,
    'ORCHESTRATE_SHANNON_REPORT_EXPORT',
    correlationIdentifier,
    async () => {
      // 1. TRANSFORMACIÓN SEMÁNTICA (Mapeador de IA)
      const enrichedPayload = MapReportToShannonPayload(forensicReportSnapshot);

      // 2. PERSISTENCIA FÍSICA (Átomo de Hardware)
      const fileNameLiteral = `shannon-report-${forensicReportSnapshot.reportIdentifier}.json`;

      const persistedPathLiteral = await PersistForensicReportToDisk(
        targetOutputDirectoryLiteral,
        fileNameLiteral,
        enrichedPayload,
      );

      // 3. REPORTE SRE (Visibilidad)
      void EmitTelemetrySignal({
        severityLevel: 'INFO',
        moduleIdentifier: SHANNON_ADAPTER_IDENTIFIER,
        operationCode: 'REPORT_EXPORT_SUCCESS',
        correlationIdentifier,
        message: 'Evidencia adversaria persistida para análisis de Shannon AI.',
        contextMetadata: { persistedPathLiteral },
      });
    },
  );
};
