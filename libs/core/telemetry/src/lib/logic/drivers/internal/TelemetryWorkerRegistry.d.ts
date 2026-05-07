/**
 * @section Telemetry Logic - Worker Registry Orchestrator
 * @description Orquestador que centraliza el acceso al estado y referencias del
 * hilo sombra. Implementa un puente de compatibilidad dinámica y asegura la
 * visibilidad nominal de los átomos de gestión de instancia y transacciones.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & Isomorphic Integrity.
 * SANEADO Zenith: Sincronización de exportaciones nominales (Fix TS2724).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */
import { GetGlobalTelemetryWorkerInstance } from './TelemetryWorkerInstanceStore';
import type { IWorkerInstanceBridge } from './schemas/IWorkerBridge.schema';
export { activeWorkerTransactionsMap } from './activeWorkerTransactionsMap';
export type { IWorkerTransactionHooks } from './activeWorkerTransactionsMap';
export { UpdateGlobalTelemetryWorkerInstance } from './TelemetryWorkerInstanceStore';
/**
 * 🛡️ SANEADO Zenith: Exportación nominal mandatoria.
 * Permite que 'RequestBackgroundComputation' valide la presencia del
 * hardware de forma atómica.
 */
export { GetGlobalTelemetryWorkerInstance };
/**
 * @interface IGlobalTelemetryWorkerRegistry
 * @description Contrato para el objeto de acceso dinámico a la instancia.
 */
interface IGlobalTelemetryWorkerRegistry {
    /** Referencia física activa al puente de hardware del Worker. */
    readonly current: IWorkerInstanceBridge | null;
}
/**
 * @name globalTelemetryWorkerInstance
 * @description Objeto de acceso dinámico. Garantiza que los consumidores siempre
 * obtengan la referencia actualizada del hilo sombra sin mutaciones estáticas.
 */
export declare const globalTelemetryWorkerInstance: IGlobalTelemetryWorkerRegistry;
//# sourceMappingURL=TelemetryWorkerRegistry.d.ts.map