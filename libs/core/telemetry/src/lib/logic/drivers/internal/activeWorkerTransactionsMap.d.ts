/**
 * @section Telemetry Logic - Worker Transaction Ledger
 * @description Átomo de estado volátil que almacena el mapa de transacciones activas.
 * Permite la resolución de promesas entre el hilo principal y el hilo sombra.
 *
 * Protocolo OEDP-V17.0 - Internal State Isolation.
 * @author Raz Podestá - MetaShark Tech
 */
/**
 * @interface IWorkerTransactionHooks
 * @description Define los ganchos de control para la resolución de una
 * operación delegada al hardware.
 */
export interface IWorkerTransactionHooks {
    /** Función de resolución de la promesa original. */
    readonly resolve: (value: unknown) => void;
    /** Función de rechazo en caso de colapso en el Worker. */
    readonly reject: (reason: Error) => void;
}
/**
 * @name activeWorkerTransactionsMap
 * @description Mapa que vincula identificadores de correlación con sus respectivos ganchos.
 * Se utiliza 'string' para el ID de transacción generado por el orquestador.
 */
export declare const activeWorkerTransactionsMap: Map<string, IWorkerTransactionHooks>;
//# sourceMappingURL=activeWorkerTransactionsMap.d.ts.map