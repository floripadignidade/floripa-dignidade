/**
 * @section Telemetry DNA - Document Bridge Contracts
 * @description Define la forma física de las APIs de visibilidad del navegador
 * para garantizar la compilación en entornos de servidor.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation.
 */
/**
 * @interface IEventListenerOptionsBridge
 * @description Reemplazo de AddEventListenerOptions para evitar dependencias de DOM.
 */
export interface IEventListenerOptionsBridge {
    readonly capture?: boolean;
    readonly once?: boolean;
    readonly passive?: boolean;
}
export interface IDocumentHardwareBridge {
    readonly visibilityState: 'visible' | 'hidden';
    readonly addEventListener: (eventLiteral: string, callback: () => void, options?: IEventListenerOptionsBridge | boolean) => void;
}
//# sourceMappingURL=IDocumentBridge.schema.d.ts.map