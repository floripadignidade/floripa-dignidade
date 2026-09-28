/**
 * @section User Management & Identity - Identity Logic Orchestrators
 * @description Orquestador supremo encargado de certificar la legitimidad de la
 * identidad y validar la jurisdicción institucional (Multi-tenancy). Actúa como
 * el Guardian de Acceso, impidiendo transacciones fuera de la jerarquía permitida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad y Modularidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import {
  UserIdentitySchema,
  AccessIntegrityRequestSchema
} from '@floripa-dignidade/contracts';

import type {
  IUserIdentity,
  IAccessIntegrityRequest
} from '@floripa-dignidade/contracts';

/* 2. ENJAMBRE ATÓMICO LOCAL (Internal Swarm) */
import { EvaluateIdentityAuthorityHierarchy } from './atomic/EvaluateIdentityAuthorityHierarchy';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const ORCHESTRATOR_IDENTIFIER = 'ACCESS_INTEGRITY_ORCHESTRATOR';

/**
 * Valida integralmente el acceso de una identidad a un recurso de una organización específica.
 * Implementa el patrón "Multi-tenant Access Guard" con rastro forense inalterable.
 *
 * @param unvalidatedIdentitySnapshot - Rastro de identidad (Sesión/Token/API).
 * @param accessRequestSnapshot - Requisitos de acceso y jurisdicción de destino.
 * @returns {Promise<IUserIdentity>} Identidad purificada tras superar todas las aduanas.
 * @throws {ValidationException} Si se detecta violación de contrato o de jurisdicción.
 *
 * @prompt_ia: "Verifica que el 'organizationIdentifier' de la identidad coincida
 * con el 'targetOrganizationIdentifier' del request, excepto para el rol SRE_AUDITOR."
 */
export const ValidateAccessIntegrity = async (
  unvalidatedIdentitySnapshot: unknown,
  accessRequestSnapshot: IAccessIntegrityRequest,
): Promise<IUserIdentity> => {
  const { correlationIdentifier } = accessRequestSnapshot;

  return await TraceExecutionTime(
    ORCHESTRATOR_IDENTIFIER,
    'EXECUTE_MULTI_TENANT_ACCESS_AUDIT',
    correlationIdentifier,
    async () => {

      // --- FASE 1: INTEGRIDAD ESTRUCTURAL (ADN Audit) ---
      const identityValidationResult = UserIdentitySchema.safeParse(unvalidatedIdentitySnapshot);
      const requestValidationResult = AccessIntegrityRequestSchema.safeParse(accessRequestSnapshot);

      if (!identityValidationResult.success || !requestValidationResult.success) {
        throw new ValidationException('ACCESS_REQUEST_DNA_CORRUPTED', {
          identityIssues: identityValidationResult.error?.flatten(),
          requestIssues: requestValidationResult.error?.flatten(),
          correlationIdentifier
        });
      }

      const authenticatedIdentitySnapshot = identityValidationResult.data;
      const validatedRequest = requestValidationResult.data;

      // --- FASE 2: EVALUACIÓN DE JURISDICCIÓN (Multi-tenancy Enforcement) ---
      /**
       * 🛡️ LEY ZENITH: Un usuario solo puede actuar sobre su propia organización.
       * Los auditores de infraestructura poseen bypass de jurisdicción global.
       */
      const isSovereignAuditorBoolean =
        authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral === 'INFRASTRUCTURE_SOVEREIGN_AUDITOR';

      const isCorrectJurisdictionBoolean =
        authenticatedIdentitySnapshot.organizationIdentifier === validatedRequest.targetOrganizationIdentifier;

      if (!isSovereignAuditorBoolean && !isCorrectJurisdictionBoolean) {
        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
          operationCodeLiteral: 'CROSS_TENANT_ACCESS_VIOLATION',
          correlationIdentifier,
          messageContentLiteral: 'Bloqueo de seguridad: Se detectó un intento de acceso fuera de la jurisdicción permitida.',
          semanticIntentTag: 'SECURITY_BREACH_PREVENTION',
          contextMetadataSnapshot: {
            identityOrg: authenticatedIdentitySnapshot.organizationIdentifier,
            targetOrg: validatedRequest.targetOrganizationIdentifier
          }
        });

        throw new ValidationException('INVALID_INSTITUTIONAL_JURISDICTION', { correlationIdentifier });
      }

      // --- FASE 3: EVALUACIÓN DE JERARQUÍA (RBAC Enforcement) ---
      const isAuthorizedBoolean = await EvaluateIdentityAuthorityHierarchy({
        activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
        requiredRoleLiteral: validatedRequest.requiredAccessRoleLiteral
      });

      if (!isAuthorizedBoolean) {
        throw new ValidationException('INSUFFICIENT_AUTHORITY_FOR_Jurisdiction', {
          correlationIdentifier,
          activeRole: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral
        });
      }

      // --- FASE 4: REPORTE DE ÉXITO ---
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: ORCHESTRATOR_IDENTIFIER,
        operationCodeLiteral: 'ACCESS_GRANTED_NOMINAL',
        correlationIdentifier,
        messageContentLiteral: 'Autorización multi-tenant concedida con éxito.',
        semanticIntentTag: 'ACCESS_CONTROL_NOMINAL'
      });

      return authenticatedIdentitySnapshot;
    }
  );
};
