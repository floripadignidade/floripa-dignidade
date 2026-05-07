/**
 * @section Telemetry Drivers - Sovereign Transport Orchestrator
 * @description Orquestador superior encargado de coordinar el flujo sanguíneo digital.
 * Implementa una arquitectura de enjambre delegando responsabilidades a átomos
 * de criptografía y sensores de hardware.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Atomic Swarm.
 * SANEADO Zenith: Erradicación de errores de tipos globales y atomización SRP.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
/**
 * Punto de entrada universal para el transporte de telemetría.
 * Orquesta la transición entre hilos y la persistencia de resiliencia.
 */
export declare const QueueTelemetrySignalForTransportAction: (validatedTelemetrySignalSnapshot: ITelemetrySignal) => Promise<void>;
//# sourceMappingURL=LogTransportDriver.d.ts.map