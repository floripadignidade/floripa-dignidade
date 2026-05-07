/**
 * @section Telemetry Logic - Deferred Transaction Atom
 * @description Átomo encargado de la gobernanza de promesas diferidas entre hilos.
 * Gestiona el registro en el mapa de transacciones y el ciclo de vida del timeout SRE.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 */
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
export declare const CreateComputationDeferredTransaction: <TResult>(transactionIdentifier: string, commandLiteral: string, timeoutQuantity: number, hooks: IDeferredTransactionHooks<TResult>) => void;
export {};
//# sourceMappingURL=CreateComputationDeferredTransaction.d.ts.map