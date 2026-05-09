/**
 * @section Messaging Logic - Push Notification Orchestrator
 * @description Orquestador de élite encargado de la gestión de alertas PWA.
 * Coordina la validación de ADN visual, la detección de tokens de hardware
 * y el despacho físico mediante el enjambre de átomos especializados.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
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
import { PushPayloadSchema } from '../../schemas/PushPayload.schema';
import type { IPushPayload } from '../../schemas/PushPayload.schema';

/* 2. Enjambre Atómico Interno (Swiss-Watch Swarm) */
import { GetCitizenPushToken } from '../queries/GetCitizenPushToken';
import { TransmitPushSignal } from './TransmitPushSignal';
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const PUSH_DISPATCHER_IDENTIFIER = 'WEB_PUSH_GATEWAY_ORCHESTRATOR';

/**
 * Ejecuta el despacho integral de una notificación Push al dispositivo del ciudadano.
 * Implementa el patrón "Cloud Sovereign" garantizando que los secretos de red
 * estén plenamente resueltos antes de la invocación del Gateway.
 *
 * @param targetCitizenIdentifier - UUID del destinatario legítimo.
 * @param unvalidatedPushPayloadSnapshot - Datos crudos de la alerta visual.
 * @returns {Promise<boolean>} Verdadero si la señal fue aceptada por el Gateway de entrega.
 * @throws {ValidationException} Si el payload viola el contrato de integridad.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa.
 */
export const DispatchPushNotification = async (
  targetCitizenIdentifier: string,
  unvalidatedPushPayloadSnapshot: unknown
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    PUSH_DISPATCHER_IDENTIFIER,
    'EXECUTE_PUSH_NOTIFICATION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Aislamiento de Hardware)
         * 🛡️ SANEADO Zenith: Inyección de await para resolver el contrato de secretos.
         * La aduana garantiza que SUPABASE_URL y SERVICE_KEY sean Branded Types válidos.
         */
        const {
          SUPABASE_URL: cloudUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = PushPayloadSchema.safeParse(unvalidatedPushPayloadSnapshot);

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: PUSH_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'PUSH_ADN_CONTRACT_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura de la notificación Push es inválida o está corrupta.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() }
          });

          throw new ValidationException('CONTRATO_PUSH_INVALIDO', {
            issuesCollection: validationResult.error.flatten()
          });
        }

        const validatedPayload: IPushPayload = validationResult.data;

        // 3. SENSOR DE PRESENCIA (Recuperación de Token de Hardware)
        const activePushTokenLiteral = await GetCitizenPushToken(
          targetCitizenIdentifier,
          cloudUrlLiteral,
          cloudSecurityKeySecret
        );

        if (!activePushTokenLiteral) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'INFO',
            moduleIdentifierLiteral: PUSH_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'CITIZEN_DEVICE_UNREACHABLE',
            correlationIdentifier,
            messageContentLiteral: 'Notificación cancelada: El ciudadano no posee PWA autorizada.',
          });
          return false;
        }

        // 4. SEGURIDAD Y TRANSMISIÓN (Delegación Atómica)
        const securityHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'minimal');

        await TransmitPushSignal(
          cloudUrlLiteral,
          securityHeaders,
          activePushTokenLiteral,
          validatedPayload,
          correlationIdentifier
        );

        // 5. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: PUSH_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'PUSH_DELIVERY_CONFIRMED',
          correlationIdentifier,
          messageContentLiteral: 'Señal de alerta entregada al sistema operativo del ciudadano.',
          contextMetadataSnapshot: { citizenId: targetCitizenIdentifier }
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
          moduleIdentifierLiteral: PUSH_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'PUSH_FLOW_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Colapso crítico en el orquestador de notificaciones Push.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_DESPACHO_PUSH_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    }
  );
};
