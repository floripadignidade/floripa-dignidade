/**
 * @section Telemetry Logic - Forensic Exception Reporter
 * @description Átomo encargado de transformar una instancia de excepción técnica
 * nivelada (GlobalBaseException) en una señal de telemetría estructurada.
 * Actúa como el intérprete en el puente entre el motor de fallos y el sistema
 * nervioso central, garantizando la preservación de la cadena de custodia.
 *
 * Protocolo OEDP-V17.0 - ISO Technical Naming & SRE Resilience.
 * SANEADO Zenith: Sincronización con TelemetrySignalSchema e inyección de etiquetas IA.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { GlobalBaseException } from '@floripa-dignidade/exceptions';
import { EmitTelemetrySignal } from './EmitTelemetrySignal';

import type {
  CorrelationIdentifier,
  ModuleIdentifier,
  OperationCode,
} from '../../schemas/TelemetrySignal.schema';

/**
 * Identificador técnico del aparato emisor para el rastro forense.
 * Sigue la norma ISO de Objeto + Propiedad + Representación.
 */
const EXCEPTION_REPORTER_IDENTIFIER = 'GLOBAL_EXCEPTION_REPORTER' as ModuleIdentifier;

/**
 * Procesa una excepción capturada, extrae su snapshot de memoria y
 * emite una señal de alerta priorizada hacia el sistema nervioso central.
 *
 * @param caughtExceptionInstance - Instancia de la excepción nivelada bajo TIER 0.
 * @param correlationIdentifier - Identificador único de trazabilidad de la transacción.
 * @returns {void} Operación de tipo "Fire-and-Forget".
 */
export const ReportForensicException = (
  caughtExceptionInstance: GlobalBaseException,
  correlationIdentifier: string,
): void => {
  /**
   * @section Triaje de Severidad
   * Las excepciones con código 500 o superior (Internal) se elevan a CRITICAL.
   * Las excepciones de validación (400) se mantienen como ERROR para triaje manual.
   */
  const isInternalServerErrorBoolean = caughtExceptionInstance.httpStatusCodeNumeric >= 500;
  const severityLevelLiteral = isInternalServerErrorBoolean ? 'CRITICAL' : 'ERROR';

  /**
   * @section Construcción de Señal (Sovereign Dispatch)
   * 🛡️ SANEADO Zenith: El payload ahora incluye los campos mandatorios
   * 'occurrenceTimestampISO' y 'semanticIntentTag' para cumplir con el esquema.
   */
  const telemetrySignalPayloadSnapshot = {
    /** Marca temporal capturada directamente del momento de la falla. */
    occurrenceTimestampISO: caughtExceptionInstance.occurrenceTimestampISO,

    severityLevelLiteral,
    moduleIdentifierLiteral: EXCEPTION_REPORTER_IDENTIFIER,

    /**
     * @bridge_logic
     * Realizamos casting a 'unknown' para cruzar Branded Types entre dominios.
     * El 'operationalErrorCodeLiteral' de Exceptions se mapea al 'OperationCode' de Telemetry.
     */
    operationCodeLiteral: caughtExceptionInstance.operationalErrorCodeLiteral as unknown as OperationCode,

    correlationIdentifier: correlationIdentifier as CorrelationIdentifier,
    messageContentLiteral: caughtExceptionInstance.message,

    /** Clasificación ontológica para el Neural Sentinel. */
    semanticIntentTag: 'EXCEPTION_FORENSIC_SNAPSHOT',

    /**
     * @section Contexto Forense (Immutable Evidence)
     * Inyectamos el rastro inalterable de la excepción para reconstrucción por la IA.
     */
    contextMetadataSnapshot: {
      ...caughtExceptionInstance.runtimeContextSnapshot,
      exceptionClassIdentifierLiteral: caughtExceptionInstance.name,
      httpStatusCodeNumeric: caughtExceptionInstance.httpStatusCodeNumeric,
    },
  };

  /**
   * Despacho físico hacia el bus de datos asíncrono.
   * Marcamos con 'void' para indicar que no bloqueamos el flujo de recuperación.
   */
  void EmitTelemetrySignal(telemetrySignalPayloadSnapshot);
};
