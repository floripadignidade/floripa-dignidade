/**
 * @section Observatory Logic - Access Validation Atom
 * @description Átomo encargado de verificar la autoridad institucional para el
 * acceso a datos presupuestarios y fiscales del Observatorio de Gastos Públicos.
 * Realiza la auditoría de roles (RBAC) y emite señales de trazabilidad forense.
 *
 * Protocolo OEDP-V18.1 - High Performance SRE & Functional Atomicity.
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { redirect } from 'next/navigation';

/* 1. Contratos Centralizados de Identidad y Autoridad (SSOT Global) */
import {
  IDENTITY_ACCESS_ROLES_COLLECTION,
  type TIdentityAccessRole,
} from '@floripa-dignidade/contracts';

/* 2. Infraestructura Core de Telemetría y Trazabilidad */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ACCESS_VALIDATOR_IDENTIFIER = 'OBSERVATORY_ACCESS_VALIDATOR_ATOM' as ModuleIdentifier;

/**
 * Valida si el ciudadano posee la autoridad requerida para consultar partidas fiscales.
 * Implementa medición de latencia en la evaluación y delega la redirección de forma limpia.
 *
 * @param targetLocaleIdentifier - Identificador de idioma para la composición de la ruta.
 * @returns {Promise<void>} Promesa que resuelve nominalmente si el acceso es legítimo.
 */
export const ValidateObservatoryAccess = async (targetLocaleIdentifier: string): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();

  /**
   * @section Evaluación de Autoridad con Medición SRE
   * Se evalúa el estado de acceso dentro del trazador para no contaminar
   * la telemetría con la excepción interna de control de flujo de Next.js (NEXT_REDIRECT).
   */
  const isAccessAuthorizedBoolean = await TraceExecutionTime(
    ACCESS_VALIDATOR_IDENTIFIER,
    'EXECUTE_RBAC_AUDIT_TRANSACTION' as OperationCode,
    correlationIdentifier,
    async (): Promise<boolean> => {
      /**
       * @section Inferencia de Contexto de Identidad
       * En la fase actual se audita el rol institucional autorizado por defecto.
       * TODO: En Fase 8, vincular con la sesión recuperada por el interceptor de borda (Middleware).
       */
      const activeAuthorityRoleLiteral: TIdentityAccessRole =
        IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR;

      const authorizedRolesCollection: readonly TIdentityAccessRole[] = [
        IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
        IDENTITY_ACCESS_ROLES_COLLECTION.PLATFORM_GLOBAL_MANAGER,
        IDENTITY_ACCESS_ROLES_COLLECTION.ORGANIZATION_ADMINISTRATOR,
      ];

      const hasSufficientAuthorityBoolean = authorizedRolesCollection.includes(
        activeAuthorityRoleLiteral,
      );

      if (hasSufficientAuthorityBoolean) {
        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ACCESS_VALIDATOR_IDENTIFIER,
          operationCodeLiteral: 'OBSERVATORY_ACCESS_GRANTED' as OperationCode,
          correlationIdentifier,
          messageContentLiteral: 'Autorización confirmada para auditoría de gastos públicos.',
          semanticIntentTag: 'RBAC_ACCESS_CONFIRMED',
          contextMetadataSnapshot: {
            assignedAuthorityRoleLiteral: activeAuthorityRoleLiteral,
          },
        });

        return true;
      }

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'WARNING',
        moduleIdentifierLiteral: ACCESS_VALIDATOR_IDENTIFIER,
        operationCodeLiteral: 'OBSERVATORY_ACCESS_DENIED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Bloqueo de seguridad: Identidad insuficiente en [${targetLocaleIdentifier}].`,
        semanticIntentTag: 'RBAC_ACCESS_VIOLATION',
        contextMetadataSnapshot: {
          attemptedRoleLiteral: activeAuthorityRoleLiteral,
          targetLocaleIdentifier,
        },
      });

      return false;
    },
  );

  /**
   * @section Ejecución de Redirección Perimetral
   * Se ejecuta fuera de TraceExecutionTime para evitar atrapar la señal NEXT_REDIRECT.
   */
  if (!isAccessAuthorizedBoolean) {
    redirect(`/${targetLocaleIdentifier}/unauthorized`);
  }
};
