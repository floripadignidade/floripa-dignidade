/**
 * @section Messaging Logic - Presence Sync Transaction (Atom)
 * @description Átomo encargado de la ejecución física y reporte de la sincronización
 * de presencia ciudadana en la nube. Isola el rastro de red del ciclo de vida de la UI
 * y garantiza la integridad del despacho mediante la purificación de opcionales.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Functional Atomicity.
 * SANEADO Zenith: Resolución de TS2379 (Exact Optional Types), erradicación de
 * importación circular y cumplimiento estricto de Prosa ISO 11179.
 *
 * @author  Raz Podestá - Metashark Tech
 * @license UNLICENSED
 */

import { EmitTelemetrySignal, TraceExecutionTime } from '@floripa-dignidade/telemetry';

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 1. ADN Estructural y Enjambre de Dominio (Verbatim Module Syntax) */
import { UpdateUserPresence } from '../UpdateUserPresence';
import { IdentifyHardwarePlatform } from '../../atomic/IdentifyHardwarePlatform';
import type { TAvailabilityStatus } from '../../../schemas/UserPresence.schema';

/**
 * @interface IPresenceSyncParameters
 * @description Contrato inmutable para la transacción de sincronización de pulso vital.
 * Implementa el estándar 'Exact Optional' para evitar ruidos de undefined en el Ledger.
 */
export interface IPresenceSyncParameters {
  /** UUID del ciudadano con rastro de identidad activo. */
  readonly citizenIdentifier: string;

  /** Estado ontológico de disponibilidad (ONLINE | AWAY | etc). */
  readonly currentAvailabilityStatus: TAvailabilityStatus;

  /** Mensaje de contexto lingüístico definido por el usuario (Opcional). */
  readonly customStatusMessageLiteral?: string;

  /** Token secreto de hardware para el túnel de notificaciones (Opcional). */
  readonly activePushTokenSecret?: string;

  /** Marca temporal ISO 8601 del último latido capturado por el sensor. */
  readonly lastHeartbeatTimestampISO: string;

  /** Identificador de seguimiento forense del hilo de ejecución. */
  readonly correlationIdentifier: string;
}

/** Identificador técnico del aparato para el Neural Sentinel. */
const ATOM_IDENTIFIER = 'PRESENCE_SYNC_TRANSACTION_ATOM';

/**
 * Ejecuta la mutación de presencia en el Ledger y emite señales de trazabilidad.
 * Implementa el patrón "Clean Property Injection" para satisfacer exactOptionalPropertyTypes.
 *
 * @param parameters - Snapshot de identidad y estado de disponibilidad.
 * @returns {Promise<void>} Operación de tipo SRE (Site Reliability Engineering).
 * @throws {InternalSystemException} Si la infraestructura o la validación de ADN colapsan.
 */
export const ExecutePresenceSyncTransaction = async (
  parameters: IPresenceSyncParameters,
): Promise<void> => {
  /**
   * 🛡️ LEY ZENITH: Validación de cimientos asíncrona obligatoria.
   * Garantiza que los secretos del Tier de Datos estén disponibles.
   */
  await ValidateEnvironmentAduana();

  return await TraceExecutionTime(
    ATOM_IDENTIFIER,
    'EXECUTE_PRESENCE_SYNCHRONIZATION',
    parameters.correlationIdentifier,
    async () => {
      try {
        // 1. CAPTURA DE PLATAFORMA (Hardware Sensor Isomórfico)
        const platformIdentifierLiteral = IdentifyHardwarePlatform();

        /**
         * 2. PREPARACIÓN DE PAYLOAD (Aduana de Opcionales)
         * 🛡️ SANEADO Zenith: Construcción dinámica para evitar claves con valor 'undefined'.
         * Esto asegura que el esquema Zod en 'UpdateUserPresence' reciba un ADN puro.
         */
        const presenceUpdatePayloadSnapshot = {
          citizenIdentifier: parameters.citizenIdentifier,
          currentAvailabilityStatus: parameters.currentAvailabilityStatus,
          lastActivePlatformLiteral: platformIdentifierLiteral,
          lastHeartbeatTimestampISO: parameters.lastHeartbeatTimestampISO,
          ...(parameters.customStatusMessageLiteral !== undefined && {
            customStatusMessageLiteral: parameters.customStatusMessageLiteral,
          }),
          ...(parameters.activePushTokenSecret !== undefined && {
            activePushTokenSecret: parameters.activePushTokenSecret,
          }),
        };

        // 3. DISPARO DE MUTACIÓN (Data Ingestion)
        await UpdateUserPresence(presenceUpdatePayloadSnapshot);

        // 4. REPORTE DE ÉXITO (Audit Trail)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ATOM_IDENTIFIER,
          operationCodeLiteral: 'PRESENCE_SYNC_SUCCESSFUL',
          correlationIdentifier: parameters.correlationIdentifier,
          messageContentLiteral: 'Sincronización de presencia consolidada exitosamente en la nube.',
          /** Clasificación ontológica para el análisis de salud algorítmica */
          semanticIntentTag: 'CITIZEN_HEARTBEAT_SYNC',
          contextMetadataSnapshot: {
            platformLiteral: platformIdentifierLiteral,
            statusLiteral: parameters.currentAvailabilityStatus,
          },
        });
      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: ATOM_IDENTIFIER,
          operationCodeLiteral: 'PRESENCE_SYNC_FAILURE',
          correlationIdentifier: parameters.correlationIdentifier,
          messageContentLiteral: 'Fallo crítico al intentar sincronizar la presencia ciudadana.',
          semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            attemptedStatusLiteral: parameters.currentAvailabilityStatus,
          },
        });

        throw new InternalSystemException('FALLO_EN_TRANSACCION_DE_PRESENCIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier: parameters.correlationIdentifier,
        });
      }
    },
  );
};
