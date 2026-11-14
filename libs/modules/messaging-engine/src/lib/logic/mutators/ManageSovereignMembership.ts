/**
 * @section Messaging Logic - Enterprise Group Membership Mutator (Orchestrator)
 * @description Orquestador de lógica pura encargado de las transiciones de estado
 * de membresía ciudadana en Círculos de Comunicación (Action Hubs). Implementa
 * el protocolo de moderación y preservación forense de registros en el Ledger
 * relacional, asegurando la trazabilidad y la integridad de la gobernanza institucional.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  ReportForensicException,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { CreatePrimaryDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders';
import { PersistMembershipTransition } from '../dispatchers/PersistMembershipTransition';
import {
  type IManageGroupMembershipParameters,
  ManageGroupMembershipParametersSchema,
  type TMembershipStatus,
} from './atomic/schemas/ManageGroupMembership.schema';

export {
  ManageGroupMembershipParametersSchema,
  type IManageGroupMembershipParameters,
  type TMembershipStatus,
};

const MEMBERSHIP_ORCHESTRATOR_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'ENTERPRISE_GROUP_MEMBERSHIP_ORCHESTRATOR',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

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
  correlationIdentifierFallback?: string,
): Promise<boolean> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

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
        const validationException = new ValidationException(
          'PARAMETROS_MUTACION_MEMBRESIA_INVALIDOS',
          {
            validationIssuesCollection: parametersValidationResultSnapshot.error.flatten(),
            correlationIdentifier,
          },
        );

        ReportForensicException(validationException, correlationIdentifier);
        throw validationException;
      }

      try {
        // 2. CAPTURA SEGURA DE INFRAESTRUCTURA (Aduana de Entorno)
        const {
          SUPABASE_URL: cloudProviderUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentContract();

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
          contextMetadataSnapshot: Object.freeze({
            groupIdentifierLiteral,
            citizenIdentifierLiteral,
            targetStatusLiteral,
          }),
        });

        return true;
      } catch (caughtExecutionError: unknown) {
        if (caughtExecutionError instanceof GlobalBaseException) {
          throw caughtExecutionError;
        }

        const errorDescriptionLiteral =
          caughtExecutionError instanceof Error
            ? caughtExecutionError.message
            : String(caughtExecutionError);

        const internalException = new InternalSystemException(
          'FALLO_EN_TRANSICION_DE_MEMBRESIA_SRE',
          {
            originalErrorLiteral: errorDescriptionLiteral,
            correlationIdentifier,
            targetStatusLiteral,
          },
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MEMBERSHIP_TRANSITION_COLLAPSE' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: 'Error crítico al intentar transicionar el estado de membresía.',
          semanticIntentTag: 'GOVERNANCE_INFRASTRUCTURE_FAULT',
          contextMetadataSnapshot: Object.freeze({
            errorTraceLiteral: errorDescriptionLiteral,
            targetStatusLiteral,
          }),
        });

        ReportForensicException(internalException, correlationIdentifier);
        throw internalException;
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
