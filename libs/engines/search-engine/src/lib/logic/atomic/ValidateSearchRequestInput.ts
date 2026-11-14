/**
 * @section Search Engine Logic - Search Request Input Validator (Atom)
 * @description Átomo encargado exclusivamente de validar y purificar los parámetros
 * de entrada de una consulta de búsqueda difusa contra `ExecuteFuzzySearchParametersSchema`,
 * emitiendo telemetría forense SRE y lanzando `ValidationException` ante datos malformados.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidationException } from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import type { ISearchableEntity, SearchAuthorityRole } from '../../schemas/SearchEngine.schema';
import {
  ExecuteFuzzySearchParametersSchema,
  type IExecuteFuzzySearchParameters,
} from './schemas/ExecuteFuzzySearch.schema';

const VALIDATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'SEARCH_REQUEST_INPUT_VALIDATOR',
);

const INPUT_VALIDATION_ERROR_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'SEARCH_REQUEST_INPUT_INVALID',
);

/**
 * Valida perimetralmente la consulta de búsqueda, la colección del índice y el rol institucional.
 *
 * @param searchQueryLiteral - Cadena de texto de búsqueda ingresada por el ciudadano.
 * @param completeIndexCollection - Colección de entidades del índice a auditar.
 * @param authenticatedUserAuthorityRole - Rango de autoridad del solicitante.
 * @param correlationIdentifier - Identificador UUID v4 de correlación forense.
 * @returns {IExecuteFuzzySearchParameters} Parámetros de búsqueda certificados y purificados por Zod.
 * @throws {ValidationException} Si los parámetros incumplen el contrato estructural.
 */
export const ValidateSearchRequestInput = (
  searchQueryLiteral: string,
  completeIndexCollection: readonly ISearchableEntity[],
  authenticatedUserAuthorityRole: SearchAuthorityRole,
  correlationIdentifier: CorrelationIdentifier,
): IExecuteFuzzySearchParameters => {
  const validationResultSnapshot = ExecuteFuzzySearchParametersSchema.safeParse({
    searchQueryLiteral,
    completeIndexCollection,
    authenticatedUserAuthorityRole,
    correlationIdentifier,
  });

  if (!validationResultSnapshot.success) {
    const validationIssuesCollection = validationResultSnapshot.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: VALIDATOR_MODULE_IDENTIFIER,
      operationCodeLiteral: INPUT_VALIDATION_ERROR_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Parámetros de búsqueda rechazados en frontera por violación de contrato estructural.',
      semanticIntentTag: 'SEARCH_REQUEST_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException(
      'CONTRATO_DE_SOLICITUD_DE_BUSQUEDA_CORRUPTO',
      {
        structuralIssuesCollection: validationIssuesCollection,
        correlationIdentifier,
      },
    );

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  return validationResultSnapshot.data;
};
