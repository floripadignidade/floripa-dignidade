/**
 * @section Messaging Logic - Unified Citizen Inbox Orchestrator
 * @description Orquestador superior encargado de coordinar la recuperación y
 * consolidación de la bandeja de entrada del ciudadano. Fusiona alertas de
 * sistema y mensajes directos en una línea de tiempo única y soberana.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await), inyección de
 * soberanía lingüística i18n y cumplimiento de Prosa ISO (ADR 0002).
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

/* 2. Enjambre de Átomos Especializados (Internal Swarm) */
import { FetchMessagingLedgerData } from './FetchMessagingLedgerData';
import { ConsolidateUnifiedInboxEvents } from '../mappers/ConsolidateUnifiedInboxEvents';

/**
 * @interface IUnifiedInboxSnapshot
 * @description Contrato de salida inmutable con el estado consolidado del buzón.
 */
export interface IUnifiedInboxSnapshot {
  /** Colección ordenada cronológicamente de eventos de comunicación. */
  readonly unifiedTimelineCollection: IUnifiedCommunicationEvent[];

  readonly metadata: {
    /** Volumen total de elementos recuperados en la ventana actual. */
    readonly totalItemsQuantityNumeric: number;
    /** Marca temporal ISO de la última sincronización con la nube. */
    readonly synchronizationTimestampISO: string;
  };
}

/** Identificador técnico del orquestador para el Neural Sentinel. */
const INBOX_ORCHESTRATOR_IDENTIFIER = 'MESSAGING_INBOX_ORCHESTRATOR';

/**
 * Recupera el estado íntegro y unificado del buzón del ciudadano.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución asíncrona de
 * infraestructura antes de la extracción masiva de datos.
 *
 * @param citizenIdentifierLiteral - UUID del ciudadano bajo consulta.
 * @param limitQuantityNumeric - Cantidad máxima de elementos por segmento (Default: 20).
 * @returns {Promise<IUnifiedInboxSnapshot>} Snapshot inmutable y validado del buzón.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa durante la consulta.
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
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Hardware Isolation)
         * 🛡️ SANEADO Zenith: Inyección de await mandatorio para resolver el
         * contrato asíncrono de secretos inyectados por el motor de infraestructura.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
        } = await ValidateEnvironmentAduana();

        /**
         * 2. EXTRACCIÓN PARALELA (Performance Optimization)
         * Ejecutamos las consultas al Ledger de forma concurrente para minimizar
         * el tiempo de respuesta total del orquestador (SRE High Performance).
         */
        const [rawNotificationsCollection, rawMessagesCollection] = await Promise.all([
          FetchMessagingLedgerData<ISystemNotification>(
            'system_notifications_ledger',
            `recipient_id=eq.${citizenIdentifierLiteral}&interaction_status=neq.TRASHED_DELETED&order=dispatch_timestamp.desc`,
            cloudStorageUrlLiteral,
            cloudSecurityKeySecret,
            limitQuantityNumeric
          ),
          FetchMessagingLedgerData<IDirectMessage>(
            'direct_messages_ledger',
            `or=(sender_id.eq.${citizenIdentifierLiteral},recipient_id.eq.${citizenIdentifierLiteral})&current_status=neq.TRASHED_DELETED&order=transmission_timestamp.desc`,
            cloudStorageUrlLiteral,
            cloudSecurityKeySecret,
            limitQuantityNumeric
          )
        ]);

        // 3. CONSOLIDACIÓN LÓGICA (Polymorphic Mapping)
        /**
         * Delegamos en el átomo de consolidación para unificar los contratos visuales
         * y realizar el ordenamiento cronológico determinista.
         */
        const unifiedTimelineCollection = ConsolidateUnifiedInboxEvents(
          rawNotificationsCollection,
          rawMessagesCollection
        );

        // 4. REPORTE DE ÉXITO OPERACIONAL (SRE Visibility)
        /** 🛡️ SANEADO Zenith: Uso de claves semánticas i18n para telemetría. */
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: INBOX_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'INBOX_SYNCHRONIZED_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.LOGS.INBOX_SYNC_SUCCESS',
          contextMetadataSnapshot: {
            totalItemsQuantityNumeric: unifiedTimelineCollection.length,
            citizenIdentifierLiteral
          }
        });

        return {
          unifiedTimelineCollection,
          metadata: {
            totalItemsQuantityNumeric: unifiedTimelineCollection.length,
            synchronizationTimestampISO: new Date().toISOString(),
          }
        };

      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE FALLO (Resilience Layer)
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
          correlationIdentifier,
          citizenIdentifierLiteral
        });
      }
    }
  );
};
