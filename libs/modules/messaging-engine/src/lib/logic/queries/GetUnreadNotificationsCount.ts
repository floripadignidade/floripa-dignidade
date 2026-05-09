/**
 * @section Messaging Logic - Unread Notifications Sensor
 * @description Orquestador encargado de obtener la cantidad de alertas pendientes
 * (No leídas) en el Ledger institucional. Coordina la captura de infraestructura
 * y delega el conteo técnico al enjambre de átomos especializados.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
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

/* 1. Enjambre Atómico de Soporte (Internal Swarm) */
import { FetchLedgerCount } from './FetchLedgerCount';

/** Identificador técnico del sensor para el Neural Sentinel. */
const NOTIFICATION_QUERY_IDENTIFIER = 'UNREAD_NOTIFICATIONS_COUNTER_ORCHESTRATOR';

/**
 * Recupera el número total de notificaciones no leídas para un ciudadano.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución asíncrona de
 * infraestructura antes de la consulta de conteo en la nube.
 *
 * @param targetRecipientIdentifierLiteral - UUID del ciudadano bajo consulta.
 * @returns {Promise<number>} Cantidad de mensajes pendientes (0 a N).
 * @throws {InternalSystemException} Si la comunicación con el Tier de Datos colapsa.
 */
export const GetUnreadNotificationsCount = async (
  targetRecipientIdentifierLiteral: string
): Promise<number> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    NOTIFICATION_QUERY_IDENTIFIER,
    'EXECUTE_UNREAD_NOTIFICATIONS_COUNT_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secret Capture)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. DELEGACIÓN AL SENSOR TÉCNICO (SRP Perfection)
        /**
         * Utilizamos el átomo 'FetchLedgerCount' que optimiza la red
         * mediante el uso de cabeceras HTTP Content-Range (0-0/N).
         */
        const unreadMessagesQuantityNumeric = await FetchLedgerCount(
          'system_notifications_ledger',
          `recipient_id=eq.${targetRecipientIdentifierLiteral}&interaction_status=eq.DELIVERED_UNREAD`,
          cloudStorageUrlLiteral,
          cloudSecurityKeySecret
        );

        // 3. REPORTE DE SINCRONIZACIÓN (Audit Trail)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'DEBUG',
          moduleIdentifierLiteral: NOTIFICATION_QUERY_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATIONS_COUNT_SYNCHRONIZED',
          correlationIdentifier,
          messageContentLiteral: 'Sincronización del contador de alertas ciudadanas finalizada.',
          contextMetadataSnapshot: {
            recipientId: targetRecipientIdentifierLiteral,
            unreadQuantity: unreadMessagesQuantityNumeric
          },
        });

        return unreadMessagesQuantityNumeric;

      } catch (caughtError: unknown) {
        // 4. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'ERROR',
          moduleIdentifierLiteral: NOTIFICATION_QUERY_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATIONS_COUNT_FAULT',
          correlationIdentifier,
          messageContentLiteral: 'Fallo al intentar sincronizar el contador de notificaciones.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_CONSULTA_DE_NOTIFICACIONES_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          targetRecipient: targetRecipientIdentifierLiteral
        });
      }
    }
  );
};
