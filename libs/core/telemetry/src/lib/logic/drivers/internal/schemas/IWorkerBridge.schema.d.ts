/**
 * @section Telemetry DNA - Worker Bridge Contracts
 * @description Define la forma física de las APIs de hardware necesarias para
 * la ejecución de hilos sombra de forma isomórfica.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation.
 */
export interface IWorkerOptionsBridge {
    readonly type?: 'classic' | 'module';
    readonly credentials?: 'omit' | 'same-origin' | 'include';
    readonly name?: string;
}
export interface IWorkerResponsePayload {
    readonly transactionIdentifier: string;
    readonly isOperationSuccessfulBoolean: boolean;
    readonly resultData: unknown;
    readonly errorDescriptionLiteral?: string;
}
export interface IWorkerMessageEventBridge {
    readonly data: IWorkerResponsePayload;
}
export interface IWorkerInstanceBridge {
    onmessage: ((messageEvent: IWorkerMessageEventBridge) => void) | null;
    readonly postMessage: (message: unknown) => void;
    readonly terminate: () => void;
}
export interface IWorkerConstructorBridge {
    new (scriptURL: string | URL, options?: IWorkerOptionsBridge): IWorkerInstanceBridge;
}
//# sourceMappingURL=IWorkerBridge.schema.d.ts.map