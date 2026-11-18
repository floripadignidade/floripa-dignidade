/**
 * @file libs/modules/messaging-engine/src/lib/logic/queries/atoms/BuildInboxQueryFilters.ts
 * @section Messaging Logic - Inbox Query Builder (Atom)
 * @description Átomo de lógica pura encargado de validar el identificador ciudadano
 * mediante Zod y construir cadenas de filtrado PostgREST seguras y alineadas con el
 * esquema físico (`dispatched_at`) para notificaciones y mensajería directa.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  ModuleIdentifierSchema,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

const FILTER_BUILDER_MODULE_IDENTIFIER = ModuleIdentifierSchema.parse(
  'MESSAGING_INBOX_FILTER_BUILDER',
);

const FILTER_VALIDATION_WARNING_CODE = OperationCodeSchema.parse(
  'INBOX_FILTER_CITIZEN_IDENTIFIER_INVALID',
);

const CitizenIdentifierUuidSchema = z
  .string()
  .trim()
  .uuid({ message: 'CITIZEN_IDENTIFIER_MUST_BE_UUID_V4' });

/**
 * @interface IInboxFiltersResult
 * @description Contrato inmutable con los filtros PostgREST validados para el buzón unificado.
 */
export interface IInboxFiltersResult {
  readonly notificationsQueryLiteral: string;
  readonly messagesQueryLiteral: string;
}

/**
 * Construye los filtros PostgREST validados para la recuperación del buzón ciudadano.
 *
 * @param citizenIdentifier - UUID v4 del ciudadano bajo consulta.
 * @returns {IInboxFiltersResult} Diccionario inmutable de filtros de consulta.
 * @throws {ValidationException} Si `citizenIdentifier` no cumple el formato UUID v4.
 */
export const BuildInboxQueryFilters = (citizenIdentifier: string): IInboxFiltersResult => {
  const validationResult = CitizenIdentifierUuidSchema.safeParse(citizenIdentifier);

  if (!validationResult.success) {
    const correlationIdentifier = GenerateCorrelationIdentifier();
    const validationIssuesCollection = validationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: FILTER_BUILDER_MODULE_IDENTIFIER,
      operationCodeLiteral: FILTER_VALIDATION_WARNING_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Construcción de filtro PostgREST bloqueada por identificador ciudadano inválido.',
      semanticIntentTag: 'SECURITY_POSTGREST_FILTER_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('IDENTIFICADOR_CIUDADANO_BUZON_INVALIDO', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedCitizenIdentifier = validationResult.data;

  const notificationsQueryLiteral =
    `recipient_id=eq.${validatedCitizenIdentifier}` +
    '&interaction_status=neq.TRASHED_DELETED&order=dispatched_at.desc';

  const messagesQueryLiteral =
    `or=(sender_id.eq.${validatedCitizenIdentifier},recipient_id.eq.${validatedCitizenIdentifier})` +
    '&current_status=neq.TRASHED_DELETED&order=dispatched_at.desc';

  return Object.freeze({
    notificationsQueryLiteral,
    messagesQueryLiteral,
  });
};
