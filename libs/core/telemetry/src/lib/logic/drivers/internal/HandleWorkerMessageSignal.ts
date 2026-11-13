/**
 * @section Telemetry Logic - Worker Message Handler
 * @description Átomo encargado de interceptar las señales del hilo sombra,
 * identificar la transacción correspondiente y ejecutar la resolución del ciclo de vida.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 */

import { activeWorkerTransactionsMap } from './TelemetryWorkerRegistry';
import type { IWorkerMessageEventBridge } from './schemas/IWorkerBridge.schema';

/**
 * Procesa la señal de respuesta del hardware y cierra la transacción diferida.
 *
 * @param messageEvent - Evento de mensaje capturado del hardware.
 */
export const HandleWorkerMessageSignal = (messageEvent: IWorkerMessageEventBridge): void => {
  const {
    transactionIdentifier,
    isOperationSuccessfulBoolean,
    resultData,
    errorDescriptionLiteral,
  } = messageEvent.data;

  const deferredTransactionHooks = activeWorkerTransactionsMap.get(transactionIdentifier);

  if (deferredTransactionHooks) {
    if (isOperationSuccessfulBoolean) {
      deferredTransactionHooks.resolve(resultData);
    } else {
      deferredTransactionHooks.reject(new Error(errorDescriptionLiteral ?? 'WORKER_FAULT'));
    }

    activeWorkerTransactionsMap.delete(transactionIdentifier);
  }
};
