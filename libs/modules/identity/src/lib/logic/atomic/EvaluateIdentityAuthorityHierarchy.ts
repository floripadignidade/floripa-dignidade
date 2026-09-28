/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de determinar si un rol posee autoridad
 * suficiente comparando el peso institucional del papel activo contra el nivel exigido.
 * Implementa la matriz de privilegios y el protocolo de bypass administrativo (SRE).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Calidad: ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';

/* 1. ADN ESTRUCTURAL (Consumo desde SSOT Contracts) */
import {
  EvaluateIdentityAuthoritySchema,
  USER_ACCESS_ROLES_COLLECTION
} from '@floripa-dignidade/contracts';

import type {
  IEvaluateIdentityAuthorityParameters,
  UserAccessRole
} from '@floripa-dignidade/contracts';

/** Identificador técnico del aparato para el Health Monitor (IA). */
const ATOM_IDENTIFIER = 'IDENTITY_HIERARCHY_EVALUATOR_ATOM';

/**
 * @name ROLE_AUTHORITY_WEIGHTS_MAPPING
 * @description Mapa de influencia numérica para comparación de jerarquía.
 * Define la física del poder institucional. Valores de 0 a 100.
 */
const ROLE_AUTHORITY_WEIGHTS_MAPPING: Record<UserAccessRole, number> = {
  INFRASTRUCTURE_SOVEREIGN_AUDITOR: 100,
  PLATFORM_GLOBAL_MANAGER: 90,
  ORGANIZATION_ADMINISTRATOR: 80,
  ORGANIZATION_OPERATOR: 70,
  CITIZEN_REGISTERED: 20,
  CITIZEN_ANONYMOUS: 0,
};

/**
 * Evalúa si el papel activo posee autoridad igual o superior al nivel exigido.
 *
 * @param parametersSnapshot - Snapshot conteniendo el rol activo y el requerido.
 * @returns {Promise<boolean>} Verdadero si el acceso es legítimo por peso o bypass.
 *
 * @prompt_ia: "Valida que 'activeRoleLiteral' posea un peso asignado en la matriz
 * de pesos institucional para evitar denegaciones falsas (NULL entries)."
 */
export const EvaluateIdentityAuthorityHierarchy = async (
  parametersSnapshot: IEvaluateIdentityAuthorityParameters
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ATOM_IDENTIFIER,
    'EXECUTE_AUTHORITY_HIERARCHY_EVALUATION',
    correlationIdentifier,
    async () => {

      // 1. INTEGRITY GUARD (Aduana de ADN)
      const validationResult = EvaluateIdentityAuthoritySchema.safeParse(parametersSnapshot);

      if (!validationResult.success) {
        throw new ValidationException('AUTHORITY_HIERARCHY_CONTRACT_VIOLATION', {
          validationIssuesCollection: validationResult.error.flatten(),
          correlationIdentifier
        });
      }

      const { activeRoleLiteral, requiredRoleLiteral } = validationResult.data;

      /**
       * 2. PROTOCOLO DE BYPASS ADMINISTRATIVO (SRE Logic)
       * Los roles de nivel raíz poseen autoridad total intrínseca para evitar
       * bloqueos en operaciones de recuperación de infraestructura.
       */
      const hasAdministrativeBypassBoolean =
        activeRoleLiteral === USER_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_SOVEREIGN_AUDITOR ||
        activeRoleLiteral === USER_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER;

      if (hasAdministrativeBypassBoolean) {
        return true;
      }

      // 3. EVALUACIÓN DE PESO HIERÁRQUICO (Magnitude Comparison)
      const activeAuthorityWeightNumeric = ROLE_AUTHORITY_WEIGHTS_MAPPING[activeRoleLiteral];
      const requiredAuthorityWeightNumeric = ROLE_AUTHORITY_WEIGHTS_MAPPING[requiredRoleLiteral];

      const isAuthorizedBoolean = activeAuthorityWeightNumeric >= requiredAuthorityWeightNumeric;

      // 4. REPORTE SRE (Visibility)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isAuthorizedBoolean ? 'INFO' : 'WARNING',
        moduleIdentifierLiteral: ATOM_IDENTIFIER,
        operationCodeLiteral: 'AUTHORITY_EVALUATION_COMPLETED',
        correlationIdentifier,
        messageContentLiteral: `Evaluación de acceso finalizada. Resultado: [${isAuthorizedBoolean}]`,
        semanticIntentTag: 'AUTHORIZATION_GATE_DECISION',
        contextMetadataSnapshot: {
          activeRoleLiteral,
          requiredRoleLiteral,
          isAuthorizedBoolean
        }
      });

      return isAuthorizedBoolean;
    }
  );
};
