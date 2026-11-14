/**
 * @section CMS Governance - Organizations Forensic Hooks (Atom)
 * @description Encapsula la observabilidad y trazabilidad forense de mutaciones sobre
 * organizaciones institucionales en Payload CMS. Emite señales telemétricas inmutables
 * conformes a `TelemetrySignalSchema` ante creación, actualización y eliminación,
 * preservando la privacidad LGPD mediante identificadores opacos de operador.
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
const COLLECTION_MODULE_IDENTIFIER = 'ORGANIZATIONS_GOVERNANCE_COLLECTION' as ModuleIdentifier;

/**
 * Extrae de forma segura un identificador opaco del usuario operador sin exponer PII (correo electrónico).
 *
 * @param rawUserSnapshot - Referencia al usuario autenticado en la petición de Payload CMS.
 * @returns {string} Identificador único del operador o `'SYSTEM_BOOTSTRAP'` en operaciones de sistema.
 */
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

/**
 * Normaliza un literal textual opcional proveniente de documentos dinámicos de Payload CMS.
 *
 * @param rawFieldCandidate - Valor crudo extraído del documento persistido.
 * @returns {string} Cadena purificada o `'UNKNOWN'` si está ausente.
 */
const resolveSafeTextFieldLiteral = (rawFieldCandidate: unknown): string => {
  if (typeof rawFieldCandidate === 'string' && rawFieldCandidate.trim().length > 0) {
    return rawFieldCandidate.trim();
  }

  return 'UNKNOWN';
};

/**
 * Emite una señal telemétrica estandarizada sobre el ciclo de vida de una organización.
 *
 * @param severityLevelLiteral - Nivel de severidad operativa de la señal.
 * @param operationCodeLiteral - Código semántico normalizado de la operación ejecutada.
 * @param messageContentLiteral - Descripción legible del evento registrado.
 * @param semanticIntentTag - Etiqueta ontológica para clasificación automática.
 * @param contextMetadataSnapshot - Metadatos inmutables de auditoría del registro y operador.
 */
const emitOrganizationLifecycleSignalAction = (
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
 * @name ORGANIZATIONS_FORENSIC_HOOKS
 * @description Hooks inmutables de ciclo de vida para auditar cambios de gobernanza multi-tenant.
 */
export const ORGANIZATIONS_FORENSIC_HOOKS: NonNullable<CollectionConfig['hooks']> = Object.freeze({
  afterChange: [
    (hookContextSnapshot) => {
      const { doc, operation, req } = hookContextSnapshot;
      const organizationNameLiteral = resolveSafeTextFieldLiteral(doc['institutionalNameLiteral']);
      const operationalStatusLiteral = resolveSafeTextFieldLiteral(doc['operationalStatusLiteral']);
      const institutionalSlugLiteral = resolveSafeTextFieldLiteral(doc['institutionalSlugLiteral']);
      const organizationDocumentIdentifier =
        doc['id'] !== undefined && doc['id'] !== null ? String(doc['id']) : 'UNKNOWN';

      emitOrganizationLifecycleSignalAction(
        'INFO',
        `ORGANIZATION_${operation.toUpperCase()}` as OperationCode,
        `Evento institucional processado (${operation}): ${organizationNameLiteral} [${operationalStatusLiteral}]`,
        'CMS_ORGANIZATION_MUTATION',
        {
          organizationDocumentIdentifier,
          institutionalSlugLiteral,
          operationalStatusLiteral,
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
  afterDelete: [
    (hookContextSnapshot) => {
      const { doc, id, req } = hookContextSnapshot;
      const organizationNameLiteral = resolveSafeTextFieldLiteral(doc['institutionalNameLiteral']);
      const institutionalSlugLiteral = resolveSafeTextFieldLiteral(doc['institutionalSlugLiteral']);

      emitOrganizationLifecycleSignalAction(
        'WARNING',
        'ORGANIZATION_DELETED' as OperationCode,
        `Organização removida do ecossistema: ${organizationNameLiteral}`,
        'CMS_ORGANIZATION_DELETED',
        {
          deletedDocumentIdentifier: String(id),
          institutionalSlugLiteral,
          operatorUserIdentifierLiteral: resolveOperatorIdentifierLiteral(req.user),
        },
      );
    },
  ],
});
