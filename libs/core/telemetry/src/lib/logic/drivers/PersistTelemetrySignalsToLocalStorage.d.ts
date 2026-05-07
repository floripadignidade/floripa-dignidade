/**
 * @section Telemetry Logic - LocalStorage Persistence Atom
 * @description Átomo encargado de la inyección física de señales en el disco local.
 * Implementa la política de poda (Pruning) para garantizar la salud del hardware.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & SRE Resilience.
 * @author Raz Podestá - MetaShark Tech
 */
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
/**
 * Guarda una colección de señales en el hardware del ciudadano.
 * Realiza un ciclo de lectura-fusión-escritura atómico.
 *
 * @param telemetrySignalsCollection - Lote de señales para salvaguardar.
 * @returns {void}
 */
export declare const PersistTelemetrySignalsToLocalStorage: (telemetrySignalsCollection: ITelemetrySignal[]) => void;
//# sourceMappingURL=PersistTelemetrySignalsToLocalStorage.d.ts.map