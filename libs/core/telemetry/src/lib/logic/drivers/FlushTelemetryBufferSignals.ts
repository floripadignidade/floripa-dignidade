/**
 * @section Telemetry Logic - Buffer Flush Atom
 * @description Átomo encargado de extraer y limpiar la cola de señales.
 * Garantiza una transferencia atómica de datos para evitar duplicados.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE.
 */

import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';
import {
  telemetrySignalBufferCollection,
  UpdateTelemetryBufferRegistry,
} from './internal/TelemetryBufferRegistry';

/**
 * Captura un snapshot del buffer actual y lo vacía instantáneamente.
 *
 * @returns {ITelemetrySignal[]} Colección de señales para despacho físico.
 */
export const FlushTelemetryBufferSignals = (): ITelemetrySignal[] => {
  const signalBatchSnapshot = [...telemetrySignalBufferCollection];

  // Limpieza inmediata para liberar memoria y evitar re-procesamiento.
  UpdateTelemetryBufferRegistry([]);

  return signalBatchSnapshot;
};
