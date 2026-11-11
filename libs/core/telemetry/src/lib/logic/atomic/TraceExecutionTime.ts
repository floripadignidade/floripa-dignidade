/**
 * @section Telemetry Logic - Performance Metrics Apparatus (Atom)
 * @description Átomo encargado de medir con precisión física de microsegundos la ejecución
 * de acciones asíncronas en el ecosistema. Captura las marcas de tiempo de inicio y fin,
 * calcula la latencia neta y despacha los resultados al flujo telemétrico con etiquetado SRE.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO Turbopack: Erradicación definitiva de extensiones '.js' a favor de Rutas Limpias (Extensionless).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Interna de Telemetría (Rutas Limpias - Extensionless) */
import { EmitTelemetrySignal } from './EmitTelemetrySignal';
import type {
  CorrelationIdentifier,
  ModuleIdentifier,
  OperationCode,
} from '../../schemas/TelemetrySignal.schema';

/**
 * Identificador técnico para reportes de métricas internas de rendimiento.
 * Cumple con la norma ISO 11179 de Objeto + Propiedad + Representación.
 */
const PERFORMANCE_MONITOR_IDENTIFIER = 'TELEMETRY_PERFORMANCE_MONITOR' as ModuleIdentifier;

/**
 * Ejecuta una acción atómica asíncrona midiendo su tiempo de procesamiento físico
 * y reportando el resultado automáticamente al sistema de telemetría institucional.
 *
 * @template TExecutionResult - Tipo de retorno esperado de la lógica encapsulada.
 * @param moduleIdentifierLiteral - Nombre técnico del módulo emisor bajo observación.
 * @param operationCodeLiteral - Código semántico de la operación bajo auditoría.
 * @param correlationIdentifier - Identificador para trazabilidad forense cruzada.
 * @param asynchronousActionFunction - Lógica de negocio a ser ejecutada y medida.
 * @returns {Promise<TExecutionResult>} El resultado inalterado de la función encapsulada.
 * @throws Propaga cualquier excepción capturada para preservar la cadena de errores.
 */
export const TraceExecutionTime = async <TExecutionResult>(
  moduleIdentifierLiteral: string,
  operationCodeLiteral: string,
  correlationIdentifier: string,
  asynchronousActionFunction: () => Promise<TExecutionResult>,
): Promise<TExecutionResult> => {
  /**
   * @section Captura de Marca Temporal Inicial
   * Se utiliza 'globalThis.performance.now()' para resolución de alta precisión
   * compatible de forma isomórfica (Node.js, Vercel Edge y Browser).
   */
  const executionStartTimestampNumeric = globalThis.performance.now();
  const executionStartAbsoluteTimestampISO = new Date().toISOString();

  try {
    // 1. EJECUCIÓN DE LA ACCIÓN ENCAPSULADA
    const resultingExecutionData = await asynchronousActionFunction();

    // 2. CÁLCULO DE LATENCIA NOMINAL
    const executionEndTimestampNumeric = globalThis.performance.now();
    const calculatedLatencyInMillisecondsQuantity =
      executionEndTimestampNumeric - executionStartTimestampNumeric;

    // 3. EMISIÓN DE SEÑAL DE RENDIMIENTO EXITOSO (SRE Compliance)
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: PERFORMANCE_MONITOR_IDENTIFIER,
      operationCodeLiteral: `${operationCodeLiteral}_PERFORMANCE_SUCCESS` as OperationCode,
      correlationIdentifier: correlationIdentifier as CorrelationIdentifier,
      messageContentLiteral: 'TELEMETRY.SIGNALS.LATENCY_REPORT',
      executionLatencyInMillisecondsQuantity: calculatedLatencyInMillisecondsQuantity,
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
    // 4. CAPTURA DE LATENCIA EN CONDICIÓN DE FALLO
    const executionEndTimestampNumeric = globalThis.performance.now();
    const calculatedLatencyInMillisecondsQuantity =
      executionEndTimestampNumeric - executionStartTimestampNumeric;

    const errorDescriptionLiteral =
      caughtError instanceof Error ? caughtError.message : String(caughtError);

    // 5. EMISIÓN DE SEÑAL DE RENDIMIENTO DEGRADADO POR ERROR
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
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

    // Propagación inalterada del error para el gestor de excepciones superior
    throw caughtError;
  }
};
