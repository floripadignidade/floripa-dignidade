/**
 * @section Messaging Logic - Communication Group Orchestrator
 * @description Orquestador de élite encargado de la creación y registro de Action Hubs
 * (Círculos de Comunicación). Implementa el patrón Swarm Orchestration, delegando
 * la validación de autoridad, integridad de ADN y persistencia en átomos especializados.
 *
 * Protocolo OEDP-V17.0 - Swarm Intelligence & High Performance SRE.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import type { IUserIdentity } from '@floripa-dignidade/identity';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN Estructural (Verbatim Module Syntax) */
import type { ICommunicationGroup } from '../../schemas/CommunicationGroup.schema';

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { ValidateGroupCreationAuthority } from '../atomic/ValidateGroupCreationAuthority';
import { ValidateCommunicationGroupAdn } from '../atomic/ValidateCommunicationGroupAdn';
import { MapCommunicationGroupToPersistence } from '../mappers/MapCommunicationGroupToPersistence';
import { PersistCommunicationGroup } from '../dispatchers/PersistCommunicationGroup';

/** Identificador técnico del aparato para el Neural Sentinel. */
const ORCHESTRATOR_IDENTIFIER = 'MESSAGING_GROUP_CREATOR_ORCHESTRATOR';

/**
 * Ejecuta el flujo integral de creación de un Action Hub institucional o territorial.
 * Garantiza que el actor posea la soberanía necesaria antes de impactar el Ledger.
 *
 * @param unvalidatedPayload - Datos crudos del nuevo grupo capturados en la interfaz.
 * @param actorIdentity - Snapshot de la identidad soberana que ejecuta la acción.
 * @returns {Promise<ICommunicationGroup>} ADN del grupo creado y validado.
 * @throws {ValidationException} Si la autoridad es insuficiente o el ADN es corrupto.
 * @throws {InternalSystemException} Si la infraestructura cloud colapsa.
 */
export const CreateCommunicationGroup = async (
  unvalidatedPayload: unknown,
  actorIdentity: IUserIdentity
): Promise<ICommunicationGroup> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_ACTION_HUB_CREATION_PIPELINE',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const {
          SUPABASE_URL: cloudUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 2. VALIDACIÓN DE AUTORIDAD (Security Border)
        /**
         * Delegamos en el átomo de autoridad institucional para verificar
         * si el actor posee rango para crear círculos de comunicación.
         */
        ValidateGroupCreationAuthority(actorIdentity.assignedAuthorityRoleLiteral);

        // 3. VALIDACIÓN DE ADN (Safe Parsing)
        const validatedGroupData = ValidateCommunicationGroupAdn(unvalidatedPayload);

        // 4. MAPEO DE PERSISTENCIA (Protocol Translation)
        const persistencePayload = MapCommunicationGroupToPersistence(
          validatedGroupData,
          actorIdentity.identityIdentifier,
          correlationIdentifier
        );

        // 5. DESPACHO A PERSISTENCIA CLOUD (I/O Delegation)
        await PersistCommunicationGroup(
          cloudUrlLiteral,
          cloudSecurityKeySecret,
          persistencePayload
        );

        // 6. REPORTE DE ÉXITO (SRE Visibility)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'ACTION_HUB_CREATED_SUCCESSFULLY',
          correlationIdentifier,
          messageContentLiteral: 'Nuevo Círculo de Comunicación registrado exitosamente en el Ledger.',
          contextMetadataSnapshot: {
            groupIdentifier: validatedGroupData.groupIdentifier,
            creatorIdentityIdentifier: actorIdentity.identityIdentifier,
            technicalSlugLiteral: validatedGroupData.technicalSlugLiteral
          },
        });

        return validatedGroupData;

      } catch (caughtError: unknown) {
        // 7. GESTIÓN FORENSE DE FALLO (Resilience Layer)

        /** 🛡️ SANEADO: Propagación de excepciones de negocio conocidas */
        if (caughtError instanceof ValidationException) {
          throw caughtError;
        }

        const errorDescriptionLiteral = caughtError instanceof Error
          ? caughtError.message
          : String(caughtError);

        /** Alerta Crítica para el Neural Sentinel en caso de colapso de infraestructura */
        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'GROUP_CREATION_PIPELINE_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Fallo catastrófico en la orquestación de creación de grupo.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_ORQUESTACION_DE_ACTION_HUB_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          actorIdentifierLiteral: actorIdentity.identityIdentifier
        });
      }
    }
  );
};
