/**
 * @section Messaging Logic - Direct Message Orchestrator
 * @description Orquestador de élite encargado de la transmisión de mensajes privados.
 * Coordina la validación de ADN, la protección de privacidad (LGPD), la
 * transformación de datos y la persistencia cloud en el Ledger inmutable.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Enmascaramiento de PII, rastro i18n y triaje de sensibilidad.
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
import { DirectMessageSchema } from '../../schemas/DirectMessage.schema';
import type { IDirectMessage } from '../../schemas/DirectMessage.schema';

/* 2. Enjambre Atómico Local (Swiss-Watch Swarm) */
import { MapDirectMessageToPersistence } from '../mappers/MapDirectMessageToPersistence';
import { PersistDirectMessageTransaction } from './PersistDirectMessageTransaction';
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MESSAGE_DISPATCHER_IDENTIFIER = 'DIRECT_MESSAGE_TRANSACTION_ORCHESTRATOR';

/**
 * Ejecuta el envío integral de un mensaje privado con soporte multimedia.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución de
 * secretos antes de la persistencia física y el blindaje de identidad.
 *
 * @param unvalidatedMessagePayloadSnapshot - Datos crudos del mensaje capturados en la UI.
 * @returns {Promise<IDirectMessage>} Instancia del mensaje validado y persistido.
 * @throws {ValidationException} Si el contrato de datos es violado.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa.
 */
export const SendDirectMessage = async (
  unvalidatedMessagePayloadSnapshot: unknown
): Promise<IDirectMessage> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    MESSAGE_DISPATCHER_IDENTIFIER,
    'EXECUTE_P2P_MESSAGE_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * El búnker environment-validator garantiza la carga asíncrona de secretos.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = DirectMessageSchema.safeParse(unvalidatedMessagePayloadSnapshot);

        if (!validationResult.success) {
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'MESSAGE_CONTRACT_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'MESSAGING.ERRORS.MESSAGE_ADN_CORRUPTED',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() }
          });

          throw new ValidationException('ESTRUCTURA_DE_MENSAJE_INVALIDA', {
            issuesCollection: validationResult.error.flatten()
          });
        }

        const validatedMessage: IDirectMessage = validationResult.data;

        /**
         * 3. PROTECCIÓN DE PRIVACIDAD (PII Masking)
         * Enmascaramos las identidades para el rastro de telemetría forense.
         */
        const maskedSenderLiteral = MaskSovereignIdentity({
          rawIdentityLiteral: validatedMessage.senderIdentityIdentifier,
          maskingStrategyLiteral: 'CITIZEN_NAME'
        });

        const maskedRecipientLiteral = MaskSovereignIdentity({
          rawIdentityLiteral: validatedMessage.recipientIdentityIdentifier,
          maskingStrategyLiteral: 'CITIZEN_NAME'
        });

        // 4. SEGURIDAD Y TRANSFORMACIÓN (Protocol Translation)
        const databaseHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'representation');
        const databasePayload = MapDirectMessageToPersistence(validatedMessage, correlationIdentifier);

        // 5. PERSISTENCIA FÍSICA (Delegación Atómica I/O)
        await PersistDirectMessageTransaction(
          cloudStorageUrlLiteral,
          databaseHeaders,
          databasePayload
        );

        /**
         * 6. REPORTE DE ÉXITO (SRE Visibility)
         * 🛡️ SANEADO Zenith: Triaje de sensibilidad.
         * Si el mensaje es sensible, omitimos el conteo de adjuntos en metadatos para
         * reducir la superficie de ataque por inferencia.
         */
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'DIRECT_MESSAGE_SENT_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'MESSAGING.LOGS.DIRECT_MESSAGE_DISPATCHED',
          contextMetadataSnapshot: {
            senderMask: maskedSenderLiteral,
            recipientMask: maskedRecipientLiteral,
            isSensitiveBoolean: validatedMessage.containsSensitiveInformationBoolean,
            ...(!validatedMessage.containsSensitiveInformationBoolean && {
              attachmentsQuantity: validatedMessage.attachedMediaIdentifiersCollection.length
            })
          },
        });

        return validatedMessage;

      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'MESSAGE_DISPATCH_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Error crítico en la transmisión de mensaje directo.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_PERSISTENCIA_DE_MENSAJERIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    }
  );
};
