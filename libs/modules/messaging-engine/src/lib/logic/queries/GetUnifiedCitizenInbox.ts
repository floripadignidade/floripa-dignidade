/**
 * @section Messaging Logic - Unified Citizen Inbox Orchestrator
 * @description Orquestador superior encargado de coordinar la recuperación y
 * consolidación del buzón ciudadano. Implementa el patrón "Swarm Execution"
 * delegando la construcción de filtros y el ensamblaje en átomos especializados.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Atomización extrema, erradicación de magic strings y rastro forense.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Dominio (Verbatim Module Syntax) */
import type { ISystemNotification } from '../../schemas/SystemNotification.schema';
import type { IDirectMessage } from '../../schemas/DirectMessage.schema';
import type { IUnifiedCommunicationEvent } from '../mappers/MapToUnifiedCommunicationEvent';

/* 2. Enjambre Atómico de Soporte (Internal Swarm) */
import { FetchMessagingLedgerData } from './FetchMessagingLedgerData';
import { ConsolidateUnifiedInboxEvents } from '../mappers/ConsolidateUnifiedInboxEvents';
import { BuildInboxQueryFilters } from './atoms/BuildInboxQueryFilters';
import { AssembleInboxSnapshot } from './atoms/AssembleInboxSnapshot';

/**
 * @interface IUnifiedInboxSnapshot
 * @description Contrato de salida inmutable con el estado consolidado del buzón.
 */
export interface IUnifiedInboxSnapshot {
  readonly unifiedTimelineCollection: IUnifiedCommunicationEvent[];
  readonly metadata: {
    readonly totalItemsQuantityNumeric: number;
    readonly synchronizationTimestampISO: string;
  };
}

/** Identificador técnico del orquestador para el Neural Sentinel. */
const INBOX_ORCHESTRATOR_IDENTIFIER = 'MESSAGING_INBOX_ORCHESTRATOR';

/**
 * Recupera el estado íntegro y unificado del buzón del ciudadano.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano bajo consulta.
 * @param limitQuantityNumeric - Cantidad máxima de elementos por segmento (Default: 20).
 * @returns {Promise<IUnifiedInboxSnapshot>} Snapshot inmutable y validado del buzón.
 */
export const GetUnifiedCitizenInbox = async (
  citizenIdentifierLiteral: string,
  limitQuantityNumeric = 20
): Promise<IUnifiedInboxSnapshot> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    INBOX_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_UNIFIED_INBOX_RECOVERY_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        // 1. CAPTURA DE INFRAESTRUCTURA (Aduana de Entorno)
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
        } = await ValidateEnvironmentAduana();

        // 2. CONSTRUCCIÓN DE ADN DE CONSULTA (Delegación Atómica)
        const {
          notificationsQueryLiteral,
          messagesQueryLiteral
        } = BuildInboxQueryFilters(citizenIdentifierLiteral);

        // 3. EXTRACCIÓN CONCURRENTE (Performance SRE)
        const [rawNotificationsCollection, rawMessagesCollection] = await Promise.all([
          FetchMessagingLedgerData<ISystemNotification>(
            'system_notifications_ledger',
            notificationsQueryLiteral,
            cloudStorageUrlLiteral,
            cloudSecurityKeySecret,
            limitQuantityNumeric
          ),
          FetchMessagingLedgerData<IDirectMessage>(
            'direct_messages_ledger',
            messagesQueryLiteral,
            cloudStorageUrlLiteral,
            cloudSecurityKeySecret,
            limitQuantityNumeric
          )
        ]);

        // 4. CONSOLIDACIÓN LÓGICA (Mappers)
        const timelineCollection = ConsolidateUnifiedInboxEvents(
          rawNotificationsCollection,
          rawMessagesCollection
        );

        // 5. ENSAMBLAJE FINAL (Delegación Atómica)
        const finalInboxSnapshot = AssembleInboxSnapshot(timelineCollection);

        // 6. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: INBOX_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'INBOX_SYNCHRONIZED_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.LOGS.INBOX_SYNC_SUCCESS',
          contextMetadataSnapshot: {
            itemCount: timelineCollection.length,
            citizenId: citizenIdentifierLiteral
          }
        });

        return finalInboxSnapshot;

      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: INBOX_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'INBOX_ORCHESTRATION_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.ERRORS.INBOX_ORCHESTRATION_FAULT',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral }
        });

        throw new InternalSystemException('FALLO_EN_ORQUESTACION_DE_BUZON_UNIFICADO_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
