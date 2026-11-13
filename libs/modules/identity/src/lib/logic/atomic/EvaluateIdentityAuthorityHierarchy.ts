// libs/modules/identity/src/lib/logic/atomic/EvaluateIdentityAuthorityHierarchy.ts

/**
 * @section User Management & Identity - Identity Logic Atoms
 * @description Átomo de lógica pura encargado de determinar si un rol institucional
 * posee autoridad técnica suficiente comparando el peso institucional del papel activo
 * contra el nivel exigido por la operación solicitada. Implementa la matriz de
 * privilegios, la ponderación numérica determinista y el protocolo de bypass
 * administrativo (SRE).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 * SANEADO Zenith: Erradicación del rol metafórico INFRASTRUCTURE_SOVEREIGN_AUDITOR
 * y alineación con la clave canónica INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR (Fix TS2353/TS2339).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { ValidationException } from '@floripa-dignidade/exceptions';

/* 1. Contratos Centralizados de Dominio (Single Source of Truth) */
import {
  EvaluateIdentityAuthoritySchema,
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type IEvaluateIdentityAuthorityParameters,
  type UserAccessRole,
} from '@floripa-dignidade/contracts';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ATOM_IDENTIFIER = 'IDENTITY_HIERARCHY_EVALUATOR_ATOM' as ModuleIdentifier;

/**
 * @name ROLE_AUTHORITY_WEIGHTS_MAPPING
 * @description Mapa de influencia numérica institucional para comparación jerárquica de roles.
 * Define la escala de poder administrativo en el ecosistema (0 a 100).
 * Sincronizado estrictamente con la unión UserAccessRole.
 */
const ROLE_AUTHORITY_WEIGHTS_MAPPING: Record<UserAccessRole, number> = {
  INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR: 100,
  PLATFORM_GLOBAL_MANAGER: 90,
  ORGANIZATION_ADMINISTRATOR: 80,
  ORGANIZATION_OPERATOR: 70,
  IDENTITY_REGISTERED: 20,
  IDENTITY_ANONYMOUS: 0,
};

/**
 * Evalúa si el rol activo posee autoridad igual o superior al nivel exigido.
 * Implementa medición de latencia en la evaluación y emite trazabilidad al bus de telemetría.
 *
 * @param parametersSnapshot - Snapshot inmutable conteniendo el rol activo del usuario y el rol mínimo requerido.
 * @returns {Promise<boolean>} Promesa que resuelve en verdadero si el acceso es legítimo por peso jerárquico o bypass administrativo.
 * @throws {ValidationException} Si el snapshot de parámetros no cumple con el esquema estructural Zod.
 */
export const EvaluateIdentityAuthorityHierarchy = async (
  parametersSnapshot: IEvaluateIdentityAuthorityParameters,
): Promise<boolean> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  return await TraceExecutionTime(
    ATOM_IDENTIFIER,
    'EXECUTE_AUTHORITY_HIERARCHY_EVALUATION' as OperationCode,
    correlationIdentifier,
    async (): Promise<boolean> => {
      // 1. ADUANA DE INTEGRIDAD ESTRUCTURAL
      const validationResult = EvaluateIdentityAuthoritySchema.safeParse(parametersSnapshot);

      if (!validationResult.success) {
        throw new ValidationException('AUTHORITY_HIERARCHY_CONTRACT_VIOLATION', {
          validationIssuesCollection: validationResult.error.flatten(),
          correlationIdentifier,
        });
      }

      const { activeRoleLiteral, requiredRoleLiteral } = validationResult.data;

      /**
       * 2. PROTOCOLO DE BYPASS ADMINISTRATIVO (SRE Emergency Guard)
       * Los roles de nivel auditor de infraestructura y gestor global poseen autoridad
       * total intrínseca para evitar bloqueos operativos en contingencias críticas.
       */
      const hasAdministrativeBypassBoolean =
        activeRoleLiteral ===
          IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR ||
        activeRoleLiteral === IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER;

      if (hasAdministrativeBypassBoolean) {
        return true;
      }

      // 3. EVALUACIÓN DE PESO JERÁRQUICO DETERMINISTA
      const activeAuthorityWeightNumeric = ROLE_AUTHORITY_WEIGHTS_MAPPING[activeRoleLiteral] ?? 0;
      const requiredAuthorityWeightNumeric =
        ROLE_AUTHORITY_WEIGHTS_MAPPING[requiredRoleLiteral] ?? 0;

      const isAuthorizedBoolean = activeAuthorityWeightNumeric >= requiredAuthorityWeightNumeric;

      // 4. REPORTE DE TELEMETRÍA FORENSE (Visibilidad Operativa)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isAuthorizedBoolean ? 'INFO' : 'WARNING',
        moduleIdentifierLiteral: ATOM_IDENTIFIER,
        operationCodeLiteral: 'AUTHORITY_EVALUATION_COMPLETED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Evaluación de acceso institucional finalizada. Resultado: [${isAuthorizedBoolean}].`,
        semanticIntentTag: 'AUTHORIZATION_GATE_DECISION',
        contextMetadataSnapshot: {
          activeRoleLiteral,
          requiredRoleLiteral,
          isAuthorizedBoolean,
          activeAuthorityWeightNumeric,
          requiredAuthorityWeightNumeric,
        },
      });

      return isAuthorizedBoolean;
    },
  );
};
