/**
 * @section Telemetry Logic - Background Computation Orchestrator
 * @description Punto de entrada soberano para delegar tareas criptográficas y de
 * procesamiento pesado al hilo sombra (Worker). Gestiona el ciclo de vida de
 * la transacción, implementa tiempos de espera de seguridad (SRE) y garantiza
 * el aislamiento del hilo principal para mantener 120 FPS.
 *
 * Protocolo OEDP-V17.0 - High Performance & SRE Resilience.
 * SANEADO Zenith: Sincronización de ADN con el registro nominal (Fix TS2724).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { GenerateCorrelationIdentifier } from '../atomic/GenerateCorrelationIdentifier';

/* 1. Enjambre Atómico de Gestión de Hardware (Internal Swarm) */
import { InitializeTelemetryWorker } from './internal/InitializeTelemetryWorker';
import { IdentifyComputationRuntime } from './internal/IdentifyComputationRuntime';
import { CreateComputationDeferredTransaction } from './internal/CreateComputationDeferredTransaction';
import { GetGlobalTelemetryWorkerInstance } from './internal/TelemetryWorkerRegistry';

/**
 * @constant COMPUTATION_TIMEOUT_MILLISECONDS_QUANTITY
 * Tiempo máximo de espera para una respuesta del Worker antes de abortar la transacción.
 */
const COMPUTATION_TIMEOUT_MILLISECONDS_QUANTITY = 5000;

/**
 * Solicita una computación al Web Worker mediante un sistema de promesas diferidas.
 * Implementa una arquitectura de enjambre delegando la identificación de runtime
 * y la gestión de transacciones a átomos especializados.
 *
 * @template TResult - Tipo esperado de la respuesta purificada.
 * @param commandLiteral - Acción técnica a ejecutar (ej: PERFORM_FORENSIC_HASH).
 * @param dataPayloadCollection - Diccionario de datos para el procesamiento.
 * @returns {Promise<TResult>} Promesa que resuelve con el resultado del hilo sombra.
 * @throws {InternalSystemException} Si el hardware no está disponible o excede el timeout.
 */
export const RequestBackgroundComputation = async <TResult>(
  commandLiteral: string,
  dataPayloadCollection: Record<string, unknown>,
): Promise<TResult> => {
  /**
   * 1. ADUANA DE DISPONIBILIDAD (Hardware SRE Check)
   * Intentamos inicializar el Worker y recuperar su instancia activa del búnker.
   */
  const isWorkerReadyBoolean = InitializeTelemetryWorker();
  const activeWorkerInstance = GetGlobalTelemetryWorkerInstance();

  if (!isWorkerReadyBoolean || !activeWorkerInstance) {
    /**
     * 🛡️ SANEADO Zenith: Uso del átomo 'IdentifyComputationRuntime' para
     * proporcionar contexto forense sin depender de tipos globales 'window'.
     */
    throw new InternalSystemException('TELEMETRY_WORKER_UNAVAILABLE_IN_RUNTIME', {
      runtimeModeLiteral: IdentifyComputationRuntime(),
      attemptedCommandLiteral: commandLiteral,
    });
  }

  const transactionIdentifierLiteral = GenerateCorrelationIdentifier();

  /**
   * 2. ORQUESTACIÓN DE PROMESA DIFERIDA
   * Creamos un envoltorio de promesa para esperar la señal de retorno del hardware.
   */
  return new Promise<TResult>((resolve, reject) => {
    // FASE A: Registro de la transacción y temporizador de seguridad.
    CreateComputationDeferredTransaction<TResult>(
      transactionIdentifierLiteral,
      commandLiteral,
      COMPUTATION_TIMEOUT_MILLISECONDS_QUANTITY,
      { resolve, reject },
    );

    /**
     * FASE B: Despacho físico al hilo sombra (PostMessage).
     * SANEADO Zenith: Se utiliza el puente de instancia validado para evitar 'any'.
     */
    activeWorkerInstance.postMessage({
      commandLiteral,
      transactionIdentifier: transactionIdentifierLiteral,
      dataPayload: dataPayloadCollection,
    });
  });
};
