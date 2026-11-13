/**
 * @section Adversarial Orchestrators - Audit Verdict Atom
 * @description Átomo encargado de analizar el reporte forense y emitir el
 * dictamen final de seguridad. Centraliza la telemetría de éxito/fallo crítico.
 *
 * Protocolo OEDP-V17.0 - SRE Logic & Forensic Visibility.
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import type { IForensicAuditReport } from '../../schemas/ForensicAuditReport.schema';

/**
 * Evalúa si existen brechas críticas y emite la señal de estado al Neural Sentinel.
 *
 * @param report - El reporte consolidado de la auditoría.
 * @param correlationIdentifier - ID de trazabilidad forense.
 */
export const EvaluateAuditIntegrityVerdict = (
  report: IForensicAuditReport,
  correlationIdentifier: string,
): void => {
  const hasCriticalBreachesBoolean = report.detectedVulnerabilitiesCollection.some(
    (vulnerability) => vulnerability.threatSeverityLevel === 'CRITICAL_COLLAPSE',
  );

  if (hasCriticalBreachesBoolean) {
    void EmitTelemetrySignal({
      severityLevel: 'CRITICAL',
      moduleIdentifier: 'SECURITY_AUDIT_JUDGE',
      operationCode: 'AUDIT_VERDICT_REJECTED',
      correlationIdentifier,
      message: '🚨 AUDITORÍA ADVERSARIA REPROBADA: El sistema permitió inyecciones críticas.',
    });
    return;
  }

  void EmitTelemetrySignal({
    severityLevel: 'INFO',
    moduleIdentifier: 'SECURITY_AUDIT_JUDGE',
    operationCode: 'AUDIT_VERDICT_APPROVED',
    correlationIdentifier,
    message: 'Auditoría adversaria aprobada. Las defensas de ADN son íntegras.',
  });
};
