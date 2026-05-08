/**
 * @section Telemetry Logic - Performance Metrics Apparatus
 * @description Átomo encargado de medir con precisión de microsegundos la ejecución
 * de acciones asíncronas. Gestiona el rastro lingüístico soberano y despacha
 * los resultados de latencia al flujo sanguíneo digital con etiquetado SRE.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Inyección de semanticIntentTag e integridad de marcas temporales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal } from './EmitTelemetrySignal';
import type {
  CorrelationIdentifier,
  ModuleIdentifier,
  OperationCode,
} from '../../schemas/TelemetrySignal.schema';

/**
 * Identificador técnico para reportes de métricas internas de rendimiento.
 * Cumple con la norma ISO de nomenclatura de Objeto + Propiedad + Representación.
 */
const PERFORMANCE_MONITOR_IDENTIFIER = 'TELEMETRY_PERFORMANCE_MONITOR' as ModuleIdentifier;

/**
 * Ejecuta una acción atómica asíncrona, midiendo su tiempo de ejecución
 * y reportando el resultado automáticamente al sistema de telemetría.
 *
 * @template TExecutionResult - Tipo de retorno esperado de la lógica encapsulada.
 * @param moduleIdentifierLiteral - Nombre técnico del búnker emisor.
 * @param operationCodeLiteral - Código semántico de la operación bajo auditoría.
 * @param correlationIdentifier - Identificador para trazabilidad forense cross-module.
 * @param asynchronousActionFunction - Lógica de negocio a ser medida.
 * @returns {Promise<TExecutionResult>} El resultado inalterado de la función.
 * @throws Relanza cualquier excepción capturada para preservar la cadena de fallos.
 */
export const TraceExecutionTime = async <TExecutionResult>(
  moduleIdentifierLiteral: string,
  operationCodeLiteral: string,
  correlationIdentifier: string,
  asynchronousActionFunction: () => Promise<TExecutionResult>,
): Promise<TExecutionResult> => {
  /**
   * @section Captura de Marca Temporal Inicial
   * Utilizamos el hardware de alta resolución de 'globalThis' para asegurar
   * compatibilidad isomórfica (Edge / Node / Browser).
   */
  const executionStartTimestampNumeric = globalThis.performance.now();
  const executionStartAbsoluteTimestampISO = new Date().toISOString();

  try {
    // 1. EJECUCIÓN DE LA LÓGICA DE NEGOCIO (Proxy/Wrapper Pattern)
    const resultingExecutionData = await asynchronousActionFunction();

    // 2. CÁLCULO DE LATENCIA NOMINAL
    const executionEndTimestampNumeric = globalThis.performance.now();
    const calculatedLatencyInMillisecondsQuantity =
      executionEndTimestampNumeric - executionStartTimestampNumeric;

    // 3. EMISIÓN DE SEÑAL DE RENDIMIENTO POSITIVO (SRE Compliance)
    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: PERFORMANCE_MONITOR_IDENTIFIER,
      operationCodeLiteral: `${operationCodeLiteral}_PERFORMANCE_SUCCESS` as OperationCode,
      correlationIdentifier: correlationIdentifier as CorrelationIdentifier,
      messageContentLiteral: 'TELEMETRY.SIGNALS.LATENCY_REPORT',
      executionLatencyInMillisecondsQuantity: calculatedLatencyInMillisecondsQuantity,
      /** 🛡️ SANEADO Zenith: Clasificación para el motor de análisis de salud. */
      semanticIntentTag: 'SRE_PERFORMANCE_METRIC',
      contextMetadataSnapshot: {
        targetModuleLiteral: moduleIdentifierLiteral,
        targetOperationLiteral: operationCodeLiteral,
        executionStatusLiteral: 'SUCCESS',
        startAbsoluteTimestampISO: executionStartAbsoluteTimestampISO,
      },
    });

    return resultingExecutionData;

  } catch (caughtError: unknown) {
    /**
     * @section Gestión Forense de Fallo con Medición de Latencia
     * Capturamos el rastro de tiempo incluso en colapso para detectar
     * anomalías de saturación o ataques de agotamiento de recursos.
     */
    const executionEndTimestampNumeric = globalThis.performance.now();
    const calculatedLatencyInMillisecondsQuantity =
      executionEndTimestampNumeric - executionStartTimestampNumeric;

    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    void EmitTelemetrySignal({
      severityLevelLiteral: 'ERROR',
      moduleIdentifierLiteral: PERFORMANCE_MONITOR_IDENTIFIER,
      operationCodeLiteral: `${operationCodeLiteral}_PERFORMANCE_FAILURE` as OperationCode,
      correlationIdentifier: correlationIdentifier as CorrelationIdentifier,
      messageContentLiteral: 'TELEMETRY.SIGNALS.LATENCY_REPORT',
      executionLatencyInMillisecondsQuantity: calculatedLatencyInMillisecondsQuantity,
      semanticIntentTag: 'SRE_FAULT_LATENCY_METRIC',
      contextMetadataSnapshot: {
        errorTraceLiteral: errorDescriptionLiteral,
        targetModuleLiteral: moduleIdentifierLiteral,
        targetOperationLiteral: operationCodeLiteral,
        executionStatusLiteral: 'FAILURE',
        startAbsoluteTimestampISO: executionStartAbsoluteTimestampISO,
      },
    });

    // Propagación de burbuja de error inalterada para el búnker de 'exceptions'.
    throw caughtError;
  }
};
