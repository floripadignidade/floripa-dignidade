/**
 * @section Telemetry Logic - Atomic Signal Dispatcher
 * @description Ponto de despacho único e soberano para sinais de telemetría.
 * Valida a integridade da sinal contra o contrato de ADN (Zod) e delega
 * o transporte físico ao orquestrador de despacho asimétrico.
 *
 * Protocolo OEDP-V17.0 - High Performance & Swarm Intelligence.
 * SANEADO Zenith: Resolução de TS2724 (Sincronização com QueueTelemetrySignalForTransportAction).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
/**
 * Valida o contrato de integridade da sinal entrante e coordena sua
 * persistência asíncrona no bus de dados institucional.
 *
 * @param unvalidatedTelemetrySignalPayload - Dados brutos do evento capturado.
 * @returns {void}
 */
export declare const EmitTelemetrySignal: (unvalidatedTelemetrySignalPayload: unknown) => void;
//# sourceMappingURL=EmitTelemetrySignal.d.ts.map