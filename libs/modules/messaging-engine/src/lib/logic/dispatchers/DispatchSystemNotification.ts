/**
 * @section Messaging Logic - System Notification Dispatcher
 * @description Orquestador de élite encargado de la emisión física de alertas
 * institucionales. Gestiona la validación de ADN, la persistencia en el Data Lake
 * (Supabase) y la emisión de señales telemétricas para auditoría forense.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
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

/* 2. Átomos de Infraestructura Internos (Atomic DRY) */
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const NOTIFICATION_DISPATCHER_IDENTIFIER = 'SYSTEM_NOTIFICATION_DISPATCHER';

/**
 * Ejecuta el despacho de una notificación del sistema hacia un ciudadano o grupo.
 * Implementa un patrón de ejecución Stateless optimizado para el Edge Runtime.
 * Garantiza que la infraestructura soberana esté resuelta antes del despacho físico.
 *
 * @param unvalidatedNotificationPayloadSnapshot - Datos crudos de la alerta institucional.
 * @returns {Promise<ISystemNotification>} Instancia de la notificación persistida y validada.
 * @throws {ValidationException} Si el contrato de datos es violado.
 * @throws {InternalSystemException} Si la infraestructura cloud no responde.
 */
export const DispatchSystemNotification = async (
  unvalidatedNotificationPayloadSnapshot: unknown
): Promise<ISystemNotification> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    NOTIFICATION_DISPATCHER_IDENTIFIER,
    'EXECUTE_NOTIFICATION_DISPATCH_TRANSACTION',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * Se integra dentro del rastro de ejecución para auditar la latencia de la aduana.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = SystemNotificationSchema.safeParse(
          unvalidatedNotificationPayloadSnapshot
        );

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'NOTIFICATION_SCHEMA_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura del mensaje es inválida o está corrompida.',
            contextMetadataSnapshot: {
              validationIssuesCollection: validationResult.error.flatten()
            }
          });

          throw new ValidationException('CONTRATO_DE_NOTIFICACION_VIOLADO', {
            issuesCollection: validationResult.error.flatten()
          });
        }

        const validatedNotificationData: ISystemNotification = validationResult.data;

        /**
         * 3. PERSISTENCIA CLOUD (PostgREST Protocol)
         * Uso del átomo 'CreateSovereignDatabaseHeaders' para cumplimiento estricto
         * del protocolo de seguridad institucional.
         */
        const cloudPersistenceResponse = await fetch(
          `${cloudStorageUrlLiteral}/rest/v1/system_notifications_ledger`,
          {
            method: 'POST',
            headers: {
              ...CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'representation')
            },
            body: JSON.stringify({
              notification_id: validatedNotificationData.notificationIdentifier,
              recipient_id: validatedNotificationData.targetRecipientIdentifierLiteral,
              priority_level: validatedNotificationData.notificationPriorityLiteral,
              category_tag: validatedNotificationData.notificationCategoryLiteral,
              headline_text: validatedNotificationData.headlineTitleLiteral,
              body_content: validatedNotificationData.contentBodyLiteral,
              action_route: validatedNotificationData.targetActionRouteLiteral,
              interaction_status: validatedNotificationData.interactionStatusLiteral,
              dispatched_at: validatedNotificationData.dispatchTimestampISO,
              correlation_id: correlationIdentifier,
            }),
          }
        );

        if (!cloudPersistenceResponse.ok) {
          throw new Error(`CLOUD_PROVIDER_FAULT_${cloudPersistenceResponse.status}`);
        }

        // 4. REPORTE DE ÉXITO OPERACIONAL (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATION_DISPATCH_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'Alerta de sistema emitida con éxito hacia la red de ciudadanos.',
          contextMetadataSnapshot: {
            recipientId: validatedNotificationData.targetRecipientIdentifierLiteral,
            priorityLiteral: validatedNotificationData.notificationPriorityLiteral,
          },
        });

        return validatedNotificationData;

      } catch (caughtError: unknown) {
        // 5. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) {
          throw caughtError;
        }

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: NOTIFICATION_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'NOTIFICATION_DISPATCH_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico al intentar emitir alerta de sistema.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_DESPACHO_DE_NOTIFICACION_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    }
  );
};
