/**
 * @section Telemetry Logic - Buffer State Registry
 * @description Única Fuente de Verdad (SSOT) para la memoria volátil de señales.
 * Mantiene el rastro de eventos en el hilo actual antes de su despacho batch.
 *
 * Protocolo OEDP-V17.0 - Internal State Isolation.
 * @author Raz Podestá - MetaShark Tech
 */
import type { ITelemetrySignal } from '../../../schemas/TelemetrySignal.schema';
/**
 * @private
 * Colección de señales capturadas esperando sincronización con la nube.
 * Se mantiene como una variable mutable local al búnker de transporte.
 */
export declare let telemetrySignalBufferCollection: ITelemetrySignal[];
/**
 * Actualiza la referencia del buffer (Utilizado para limpieza atómica).
 *
 * @param newCollection - Nueva lista de señales (generalmente vacía []).
 */
export declare const UpdateTelemetryBufferRegistry: (newCollection: ITelemetrySignal[]) => void;
//# sourceMappingURL=TelemetryBufferRegistry.d.ts.map