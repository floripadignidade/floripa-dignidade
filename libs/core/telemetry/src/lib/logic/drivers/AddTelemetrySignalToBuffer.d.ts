/**
 * @section Telemetry Logic - Buffer Ingestion Atom
 * @description Átomo encargado de inyectar una señal validada en la cola de espera.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity.
 */
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
/**
 * Inserta un rastro telemétrico en el buffer de memoria.
 *
 * @param telemetrySignalSnapshot - Señal purificada por la aduana Zod.
 */
export declare const AddTelemetrySignalToBuffer: (telemetrySignalSnapshot: ITelemetrySignal) => void;
//# sourceMappingURL=AddTelemetrySignalToBuffer.d.ts.map