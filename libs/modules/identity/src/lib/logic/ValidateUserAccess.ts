/**
 * @section Identity Logic - Authority Validation Orchestrator
 * @description Orquestador encargado de validar la integridad de la identidad ciudadana
 * y verificar el cumplimiento de los requisitos de autoridad para una transacción.
 * Actúa como el punto de control perimetral (Juez de Paz) del ecosistema.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Inyección de TraceExecutionTime, Prosa ISO y etiquetas ontológicas.
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

/* 1. ADN Estructural (Verbatim Module Syntax) */
import { UserIdentitySchema } from '../schemas/UserIdentity.schema';
import type { UserAccessRole } from '../schemas/UserAccessRole.schema';
import type { IUserIdentity } from '../schemas/UserIdentity.schema';

/* 2. Enjambre Atómico de Decisión */
import { EvaluateAuthorityHierarchy } from './atomic/EvaluateAuthorityHierarchy';

/** Identificador técnico del sensor para el Neural Sentinel. */
const IDENTITY_ACCESS_SENTRY_IDENTIFIER = 'IDENTITY_ACCESS_SENTRY';

/**
 * Verifica si la identidad cumple el contrato técnico y posee autoridad legítima.
 * Implementa el patrón "Sovereign Guard" con medición de latencia en microsegundos.
 *
 * @param rawUserIdentitySnapshot - Objeto capturado de la sesión, JWT o API.
 * @param requiredAccessRoleLiteral - Nível de autoridad mínimo solicitado.
 * @returns {Promise<IUserIdentity>} Identidad purificada, validada y tipada.
 * @throws {ValidationException} Si el ADN es corrupto o la jerarquía es insuficiente.
 */
export const ValidateUserAccess = async (
  rawUserIdentitySnapshot: unknown,
  requiredAccessRoleLiteral: UserAccessRole,
): Promise<IUserIdentity> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    IDENTITY_ACCESS_SENTRY_IDENTIFIER,
    'EXECUTE_ACCESS_AUTHORIZATION_AUDIT',
    correlationIdentifier,
    async () => {
      // 1. ADUANA DE ADN (Frontera de Integridad Estructural)
      const identityValidationResult = UserIdentitySchema.safeParse(rawUserIdentitySnapshot);

      if (!identityValidationResult.success) {
        const structuralIssuesCollection = identityValidationResult.error.flatten();

        void EmitTelemetrySignal({
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: IDENTITY_ACCESS_SENTRY_IDENTIFIER,
          operationCodeLiteral: 'IDENTITY_CONTRACT_VIOLATION',
          correlationIdentifier,
          messageContentLiteral: 'La estructura de identidad proporcionada es ilegítima o está corrupta.',
          semanticIntentTag: 'SECURITY_CONTRACT_FAULT',
          contextMetadataSnapshot: { structuralIssuesCollection }
        });

        throw new ValidationException('ADN_IDENTIDAD_CORRUPTO', {
          structuralIssuesCollection,
        });
      }

      const authenticatedIdentitySnapshot: IUserIdentity = identityValidationResult.data;

      /**
       * 2. EVALUACIÓN DE JERARQUÍA ARITMÉTICA (Delegación Atómica)
       * Comparamos los pesos de autoridad institucional para permitir escalado.
       */
      const isAuthorizedBoolean = await EvaluateAuthorityHierarchy({
        activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
        requiredRoleLiteral: requiredAccessRoleLiteral
      });

      if (!isAuthorizedBoolean) {
        void EmitTelemetrySignal({
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: IDENTITY_ACCESS_SENTRY_IDENTIFIER,
          operationCodeLiteral: 'UNAUTHORIZED_ACCESS_ATTEMPT',
          correlationIdentifier,
          messageContentLiteral: `Bloqueo de seguridad: Autoridad insuficiente para la operación solicitada.`,
          semanticIntentTag: 'RBAC_VIOLATION',
          contextMetadataSnapshot: {
            citizenIdentifierLiteral: authenticatedIdentitySnapshot.identityIdentifier,
            activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
            requiredRoleLiteral: requiredAccessRoleLiteral
          }
        });

        throw new ValidationException('ACCESO_NO_AUTORIZADO', {
          requiredRoleLiteral: requiredAccessRoleLiteral,
          activeRoleLiteral: authenticatedIdentitySnapshot.assignedAuthorityRoleLiteral,
          citizenIdentifierLiteral: authenticatedIdentitySnapshot.identityIdentifier,
        });
      }

      // 3. REPORTE DE TRÁNSITO NOMINAL (SRE Visibility)
      void EmitTelemetrySignal({
        severityLevelLiteral: 'INFO',
        moduleIdentifierLiteral: IDENTITY_ACCESS_SENTRY_IDENTIFIER,
        operationCodeLiteral: 'IDENTITY_ACCESS_AUTHORIZED',
        correlationIdentifier,
        messageContentLiteral: 'Acceso perimetral autorizado: Identidad y autoridad confirmadas.',
        semanticIntentTag: 'ACCESS_CONTROL_SUCCESS'
      });

      return authenticatedIdentitySnapshot;
    }
  );
};
