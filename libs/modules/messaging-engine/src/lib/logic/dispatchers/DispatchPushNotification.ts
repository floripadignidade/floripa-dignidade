/**
 * @section Messaging Logic - Push Notification Orchestrator
 * @description Orquestador de élite encargado de la gestión de alertas PWA.
 * Coordina la validación de ADN, la protección de privacidad (LGPD), la
 * detección de alcance de hardware y el despacho físico hacia el Gateway.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Enmascaramiento de PII, atomización de alcance y rastro i18n.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import { MaskSovereignIdentity } from '@floripa-dignidade/shared-utility';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { PushPayloadSchema } from '../../schemas/PushPayload.schema';
import type { IPushPayload } from '../../schemas/PushPayload.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';
import { TransmitPushSignal } from './TransmitPushSignal';
import { VerifyCitizenPushReachability } from './atoms/VerifyCitizenPushReachability';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PUSH_ORCHESTRATOR_IDENTIFIER = 'WEB_PUSH_GATEWAY_ORCHESTRATOR';

/**
 * Ejecuta el despacho integral de una notificación Push al dispositivo del ciudadano.
 * Implementa el patrón "Cloud Sovereign" con protección de identidad forense.
 *
 * @param targetCitizenIdentifier - UUID del destinatario legítimo.
 * @param unvalidatedPushPayloadSnapshot - Datos crudos de la alerta visual.
 * @returns {Promise<boolean>} Verdadero si la señal fue aceptada para entrega.
 */
export const DispatchPushNotification = async (
  targetCitizenIdentifier: string,
  unvalidatedPushPayloadSnapshot: unknown
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * 🛡️ PROTECCIÓN DE PRIVACIDAD (PII Masking)
   * Enmascaramos el identificador del ciudadano para que el rastro de
   * telemetría no exponga datos sensibles en logs de auditoría.
   */
  const maskedRecipientIdLiteral = MaskSovereignIdentity({
    rawIdentityLiteral: targetCitizenIdentifier,
    maskingStrategyLiteral: 'CITIZEN_NAME'
  });

  return await TraceExecutionTime(
    PUSH_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_PUSH_NOTIFICATION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        // 1. CAPTURA DE INFRAESTRUCTURA (Aduana de Entorno)
        const {
          SUPABASE_URL: cloudUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = PushPayloadSchema.safeParse(unvalidatedPushPayloadSnapshot);

        if (!validationResult.success) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'CRITICAL',
            moduleIdentifierLiteral: PUSH_ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'PUSH_PAYLOAD_DNA_CORRUPTION',
            correlationIdentifier,
            messageContentLiteral: 'MESSAGING.ERRORS.MESSAGE_ADN_CORRUPTED',
            contextMetadataSnapshot: {
              recipientMask: maskedRecipientIdLiteral,
              issuesCollection: validationResult.error.flatten()
            }
          });

          throw new ValidationException('ADN_DE_NOTIFICACION_PUSH_CORRUPTO');
        }

        const validatedPayload: IPushPayload = validationResult.data;

        // 3. SENSOR DE ALCANCE (Hardware Detection)
        const { isReachableBoolean, pushTokenSecret } = await VerifyCitizenPushReachability(
          targetCitizenIdentifier,
          cloudUrlLiteral,
          cloudSecurityKeySecret
        );

        if (!isReachableBoolean || !pushTokenSecret) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'INFO',
            moduleIdentifierLiteral: PUSH_ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'CITIZEN_HARDWARE_UNREACHABLE',
            correlationIdentifier,
            messageContentLiteral: 'Despacho cancelado: El ciudadano no posee PWA vinculada.',
            contextMetadataSnapshot: { recipientMask: maskedRecipientIdLiteral }
          });
          return false;
        }

        // 4. SEGURIDAD Y TRANSMISIÓN (I/O Delegation)
        const securityHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'minimal');

        await TransmitPushSignal(
          cloudUrlLiteral,
          securityHeaders,
          pushTokenSecret,
          validatedPayload,
          correlationIdentifier
        );

        // 5. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PUSH_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'PUSH_SIGNAL_DISPATCHED_NOMINAL',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.LOGS.NOTIFICATION_BROADCAST_SUCCESS',
          contextMetadataSnapshot: {
            recipientMask: maskedRecipientIdLiteral,
            tagIdentifier: validatedPayload.notificationTagIdentifier
          }
        });

        return true;

      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: PUSH_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'PUSH_ORCHESTRATION_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en el orquestador de alertas PWA.',
          contextMetadataSnapshot: {
            errorTrace: errorDescriptionLiteral,
            recipientMask: maskedRecipientIdLiteral
          },
        });

        throw new InternalSystemException('FALLO_EN_DESPACHO_PUSH_SRE', {
          originalError: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    }
  );
};
