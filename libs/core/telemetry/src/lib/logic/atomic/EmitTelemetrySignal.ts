/**
 * @section Telemetry Logic - Atomic Signal Dispatcher
 * @description Punto de despacho único y soberano para señales de telemetría.
 * Realiza la auditoría de integridad contra el esquema de ADN (Zod) y coordina
 * el despacho asíncrono hacia el driver de transporte institucional.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Erradicación de abreviaturas y normalización de rastro en desarrollo.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { TelemetrySignalSchema } from '../../schemas/TelemetrySignal.schema';
import type { ITelemetrySignal } from '../../schemas/TelemetrySignal.schema';

/* 1. Motores de Transporte (Drivers) */
import { QueueTelemetrySignalForTransportAction } from '../drivers/LogTransportDriver';

/* 2. Átomos de Detección de Entorno (Isomorphic Swarm) */
import { DetermineDevelopmentEnvironment } from './DetermineDevelopmentEnvironment';

/** Identificador técnico del aparato para el Neural Sentinel. */
const DISPATCHER_IDENTIFIER = 'TELEMETRY_ATOMIC_DISPATCHER';

/**
 * Valida el contrato de integridad de la señal entrante y delega su
 * persistencia asíncrona en el Ledger institucional.
 *
 * Implementa el patrón "Gatekeeper": si el ADN es corrupto, la señal se descarta
 * en la frontera para proteger la estabilidad del enjambre.
 *
 * @param unvalidatedTelemetrySignalPayload - Datos crudos del evento capturado en el ecosistema.
 * @returns {void} Operación de tipo "Fire-and-Forget" (No bloqueante).
 */
export const EmitTelemetrySignal = (unvalidatedTelemetrySignalPayload: unknown): void => {
  // 1. ADUANA DE ADN (Safe Parsing)
  const telemetrySignalValidationResult = TelemetrySignalSchema.safeParse(
    unvalidatedTelemetrySignalPayload,
  );

  if (!telemetrySignalValidationResult.success) {
    /**
     * @section Gestión de Violación de Integridad
     * En entornos de producción, el descarte es silencioso para no degradar el performance.
     * En desarrollo, se emite una alerta forense detallada para el Arquitecto.
     */
    const isDevelopmentActiveBoolean = DetermineDevelopmentEnvironment();

    if (isDevelopmentActiveBoolean) {
      const validationIssuesMetadataCollection = telemetrySignalValidationResult.error.format();

      console.warn(
        `[${DISPATCHER_IDENTIFIER}]: Violación de integridad detectada en el ADN de la señal.`,
        {
          receivedPayloadSnapshot: unvalidatedTelemetrySignalPayload,
          structuralIssuesCollection: validationIssuesMetadataCollection,
        },
      );
    }
    return;
  }

  /**
   * 2. DESPACHO SRE (Asynchronous Hand-off)
   * Una vez validada, la señal se eleva al tipo nominal ITelemetrySignal.
   * El uso de 'void' señaliza intencionalmente que no esperamos la resolución
   * de la promesa, manteniendo la latencia cero en la interfaz.
   */
  const validatedTelemetrySignalSnapshot: ITelemetrySignal = telemetrySignalValidationResult.data;

  void QueueTelemetrySignalForTransportAction(validatedTelemetrySignalSnapshot);
};
