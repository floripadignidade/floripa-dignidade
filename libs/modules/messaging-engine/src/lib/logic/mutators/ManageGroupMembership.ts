/**
 * @section Messaging Logic - Group Membership Orchestrator
 * @description Orquestador de élite encargado de gestionar la vinculación de
 * ciudadanos con Action Hubs territoriales. Coordina la validación de ADN,
 * la seguridad de red y la persistencia inmutable del historial en el Ledger.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & Swarm Intelligence.
 * SANEADO Zenith: Resolución de Paradoja Asíncrona (await) en Aduana de Entorno.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';
import { ValidateEnvironmentAduana } from '@floripa-dignidade/environment-validator';
import { InternalSystemException, ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN de Intención (Aduana Atómica) */
/**
 * @name MembershipActionSchema
 * @description Define el contrato de integridad para las transiciones de membresía.
 */
const MembershipActionSchema = z
  .object({
    groupIdentifier: z
      .string()
      .uuid()
      .describe('Identificador del Hub de Comunicación de destino.'),

    citizenIdentifier: z.string().uuid().describe('UUID de la identidad ciudadana solicitante.'),

    membershipActionLiteral: z
      .enum(['JOIN', 'LEAVE'])
      .describe('Tipo de transición de membresía (Alta/Baja).'),
  })
  .readonly();

/* 2. Enjambre Atómico (Internal Swarm) */
import { CreateSovereignDatabaseHeaders } from '../dispatchers/CreateSovereignDatabaseHeaders';
import { PersistMembershipTransition } from '../dispatchers/PersistMembershipTransition';

/** Identificador técnico del aparato para el Neural Sentinel. */
const MEMBERSHIP_ORCHESTRATOR_IDENTIFIER = 'GROUP_MEMBERSHIP_ORCHESTRATOR';

/**
 * Gestiona integralmente la entrada o salida de un ciudadano en un grupo.
 * Implementa el patrón "Cloud Sovereign" garantizando la resolución asíncrona de
 * infraestructura antes de impactar el Ledger de comunidades.
 *
 * @param unvalidatedRequestSnapshot - Datos crudos de la solicitud capturados en la UI.
 * @returns {Promise<boolean>} Verdadero si el estado de membresía fue sincronizado.
 * @throws {ValidationException} Si los identificadores o la acción son inválidos.
 * @throws {InternalSystemException} Si la comunicación con el Tier de Datos falla.
 */
export const ManageGroupMembership = async (
  unvalidatedRequestSnapshot: unknown,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MEMBERSHIP_TRANSITION_FLOW',
    correlationIdentifier,
    async () => {
      try {
        /**
         * 1. CAPTURA DE INFRAESTRUCTURA (Sovereign Secrets)
         * 🛡️ SANEADO Zenith (Fix TS2339): Inyección de await mandatorio.
         * La resolución de secretos se audita ahora dentro del rastro de latencia.
         */
        const { SUPABASE_URL: cloudUrlLiteral, SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret } =
          await ValidateEnvironmentAduana();

        // 2. ADUANA DE ADN (Safe Parsing)
        const validationResult = MembershipActionSchema.safeParse(unvalidatedRequestSnapshot);

        if (!validationResult.success) {
          /** Reporte de violación estructural antes del colapso */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
            operationCodeLiteral: 'MEMBERSHIP_ADN_CONTRACT_VIOLATION',
            correlationIdentifier,
            messageContentLiteral: 'La estructura de la solicitud de membresía es ilegítima.',
            contextMetadataSnapshot: { issuesCollection: validationResult.error.flatten() },
          });

          throw new ValidationException('DATOS_DE_MEMBRESIA_INVALIDOS', {
            issuesCollection: validationResult.error.flatten(),
          });
        }

        const { groupIdentifier, citizenIdentifier, membershipActionLiteral } =
          validationResult.data;

        // 3. LÓGICA DE ESTADO (Join/Leave Mapping)
        /**
         * Traducimos la intención de la UI a estados ontológicos del Ledger.
         */
        const targetStatusLiteral = membershipActionLiteral === 'JOIN' ? 'ACTIVE' : 'LEFT_INACTIVE';

        // 4. SEGURIDAD Y PERSISTENCIA (Delegación Atómica)
        /**
         * @section DRY Standard
         * Reutilizamos el generador de cabeceras soberanas con preferencia 'minimal'.
         */
        const securityHeadersSnapshot = CreateSovereignDatabaseHeaders(
          cloudSecurityKeySecret,
          'minimal',
        );

        await PersistMembershipTransition(cloudUrlLiteral, securityHeadersSnapshot, {
          group_id: groupIdentifier,
          citizen_id: citizenIdentifier,
          membership_status: targetStatusLiteral,
          last_action_correlation_id: correlationIdentifier,
          updated_at: new Date().toISOString(),
        });

        // 5. REPORTE DE ÉXITO (SRE Analytics)
        void EmitTelemetrySignal({
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: `MEMBERSHIP_${membershipActionLiteral}_SUCCESS`,
          correlationIdentifier,
          messageContentLiteral: `Soberanía de membresía actualizada exitosamente: [${membershipActionLiteral}].`,
          contextMetadataSnapshot: {
            groupIdentifier,
            citizenIdentifier,
            targetStatusLiteral,
          },
        });

        return true;
      } catch (caughtError: unknown) {
        // 6. GESTIÓN FORENSE DE FALLO (Resilience Layer)
        if (caughtError instanceof ValidationException) throw caughtError;

        const errorDescriptionLiteral =
          caughtError instanceof Error ? caughtError.message : String(caughtError);

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: MEMBERSHIP_ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'MEMBERSHIP_ORCHESTRATION_COLLAPSE',
          correlationIdentifier,
          messageContentLiteral: 'Error crítico en el orquestador de membresías ciudadanas.',
          contextMetadataSnapshot: { errorTraceLiteral: errorDescriptionLiteral },
        });

        throw new InternalSystemException('FALLO_EN_ORQUESTACION_DE_MEMBRESIA_SRE', {
          originalErrorLiteral: errorDescriptionLiteral,
          correlationIdentifier,
        });
      }
    },
  );
};
