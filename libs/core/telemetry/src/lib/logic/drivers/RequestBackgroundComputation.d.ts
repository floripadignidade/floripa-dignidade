/**
 * @section Telemetry Logic - Background Computation Orchestrator
 * @description Punto de entrada soberano para delegar tareas criptográficas y de
 * procesamiento pesado al hilo sombra (Worker). Gestiona el ciclo de vida de
 * la transacción, implementa tiempos de espera de seguridad (SRE) y garantiza
 * el aislamiento del hilo principal para mantener 120 FPS.
 *
 * Protocolo OEDP-V17.0 - High Performance & SRE Resilience.
 * SANEADO Zenith: Sincronización de ADN con el registro nominal (Fix TS2724).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * Solicita una computación al Web Worker mediante un sistema de promesas diferidas.
 * Implementa una arquitectura de enjambre delegando la identificación de runtime
 * y la gestión de transacciones a átomos especializados.
 *
 * @template TResult - Tipo esperado de la respuesta purificada.
 * @param commandLiteral - Acción técnica a ejecutar (ej: PERFORM_FORENSIC_HASH).
 * @param dataPayloadCollection - Diccionario de datos para el procesamiento.
 * @returns {Promise<TResult>} Promesa que resuelve con el resultado del hilo sombra.
 * @throws {InternalSystemException} Si el hardware no está disponible o excede el timeout.
 */
export declare const RequestBackgroundComputation: <TResult>(commandLiteral: string, dataPayloadCollection: Record<string, unknown>) => Promise<TResult>;
//# sourceMappingURL=RequestBackgroundComputation.d.ts.map