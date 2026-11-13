/**
 * @section CMS Governance - Organizations Forensic Hooks (Atom)
 * @description Encapsula la observabilidad y trazabilidad forense de mutaciones sobre
 * organizaciones institucionales en Payload CMS. Emite señales telemétricas inmutables
 * conforme a TelemetrySignalSchema ante creación, actualización y eliminación.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Trazabilidad).
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
    contextMetadataSnapshot,
  });
};

/**
 * @name ORGANIZATIONS_FORENSIC_HOOKS
 * @description Hooks de ciclo de vida para auditar cambios de gobernanza multi-tenant.
 */
export const ORGANIZATIONS_FORENSIC_HOOKS: NonNullable<CollectionConfig['hooks']> = Object.freeze({
  afterChange: [
    ({ doc, operation, req }) => {
      const organizationNameLiteral = String(doc['institutionalNameLiteral'] ?? 'UNKNOWN');
      const operationalStatusLiteral = String(doc['operationalStatusLiteral'] ?? 'UNKNOWN');

      emitOrganizationLifecycleSignalAction(
        'INFO',
        `ORGANIZATION_${operation.toUpperCase()}` as OperationCode,
        `Evento institucional processado: ${organizationNameLiteral} [${operationalStatusLiteral}]`,
        'CMS_ORGANIZATION_MUTATION',
        {
          institutionalSlugLiteral: doc['institutionalSlugLiteral'],
          operationalStatusLiteral,
          perpetratorIdentityLiteral: req.user?.email ?? 'SYSTEM_BOOTSTRAP',
        },
      );
    },
  ],
  afterDelete: [
    ({ doc, id, req }) => {
      const organizationNameLiteral = String(doc['institutionalNameLiteral'] ?? 'UNKNOWN');

      emitOrganizationLifecycleSignalAction(
        'WARNING',
        'ORGANIZATION_DELETED' as OperationCode,
        `Organização removida do ecossistema: ${organizationNameLiteral}`,
        'CMS_ORGANIZATION_DELETED',
        {
          deletedDocumentIdentifier: id,
          institutionalSlugLiteral: doc['institutionalSlugLiteral'],
          perpetratorIdentityLiteral: req.user?.email ?? 'SYSTEM_BOOTSTRAP',
        },
      );
    },
  ],
});
