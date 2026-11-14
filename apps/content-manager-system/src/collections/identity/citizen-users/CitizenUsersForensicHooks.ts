/**
 * @section CMS Identity - Citizen Users Forensic Hooks (Atom)
 * @description Encapsula la observabilidad y trazabilidad forense sobre identidades
 * ciudadanas y operadores en Payload CMS. Emite señales telemétricas inmutables
 * conformes a `TelemetrySignalSchema` utilizando exclusivamente identificadores opacos,
 * erradicando cualquier filtración de PII (correos electrónicos o nombres civiles) bajo la LGPD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

/* 1. Infraestructura Core de Telemetría y Trazabilidad */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/** Identificador técnico del módulo para el monitor de salud y telemetría forense. */
const COLLECTION_MODULE_IDENTIFIER = 'CITIZEN_USERS_COLLECTION' as ModuleIdentifier;

/**
 * Extrae de forma segura un identificador opaco de cualquier referencia de usuario o documento.
 *
 * @param rawIdentifierCandidate - Identificador crudo del documento o usuario autenticado.
 * @param fallbackLiteral - Literal de respaldo cuando no existe referencia autenticada.
 * @returns {string} Identificador opaco serializado sin exponer PII.
 */
const resolveOpaqueIdentifierLiteral = (
  rawIdentifierCandidate: unknown,
  fallbackLiteral: string,
): string => {
  if (rawIdentifierCandidate !== undefined && rawIdentifierCandidate !== null) {
    return String(rawIdentifierCandidate);
  }

  return fallbackLiteral;
};

/**
 * Extrae el identificador opaco del usuario operador autenticado en Payload CMS.
 *
 * @param rawUserSnapshot - Referencia al usuario en `req.user`.
 * @returns {string} Identificador opaco del operador o `'SYSTEM_BOOTSTRAP'`.
 */
const resolveOperatorIdentifierLiteral = (rawUserSnapshot: unknown): string => {
  if (typeof rawUserSnapshot === 'object' && rawUserSnapshot !== null && 'id' in rawUserSnapshot) {
    return resolveOpaqueIdentifierLiteral(rawUserSnapshot.id, 'SYSTEM_BOOTSTRAP');
  }

  return 'SYSTEM_BOOTSTRAP';
};

/**
 * Emite una señal telemétrica estandarizada sobre el ciclo de vida de una identidad en el CMS.
 *
 * @param severityLevelLiteral - Nivel de severidad operativa de la señal.
 * @param operationCodeLiteral - Código semántico normalizado de la operación ejecutada.
 * @param messageContentLiteral - Descripción técnica libre de PII del evento registrado.
 * @param semanticIntentTag - Etiqueta ontológica para clasificación automática.
 * @param contextMetadataSnapshot - Metadatos inmutables anonimizados de auditoría.
 */
const emitCitizenIdentityLifecycleSignalAction = (
  severityLevelLiteral: 'INFO' | 'WARNING',
  operationCodeLiteral: OperationCode,
  messageContentLiteral: string,
  semanticIntentTag: string,
  contextMetadataSnapshot: Readonly<Record<string, unknown>>,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral,
    moduleIdentifierLiteral: COLLECTION_MODULE_IDENTIFIER,
    operationCodeLiteral,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral,
    semanticIntentTag,
    contextMetadataSnapshot: Object.freeze({ ...contextMetadataSnapshot }),
  });
};

/**
 * @name CITIZEN_USERS_FORENSIC_HOOKS
 * @description Hooks inmutables de ciclo de vida para auditar mutaciones de identidad sin exponer PII.
 */
export const CITIZEN_USERS_FORENSIC_HOOKS: NonNullable<CollectionConfig['hooks']> = Object.freeze({
  afterChange: [
    (hookContextSnapshot) => {
      const { doc, operation, req } = hookContextSnapshot;
      const targetUserIdentifierLiteral = resolveOpaqueIdentifierLiteral(doc['id'], 'UNKNOWN');
      const assignedRoleLiteral =
        typeof doc['assignedAuthorityRoleLiteral'] === 'string'
          ? doc['assignedAuthorityRoleLiteral']
          : 'UNKNOWN';

      emitCitizenIdentityLifecycleSignalAction(
        'INFO',
        `IDENTITY_${operation.toUpperCase()}` as OperationCode,
        `Evento de identidade processado no CMS (${operation}) para registro [${targetUserIdentifierLiteral}].`,
        'CMS_IDENTITY_MUTATION',
        {
          targetUserIdentifierLiteral,
          assignedRoleLiteral,
          isIdentityLegallyVerifiedBoolean: Boolean(doc['isIdentityLegallyVerifiedBoolean']),
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
  afterDelete: [
    (hookContextSnapshot) => {
      const { doc, id, req } = hookContextSnapshot;
      const assignedRoleLiteral =
        typeof doc['assignedAuthorityRoleLiteral'] === 'string'
          ? doc['assignedAuthorityRoleLiteral']
          : 'UNKNOWN';

      emitCitizenIdentityLifecycleSignalAction(
        'WARNING',
        'IDENTITY_DELETED' as OperationCode,
        `Registro de identidade removido do CMS [${String(id)}].`,
        'CMS_IDENTITY_DELETED',
        {
          deletedUserIdentifierLiteral: String(id),
          assignedRoleLiteral,
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
});
