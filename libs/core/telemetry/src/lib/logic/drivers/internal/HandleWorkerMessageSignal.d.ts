/**
 * @section Telemetry Logic - Worker Message Handler
 * @description Átomo encargado de interceptar las señales del hilo sombra,
 * identificar la transacción correspondiente y ejecutar la resolución del ciclo de vida.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 */
import type { IWorkerMessageEventBridge } from './schemas/IWorkerBridge.schema';
/**
 * Procesa la señal de respuesta del hardware y cierra la transacción diferida.
 *
 * @param messageEvent - Evento de mensaje capturado del hardware.
 */
export declare const HandleWorkerMessageSignal: (messageEvent: IWorkerMessageEventBridge) => void;
//# sourceMappingURL=HandleWorkerMessageSignal.d.ts.map