/**
 * @section Telemetry Logic - Forensic Exception Reporter
 * @description Átomo encargado de transformar una instancia de excepción técnica
 * nivelada (GlobalBaseException) en una señal de telemetría estructurada.
 * Actúa como el traductor entre el motor de fallos y el sistema nervioso central.
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & SRE Resilience.
 * SANEADO Zenith: Resolución de error 'sort-imports' y validación de ADN nominal.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { GlobalBaseException } from '@floripa-dignidade/exceptions';
/**
 * Procesa una excepción capturada, extrae su snapshot de memoria y
 * emite una señal de alerta priorizada al Neural Sentinel.
 *
 * @param caughtExceptionInstance - Instancia de la excepción nivelada bajo TIER 0.
 * @param correlationIdentifier - Identificador único de trazabilidad de la transacción.
 * @returns {void}
 */
export declare const ReportForensicException: (caughtExceptionInstance: GlobalBaseException, correlationIdentifier: string) => void;
//# sourceMappingURL=ReportForensicException.d.ts.map