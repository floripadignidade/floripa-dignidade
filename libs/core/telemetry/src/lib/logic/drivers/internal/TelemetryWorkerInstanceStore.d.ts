/**
 * @section Telemetry Logic - Worker Instance Store
 * @description Átomo encargado de la custodia de la referencia física al hilo sombra.
 * Implementa lógica de protección para evitar fugas de memoria (Memory Leaks).
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Lifecycle Management.
 * @author Raz Podestá - MetaShark Tech
 */
import type { IWorkerInstanceBridge } from './schemas/IWorkerBridge.schema';
/**
 * Recupera la instancia actual del Worker si ha sido inicializada.
 *
 * @returns {IWorkerInstanceBridge | null} Referencia física o nulo.
 */
export declare const GetGlobalTelemetryWorkerInstance: () => IWorkerInstanceBridge | null;
/**
 * Actualiza la referencia de la instancia en el búnker de memoria.
 * Si existe una instancia previa diferente, se termina de forma segura.
 *
 * @param workerInstance - Nueva instancia del Worker validada.
 */
export declare const UpdateGlobalTelemetryWorkerInstance: (workerInstance: IWorkerInstanceBridge) => void;
//# sourceMappingURL=TelemetryWorkerInstanceStore.d.ts.map