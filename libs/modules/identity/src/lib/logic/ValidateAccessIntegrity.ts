// libs/modules/identity/src/lib/logic/ValidateAccessIntegrity.ts

/**
 * @section User Management & Identity - Identity Logic Orchestrators
 * @description Orquestador supremo encargado de certificar la legitimidad de la
 * identidad ciudadana y validar la jurisdicción institucional (Multi-tenancy). Actúa como
 * el guardián de control de acceso perimetral, impidiendo transacciones fuera de la
 * jerarquía de autoridad permitida y protegiendo el aislamiento de datos entre organizaciones.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Modularidad).
 * SANEADO Zenith: Erradicación definitiva de la comparación inválida TS2367 alineando
 * el rol de auditoría a INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR y purga de metáforas informales.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  AccessIntegrityRequestSchema,
  IDENTITY_ACCESS_ROLES_COLLECTION,
  UserIdentitySchema,
  type IAccessIntegrityRequest,
  type IUserIdentity,
} from '@floripa-dignidade/contracts';

/* 2. Enjambre Atómico Local (Internal Swarm) */
import { EvaluateIdentityAuthorityHierarchy } from './atomic/EvaluateIdentityAuthorityHierarchy';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_IDENTIFIER = 'ACCESS_INTEGRITY_ORCHESTRATOR' as ModuleIdentifier;

/**
 * Valida integralmente el acceso de una identidad a un recurso de una organización específica.
 * Implementa el patrón "Multi-tenant Access Guard" con rastro de auditoría forense inalterable.
 *
 * @param unvalidatedIdentitySnapshot - Rastro de identidad no purificado (Sesión, Token o API Payload).
 * @param accessRequestSnapshot - Requisitos mínimos de acceso y jurisdicción institucional de destino.
 * @returns {Promise<IUserIdentity>} Identidad purificada y validada tras superar todas las aduanas perimetrales.
 * @throws {ValidationException} Si se detecta violación de contrato de datos, autoridad insuficiente o acceso cruzado entre tenants no autorizado.
 */
export const ValidateAccessIntegrity = async (
  unvalidatedIdentitySnapshot: unknown,
  accessRequestSnapshot: IAccessIntegrityRequest,
): Promise<IUserIdentity> => {
  const { correlationIdentifier } = accessRequestSnapshot;

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MULTI_TENANT_ACCESS_AUDIT' as OperationCode,
    correlationIdentifier,
    async (): Promise<IUserIdentity> => {
      // --- FASE 1: INTEGRIDAD ESTRUCTURAL (Aduana de ADN) ---
      const identityValidationResult = UserIdentitySchema.safeParse(unvalidatedIdentitySnapshot);
      const requestValidationResult = AccessIntegrityRequestSchema.safeParse(accessRequestSnapshot);

      if (!identityValidationResult.success || !requestValidationResult.success) {
        throw new ValidationException('ACCESS_REQUEST_DNA_CORRUPTED', {
          identityValidationIssuesCollection: identityValidationResult.error?.flatten(),
          requestValidationIssuesCollection: requestValidationResult.error?.flatten(),
          correlationIdentifier,
        });
      }

      const authenticatedIdentitySnapshot = identityValidationResult.data;
      const validatedAccessRequest = requestValidationResult.data;

      // --- FASE 2: EVALUACIÓN DE JURISDICCIÓN INSTITUCIONAL (Multi-tenancy Enforcement) ---
      /**
       * 🛡️ LEY DE SEGURIDAD SRE:
       * Un usuario solo puede actuar sobre los recursos de su propia organización.
       * El rol de auditor administrativo de infraestructura posee bypass de jurisdicción global
       * para fines de fiscalización técnica y recuperación del sistema.
       */
      const isAdministrativeAuditorBoolean =
        authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral ===
        IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR;

      const isCorrectJurisdictionBoolean =
        authenticatedIdentitySnapshot.organizationIdentifier ===
        validatedAccessRequest.targetOrganizationIdentifier;

      if (!isAdministrativeAuditorBoolean && !isCorrectJurisdictionBoolean) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'CROSS_TENANT_ACCESS_VIOLATION' as OperationCode,
          correlationIdentifier,
          messageContentLiteral:
            'Bloqueo de seguridad perimetral: Intento de acceso detectado fuera de la jurisdicción institucional permitida.',
          semanticIntentTag: 'SECURITY_BREACH_PREVENTION',
          contextMetadataSnapshot: {
            identityOrganizationIdentifier: authenticatedIdentitySnapshot.organizationIdentifier,
            targetOrganizationIdentifier: validatedAccessRequest.targetOrganizationIdentifier,
          },
        });

        throw new ValidationException('INVALID_INSTITUTIONAL_JURISDICTION', {
          correlationIdentifier,
          identityOrganizationIdentifier: authenticatedIdentitySnapshot.organizationIdentifier,
          targetOrganizationIdentifier: validatedAccessRequest.targetOrganizationIdentifier,
        });
      }

      // --- FASE 3: EVALUACIÓN DE JERARQUÍA INSTITUCIONAL (RBAC Enforcement) ---
      const isAuthorizedBoolean = await EvaluateIdentityAuthorityHierarchy({
        activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
        requiredRoleLiteral: validatedAccessRequest.requiredAccessRoleLiteral,
      });

      if (!isAuthorizedBoolean) {
        throw new ValidationException('INSUFFICIENT_AUTHORITY_FOR_JURISDICTION', {
          correlationIdentifier,
          activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
          requiredRoleLiteral: validatedAccessRequest.requiredAccessRoleLiteral,
        });
      }

      // --- FASE 4: REPORTE DE ÉXITO Y VISIBILIDAD FORENSE ---
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'ACCESS_GRANTED_NOMINAL' as OperationCode,
        correlationIdentifier,
        messageContentLiteral:
          'Autorización institucional y de jurisdicción multi-tenant concedida nominalmente.',
        semanticIntentTag: 'ACCESS_CONTROL_NOMINAL',
        contextMetadataSnapshot: {
          identityIdentifier: authenticatedIdentitySnapshot.identityIdentifier,
          organizationIdentifier: authenticatedIdentitySnapshot.organizationIdentifier,
          assignedAuthorityRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
        },
      });

      return authenticatedIdentitySnapshot;
    },
  );
};