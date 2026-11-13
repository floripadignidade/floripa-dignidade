/**
 * @section Telemetry Logic - Deferred Transaction Atom
 * @description Átomo encargado de la gobernanza de promesas diferidas entre hilos.
 * Gestiona el registro en el mapa de transacciones y el ciclo de vida del timeout SRE.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 */

import { InternalSystemException } from '@floripa-dignidade/exceptions';
import { activeWorkerTransactionsMap } from './TelemetryWorkerRegistry';

interface IDeferredTransactionHooks<TResult> {
  readonly resolve: (value: TResult) => void;
  readonly reject: (reason: Error) => void;
}

/**
 * Registra una transacción asíncrona con protección de tiempo de espera.
 *
 * @param transactionIdentifier - ID único de la operación.
 * @param commandLiteral - Comando enviado al Worker.
 * @param timeoutQuantity - Tiempo máximo de espera en milisegundos.
 * @param hooks - Funciones de resolución de la promesa principal.
 */
export const CreateComputationDeferredTransaction = <TResult>(
  transactionIdentifier: string,
  commandLiteral: string,
  timeoutQuantity: number,
  hooks: IDeferredTransactionHooks<TResult>,
): void => {
  // 1. Configuración de Seguridad (SRE Timeout)
  const timeoutTimerReference = setTimeout(() => {
    if (activeWorkerTransactionsMap.has(transactionIdentifier)) {
      activeWorkerTransactionsMap.delete(transactionIdentifier);
      hooks.reject(
        new InternalSystemException('BACKGROUND_COMPUTATION_TIMEOUT', {
          transactionIdentifier,
          commandLiteral,
        }),
      );
    }
  }, timeoutQuantity);

  // 2. Registro en la Única Fuente de Verdad (SSOT)
  activeWorkerTransactionsMap.set(transactionIdentifier, {
    resolve: (value: unknown) => {
      clearTimeout(timeoutTimerReference);
      hooks.resolve(value as TResult);
    },
    reject: (reason: Error) => {
      clearTimeout(timeoutTimerReference);
      hooks.reject(reason);
    },
  });
};
