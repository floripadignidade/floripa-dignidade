/**
 * @section Messaging Logic - Presence Sync Transaction
 * @description Átomo encargado de la ejecución física y reporte de la
 * sincronización de presencia. Aísla el efecto colateral de red del ciclo de vida de React.
 *
 * Protocolo OEDP-V17.0 - Functional Atomicity & High Performance SRE.
 * @author Raz Podestá - MetaShark Tech
 */

import { EmitTelemetrySignal } from '@floripa-dignidade/telemetry';
import { UpdateUserPresence } from '../UpdateUserPresence';
import { IdentifyHardwarePlatform } from '../../atomic/IdentifyHardwarePlatform';

/**
 * @interface IPresenceSyncParameters
 * @description Contrato inmutable para la transacción de sincronización.
 */
interface IPresenceSyncParameters {
  readonly citizenIdentifier: string;
  readonly availabilityStatus: string;
  readonly customStatusMessageLiteral: string | undefined;
  readonly activePushTokenSecret: string | undefined;
  readonly lastHeartbeatTimestampISO: string;
  readonly correlationIdentifier: string;
}

/** Identificador técnico para el Neural Sentinel. */
const TRANSACTION_IDENTIFIER = 'PRESENCE_SYNC_TRANSACTION_ATOM';

/**
 * Ejecuta la mutación en el Ledger y emite las señales de telemetría correspondientes.
 *
 * @param parameters - Snapshot de identidad y estado.
 * @returns {Promise<void>}
 */
export const ExecutePresenceSyncTransaction = async (
  parameters: IPresenceSyncParameters
): Promise<void> => {
  try {
    const platformIdentifierLiteral = IdentifyHardwarePlatform();

    await UpdateUserPresence({
      citizenIdentifier: parameters.citizenIdentifier,
      currentAvailabilityStatus: parameters.availabilityStatus as any, // Cast controlado para el mutador
      customStatusMessageLiteral: parameters.customStatusMessageLiteral,
      lastActivePlatformLiteral: platformIdentifierLiteral,
      activePushSubscriptionTokenSecret: parameters.activePushTokenSecret,
      lastHeartbeatTimestampISO: parameters.lastHeartbeatTimestampISO
    });

    void EmitTelemetrySignal({
      severityLevelLiteral: 'INFO',
      moduleIdentifierLiteral: TRANSACTION_IDENTIFIER,
      operationCodeLiteral: 'PRESENCE_SYNC_SUCCESS',
      correlationIdentifier: parameters.correlationIdentifier,
      messageContentLiteral: 'Sincronización de presencia consolidada en la nube.',
      contextMetadataSnapshot: { platformLiteral: platformIdentifierLiteral }
    });

  } catch (caughtError: unknown) {
    const errorDescriptionLiteral = caughtError instanceof Error
      ? caughtError.message
      : String(caughtError);

    void EmitTelemetrySignal({
      severityLevelLiteral: 'ERROR',
      moduleIdentifierLiteral: TRANSACTION_IDENTIFIER,
      operationCodeLiteral: 'PRESENCE_SYNC_FAULT',
      correlationIdentifier: parameters.correlationIdentifier,
      messageContentLiteral: 'Fallo crítico al sincronizar presencia en el Ledger.',
      contextMetadataSnapshot: { errorTrace: errorDescriptionLiteral }
    });

    throw caughtError; // Propagación para manejo de reintentos si fuera necesario
  }
};
