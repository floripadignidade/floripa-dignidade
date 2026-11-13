/**
 * @section CMS Infrastructure - Media Vault Forensic Hooks (Atom)
 * @description Encapsula la observabilidad y trazabilidad forense de mutaciones sobre
 * activos multimedia y evidencias registradas en Payload CMS. Emite señales telemétricas
 * inmutables conformes a `TelemetrySignalSchema` ante creación, actualización y eliminación,
 * preservando la confidencialidad del operador sin exponer correos PII en los registros.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) y LGPD.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import type { CollectionConfig } from 'payload';

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

const COLLECTION_MODULE_IDENTIFIER = 'MEDIA_VAULT_INFRASTRUCTURE_COLLECTION' as ModuleIdentifier;

const resolveOperatorIdentifierLiteral = (rawUserSnapshot: unknown): string => {
  if (
    typeof rawUserSnapshot === 'object' &&
    rawUserSnapshot !== null &&
    'id' in rawUserSnapshot &&
    rawUserSnapshot.id !== undefined &&
    rawUserSnapshot.id !== null
  ) {
    return String(rawUserSnapshot.id);
  }

  return 'SYSTEM_BOOTSTRAP';
};

const emitMediaAssetLifecycleSignalAction = (
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
    contextMetadataSnapshot,
  });
};

/**
 * @name MEDIA_VAULT_FORENSIC_HOOKS
 * @description Hooks inmutables de ciclo de vida para auditar creación, actualización y
 * eliminación de activos en la colección `media-vault`.
 */
export const MEDIA_VAULT_FORENSIC_HOOKS: NonNullable<CollectionConfig['hooks']> = Object.freeze({
  afterChange: [
    ({ doc, operation, req }) => {
      const fileNameLiteral = String(doc['filename'] ?? 'UNKNOWN_ASSET');
      const mimeTypeLiteral = String(doc['mimeType'] ?? 'UNKNOWN_MIME');
      const operationCodeLiteral =
        operation === 'create'
          ? ('CLOUD_ASSET_INDEXED' as OperationCode)
          : ('CLOUD_ASSET_UPDATED' as OperationCode);

      emitMediaAssetLifecycleSignalAction(
        'INFO',
        operationCodeLiteral,
        `Ativo multimídia processado (${operation}): ${fileNameLiteral}`,
        'CMS_MEDIA_ASSET_MUTATION',
        {
          fileNameLiteral,
          mimeTypeLiteral,
          fileSizeInBytesQuantity: typeof doc['filesize'] === 'number' ? doc['filesize'] : 0,
          hasOrganizationOwnerBoolean: Boolean(doc['organizationOwnerIdentifier']),
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
  afterDelete: [
    ({ doc, id, req }) => {
      const fileNameLiteral = String(doc['filename'] ?? 'UNKNOWN_ASSET');

      emitMediaAssetLifecycleSignalAction(
        'WARNING',
        'CLOUD_ASSET_DELETED' as OperationCode,
        `Ativo multimídia removido do acervo: ${fileNameLiteral}`,
        'CMS_MEDIA_ASSET_DELETED',
        {
          deletedDocumentIdentifier: id,
          fileNameLiteral,
          mimeTypeLiteral: String(doc['mimeType'] ?? 'UNKNOWN_MIME'),
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
});
