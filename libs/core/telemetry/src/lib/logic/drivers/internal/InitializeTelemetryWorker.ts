/**
 * @section Telemetry Logic - Isomorphic Worker Initializer
 * @description Átomo encargado de instanciar el hilo sombra protegiendo la ejecución
 * contra entornos sin soporte. Implementa puentes estructurales puros.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Isomorphic Safety.
 * SANEADO Zenith: Erradicación total de 'any' (Fix ESLint @typescript-eslint/no-explicit-any).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { DetermineServerRuntime } from '../../atomic/DetermineServerRuntime';
import {
  globalTelemetryWorkerInstance,
  UpdateGlobalTelemetryWorkerInstance,
} from './TelemetryWorkerRegistry';

/* 1. Enjambre Atómico Local */
import type {
  IWorkerConstructorBridge,
  IWorkerInstanceBridge,
} from './schemas/IWorkerBridge.schema';
import { HandleWorkerMessageSignal } from './HandleWorkerMessageSignal';

/**
 * @interface IGlobalExecutionContext
 * @description Contrato para el acceso seguro a las APIs de Web Worker en globalThis.
 */
interface IGlobalExecutionContext {
  readonly Worker?: IWorkerConstructorBridge;
}

/**
 * Intenta activar el Web Worker de forma segura en el hardware del cliente.
 *
 * @returns {boolean} Verdadero si el Worker está instanciado y listo para procesar.
 */
export const InitializeTelemetryWorker = (): boolean => {
  const globalExecutionContextReference = globalThis as unknown as IGlobalExecutionContext;

  const isWorkerSupportedInHardwareBoolean =
    !DetermineServerRuntime() && typeof globalExecutionContextReference.Worker !== 'undefined';

  if (!isWorkerSupportedInHardwareBoolean) {
    return false;
  }

  // Idempotencia: Evitamos re-instanciación si ya existe una referencia activa.
  if (globalTelemetryWorkerInstance.current) {
    return true;
  }

  try {
    const WorkerConstructor = globalExecutionContextReference.Worker as IWorkerConstructorBridge;

    const newWorkerInstance: IWorkerInstanceBridge = new WorkerConstructor(
      new URL('../TelemetryBackgroundProcessor.worker.ts', import.meta.url),
    );

    // Inyección de lógica de procesamiento (Delegación Atómica)
    newWorkerInstance.onmessage = HandleWorkerMessageSignal;

    // Registro de la instancia en el búnker de persistencia volátil.
    UpdateGlobalTelemetryWorkerInstance(newWorkerInstance);

    return true;
  } catch (_caughtInitializationError: unknown) {
    return false;
  }
};
