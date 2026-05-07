/**
 * @section Telemetry Logic - Merkle Chain Atom
 * @description Átomo encargado de garantizar la inalterabilidad de la señal
 * mediante el encadenamiento de hashes SHA-256 delegados al Worker.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & Cryptographic Integrity.
 * @author Raz Podestá - MetaShark Tech
 */
import type { ContentFingerprint, ITelemetrySignal } from '../../../schemas/TelemetrySignal.schema';
/**
 * Ejecuta el cálculo de la huella digital actual vinculándola al log anterior.
 *
 * @param signalSnapshot - ADN de la señal a sellar.
 * @param previousHashLiteral - Hash del eslabón anterior en la cadena Merkle.
 * @returns {Promise<{ currentHash: ContentFingerprint }>} Nueva huella digital.
 */
export declare const ExecuteMerkleChainCalculation: (signalSnapshot: ITelemetrySignal, previousHashLiteral?: ContentFingerprint) => Promise<{
    readonly currentHash: ContentFingerprint;
}>;
//# sourceMappingURL=ExecuteMerkleChainCalculation.d.ts.map