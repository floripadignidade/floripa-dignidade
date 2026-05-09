/**
 * @section Messaging Logic - Direct Message Orchestrator
 * @description Orquestador de élite encargado de la transmisión de mensajes privados.
 * Coordina la validación de ADN, la transformación de datos, la inyección de
 * seguridad y la persistencia cloud en el Data Lake.
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
import { DirectMessageSchema } from '../../schemas/DirectMessage.schema';
import type { IDirectMessage } from '../../schemas/DirectMessage.schema';

/* 2. Enjambre Atómico (Internal Swarm) */
import { MapDirectMessageToPersistence } from '../mappers/MapDirectMessageToPersistence';
import { PersistDirectMessageTransaction } from './PersistDirectMessageTransaction';
import { CreateSovereignDatabaseHeaders } from './CreateSovereignDatabaseHeaders';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MESSAGE_DISPATCHER_IDENTIFIER = 'DIRECT_MESSAGE_TRANSACTION_ORCHESTRATOR';

/**
 * Ejecuta el envío integral de un mensaje privado con soporte multimedia.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución de
 * secretos antes de la persistencia física.
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
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const {
          SUPABASE_URL: cloudStorageUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = DirectMessageSchema.safeParse(unvalidatedMessagePayloadSnapshot);

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
            operationCodeLiteral: 'MESSAGE_CONTRACT_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura del mensaje directo es inválida o está corrompida.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() }
          });

          throw new ValidationException('ESTRUCTURA_DE_MENSAJE_INVALIDA', {
            issuesCollection: validationResult.error.flatten()
          });
        }

        const validatedMessage: IDirectMessage = validationResult.data;

        // 3. SEGURIDAD Y TRANSFORMACIÓN (Protocol Translation)
        const databaseHeaders = CreateSovereignDatabaseHeaders(cloudSecurityKeySecret, 'representation');
        const databasePayload = MapDirectMessageToPersistence(validatedMessage, correlationIdentifier);

        // 4. PERSISTENCIA FÍSICA (Delegación Atómica I/O)
        await PersistDirectMessageTransaction(
          cloudStorageUrlLiteral,
          databaseHeaders,
          databasePayload
        );

        // 5. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'DIRECT_MESSAGE_SENT_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'Mensaje directo cifrado y enviado exitosamente.',
          contextMetadataSnapshot: {
            attachmentsQuantity: validatedMessage.attachedMediaIdentifiersCollection.length,
            isSensitiveBoolean: validatedMessage.containsSensitiveInformationBoolean
          },
        });

        return validatedMessage;

      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: MESSAGE_DISPATCHER_IDENTIFIER,
          operationCodeLiteral: 'MESSAGE_DISPATCH_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Colapso crítico en el orquestador de mensajería directa.',
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
