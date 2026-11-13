/**
 * @section Messaging Logic - Enterprise Group Membership Mutator (Orchestrator)
 * @description Orquestador de lógica pura encargado de las transiciones de estado
 * de membresía ciudadana en Círculos de Comunicación (Action Hubs). Implementa
 * el protocolo de moderación y preservación forense de registros en el Ledger
 * relacional, asegurando la trazabilidad y la integridad de la gobernanza institucional.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO: Purga definitiva de metáforas informales ("Sovereign"), incorporación de validación
 * de parámetros con Zod, resolución asíncrona de entorno y alias retroactivos para cero roturas.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

/* 1. Infraestructura Core de Entorno, Excepciones y Telemetría */
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos de ADN Estructural (Importación Canónica Relativa) */
import {
  MembershipStatusSchema,
  type TMembershipStatus,
} from '../../schemas/CommunicationGroupMembership.schema.js';

/* 3. Enjambre Atómico de Despacho y Seguridad */
import { CreatePrimaryDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders.js';
import { PersistMembershipTransition } from '../dispatchers/PersistMembershipTransition.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const MEMBERSHIP_ORCHESTRATOR_IDENTIFIER =
  'ENTERPRISE_GROUP_MEMBERSHIP_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @name ManageGroupMembershipParametersSchema
 * @description Contrato Zod para la validación perimetral de los parámetros de mutación de membresía.
 */
export const ManageGroupMembershipParametersSchema = z
  .object({
    /** Identificador único del Círculo de Comunicación (Action Hub). */
    groupIdentifierLiteral: z
      .string()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_GRUPO_DEBE_SER_UUID_VALIDO' }),

    /** Identificador único del ciudadano sujeto a la transición de estado. */
    citizenIdentifierLiteral: z
      .string()
      .uuid({ message: 'EL_IDENTIFICADOR_DE_CIUDADANO_DEBE_SER_UUID_VALIDO' }),

    /** Estado ontológico de la membresía (ACTIVE, PAUSED, LEFT_INACTIVE, BANNED_BY_MODERATION, REPRESENTED). */
    targetStatusLiteral: MembershipStatusSchema,
  })
  .readonly();

/** Tipo inferido inmutable para los parámetros de mutación de membresía. */
export type IManageGroupMembershipParameters = z.infer<
  typeof ManageGroupMembershipParametersSchema
>;

/**
 * Ejecuta una transición de estado sobre la membresía de un ciudadano en un Círculo de Comunicación.
 * Valida perimetralmente los identificadores, resuelve las credenciales del Ledger Cloud y
 * ejecuta la mutación física mediante protocolo PostgREST seguro.
 *
 * @param groupIdentifierLiteral - Identificador UUID del grupo de comunicación objetivo.
 * @param citizenIdentifierLiteral - Identificador UUID del ciudadano bajo transición de estado.
 * @param targetStatusLiteral - Nuevo estatus ontológico de la membresía.
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<boolean>} Promesa que resuelve en verdadero si la mutación fue aceptada por la base de datos.
 * @throws {ValidationException} Si los parámetros de entrada violan el contrato estructural.
 * @throws {InternalSystemException} Si ocurre un colapso en la infraestructura de datos cloud.
 */
export const ManageEnterpriseGroupMembership = async (
  groupIdentifierLiteral: string,
  citizenIdentifierLiteral: string,
  targetStatusLiteral: TMembershipStatus,
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<boolean> => {
  const correlationIdentifier = correlationIdentifierFallback;

  return await TraceExecutionTime(
    MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
    `EXECUTE_MEMBERSHIP_TRANSITION_TO_${targetStatusLiteral}` as OperationCode,
    correlationIdentifier,
    async (): Promise<boolean> => {
      // 1. VALIDACIÓN PERIMETRAL DE ENTRADA (Contract Guard)
      const parametersValidationResultSnapshot = ManageGroupMembershipParametersSchema.safeParse({
        groupIdentifierLiteral,
        citizenIdentifierLiteral,
        targetStatusLiteral,
      });

      if (!parametersValidationResultSnapshot.success) {
        throw new ValidationException('PARAMETROS_MUTACION_MEMBRESIA_INVALIDOS', {
          validationIssuesCollection: parametersValidationResultSnapshot.error.flatten(),
          correlationIdentifier,
        });
      }

      try {
        // 2. CAPTURA SEGURA DE INFRAESTRUCTURA (Aduana de Entorno)
        const {
          SUPABASE_URL: cloudProviderUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentAduana();

        // 3. SEGURIDAD Y PREPARACIÓN DE CABECERAS (Protocol Translation)
        const securityHeadersSnapshot = CreatePrimaryDatabaseHeaders(
          cloudSecurityKeySecret,
          'minimal',
        );

        // 4. PERSISTENCIA FÍSICA EN EL LEDGER CLOUD (Stateless I/O)
        const membershipMutationPayloadSnapshot = Object.freeze({
          group_id: groupIdentifierLiteral,
          citizen_id: citizenIdentifierLiteral,
          membership_status: targetStatusLiteral,
          last_action_correlation_id: correlationIdentifier,
          updated_at: new Date().toISOString(),
        });

        await PersistMembershipTransition(
          cloudProviderUrlLiteral,
          securityHeadersSnapshot,
          membershipMutationPayloadSnapshot,
        );

        // 5. REPORTE DE TELEMETRÍA FORENSE (Visibilidad Operativa)
        const isStatusCriticalWarningBoolean = targetStatusLiteral === 'BANNED_BY_MODERATION';

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isStatusCriticalWarningBoolean ? 'WARNING' : 'INFO',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MEMBERSHIP_STATE_SYNCHRONIZED' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: `Estado de membresía institucional actualizado exitosamente: [${targetStatusLiteral}].`,
          semanticIntentTag: 'COMMUNITY_GOVERNANCE_MUTATION',
          contextMetadataSnapshot: {
            groupIdentifierLiteral,
            citizenIdentifierLiteral,
            targetStatusLiteral,
          },
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        // 6. GESTIÓN FORENSE DE COLAPSO (Resilience Layer)
        if (caughtExecutionError instanceof ValidationException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MEMBERSHIP_TRANSITION_COLLAPSE' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: 'Error crítico al intentar transicionar el estado de membresía.',
          semanticIntentTag: 'GOVERNANCE_INFRASTRUCTURE_FAULT',
          contextMetadataSnapshot: {
            errorTraceLiteral: errorDescriptionLiteral,
            targetStatusLiteral,
          },
        });

        throw new InternalSystemException('FALLO_EN_TRANSICION_DE_MEMBRESIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
          targetStatusLiteral,
        });
      }
    },
  );
};

/**
 * @name ManageSovereignMembership
 * @description Alias institucional de compatibilidad histórica para transiciones en el monorepo.
 * @deprecated Utilizar canónicamente 'ManageEnterpriseGroupMembership' bajo el estándar OEDP-V18.1.
 */
export const ManageSovereignMembership = ManageEnterpriseGroupMembership;
