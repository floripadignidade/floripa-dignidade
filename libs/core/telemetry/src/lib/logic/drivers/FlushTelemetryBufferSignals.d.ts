/**
 * @section Telemetry Logic - Buffer Flush Atom
 * @description Átomo encargado de extraer y limpiar la cola de señales.
 * Garantiza una transferencia atómica de datos para evitar duplicados.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE.
 */
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
/**
 * Captura un snapshot del buffer actual y lo vacía instantáneamente.
 *
 * @returns {ITelemetrySignal[]} Colección de señales para despacho físico.
 */
export declare const FlushTelemetryBufferSignals: () => ITelemetrySignal[];
//# sourceMappingURL=FlushTelemetryBufferSignals.d.ts.map