/**
 * @section Messaging Logic - System Notification Dispatcher
 * @description Orquestador superior encargado de la emisión de alertas institucionales.
 * Coordina la validación de ADN, la transformación física y la persistencia cloud.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Pulverización de mappers, aislamiento de I/O y rastro i18n.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { SystemNotificationSchema } from '../../schemas/SystemNotification.schema';
import type { ISystemNotification } from '../../schemas/SystemNotification.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';
import { MapNotificationToLedgerRecord } from '../mappers/MapNotificationToLedgerRecord';
import { PersistNotificationToCloud } from './atomic/PersistNotificationToCloud';

/** Identificador técnico del aparato para el Neural Sentinel. */
const NOTIFICATION_DISPATCHER_IDENTIFIER = 'SYSTEM_NOTIFICATION_DISPATCHER';

/**
 * Ejecuta el despacho integral de una notificación del sistema.
 * Garantiza que la infraestructura esté nominal antes de impactar el Ledger.
 *
 * @param unvalidatedNotificationPayloadSnapshot - Datos crudos de la alerta.
 * @returns {Promise<ISystemNotification>} Instancia validada y persistida.
 */
export const DispatchSystemNotification = async (
  unvalidatedNotificationPayloadSnapshot: unknown
): Promise<ISystemNotification> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    NOTIFICATION_DISPATCHER_IDENTIFIER,
    'EXECUTE_NOTIFICATION_DISPATCH_ORCHESTRATION',
    correlationIdentifier,
    async () => {
      try {
        // 1. ADUANA DE ADN (Safe Parsing)
        const validationResult = SystemNotificationSchema.safeParse(
          unvalidatedNotificationPayloadSnapshot
        );

        if (!validationResult.success) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'NOTIFICATION_DNA_CORRUPTION',
            correlationIdentifier,
            messageContentLiteral: 'MESSAGING.ERRORS.MESSAGE_ADN_CORRUPTED',
            contextMetadataSnapshot: { issues: validationResult.error.flatten() }
          });

          throw new ValidationException('CONTRATO_DE_NOTIFICACION_VIOLADO');
        }

        const validatedNotification: ISystemNotification = validationResult.data;

        // 2. CAPTURA DE INFRAESTRUCTURA (Aduana de Entorno)
        const {
          SUPABASE_URL: cloudUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret
        } = await ValidateEnvironmentAduana();

        // 3. TRANSFORMACIÓN Y SEGURIDAD (Delegación Atómica)
        const securityHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'representation');
        const ledgerRecord = MapNotificationToLedgerRecord(validatedNotification, correlationIdentifier);

        // 4. PERSISTENCIA FÍSICA (I/O Delegation)
        await PersistNotificationToCloud(cloudUrlLiteral, securityHeaders, ledgerRecord);

        // 5. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATION_DISPATCH_SUCCESS',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.LOGS.NOTIFICATION_BROADCAST_SUCCESS',
          contextMetadataSnapshot: {
            recipientId: validatedNotification.targetRecipientIdentifierLiteral,
            category: validatedNotification.notificationCategoryLiteral
          }
        });

        return validatedNotification;

      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorTraceLiteral = caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATION_DISPATCH_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo crítico en el despacho de alerta institucional.',
          contextMetadataSnapshot: { errorTraceLiteral }
        });

        throw new InternalSystemException('FALLO_EN_DESPACHO_DE_NOTIFICACION_SRE', {
          originalError: errorTraceLiteral,
          correlationIdentifier
        });
      }
    }
  );
};
