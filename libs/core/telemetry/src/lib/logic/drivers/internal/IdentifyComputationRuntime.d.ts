/**
 * @section Telemetry Logic - Runtime Identity Atom
 * @description Átomo encargado de identificar el contexto de ejecución actual
 * (SERVER vs CLIENT) de forma isomórfica, evitando errores de referencia global.
 *
 * Protocolo OEDP-V17.0 - Hardware Isolation & Pure Logic.
 */
/**
 * Determina el literal del runtime actual consultando globalThis.
 *
 * @returns {"SERVER" | "CLIENT"} Identificador técnico del entorno.
 */
export declare const IdentifyComputationRuntime: () => "SERVER" | "CLIENT";
//# sourceMappingURL=IdentifyComputationRuntime.d.ts.map