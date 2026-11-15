/**
 * @file apps/content-manager-system/src/collections/identity/citizen-users/CitizenUsersForensicHooks.ts
 * @section CMS Identity - Citizen Users Forensic & Bootstrap Hooks (Atom)
 * @description Garantiza la elevación segura del primer administrador durante el bootstrap
 * inicial (`totalDocs === 0`) y emite señales telemétricas conformes a `TelemetrySignalSchema`
 * usando exclusivamente identificadores opacos sin exponer PII bajo la LGPD.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & ADR 0031).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 y LGPD (Lei 13.709/2018).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

import { IDENTITY_ACCESS_ROLES_COLLECTION } from '@floripa-dignidade/contracts';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

const COLLECTION_MODULE_IDENTIFIER = 'CITIZEN_USERS_COLLECTION' as ModuleIdentifier;

const resolveOpaqueIdentifierLiteral = (
  rawIdentifierCandidate: unknown,
  fallbackLiteral: string,
): string => {
  if (rawIdentifierCandidate !== undefined && rawIdentifierCandidate !== null) {
    return String(rawIdentifierCandidate);
  }

  return fallbackLiteral;
};

const resolveOperatorIdentifierLiteral = (rawUserSnapshot: unknown): string => {
  if (typeof rawUserSnapshot === 'object' && rawUserSnapshot !== null && 'id' in rawUserSnapshot) {
    return resolveOpaqueIdentifierLiteral(rawUserSnapshot.id, 'SYSTEM_BOOTSTRAP');
  }

  return 'SYSTEM_BOOTSTRAP';
};

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
 * @description Hooks inmutables para bootstrap del primer administrador y auditoría sin PII.
 */
export const CITIZEN_USERS_FORENSIC_HOOKS: NonNullable<CollectionConfig['hooks']> = Object.freeze({
  beforeChange: [
    async ({ data, operation, req }) => {
      if (operation !== 'create' || req.user) {
        return data;
      }

      const { totalDocs } = await req.payload.count({
        collection: 'citizen-users',
        req,
        overrideAccess: true,
      });

      if (totalDocs !== 0) {
        return data;
      }

      return {
        ...data,
        assignedAuthorityRoleLiteral:
          IDENTITY_ACCESS_ROLES_COLLECTION.INFRASTRUCTURE_ADMINISTRATIVE_AUDITOR,
        isIdentityLegallyVerifiedBoolean: true,
      };
    },
  ],

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
