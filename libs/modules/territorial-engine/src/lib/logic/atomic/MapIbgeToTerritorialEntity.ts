/**
 * @section Territorial Logic - IBGE District Mapper (Atom)
 * @description Transforma un registro crudo de distrito del IBGE en una entidad
 * territorial certificada e inmutable (`ITerritorialEntity`), validando el contrato
 * externo con Zod, normalizando su toponimia, propagando correlación hacia el ensamblador
 * y reportando latencia y eventos SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  GlobalBaseException,
  InternalSystemException,
  ValidationException,
} from '@floripa-dignidade/exceptions';
import {
  type CorrelationIdentifier,
  CorrelationIdentifierSchema,
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
  ReportForensicException,
} from '@floripa-dignidade/telemetry';

import {
  IbgeDistrictRawResponseSchema,
  type IIbgeDistrictRawResponse,
} from '../../schemas/IbgeTerritorialProtocols.schema';
import type { ITerritorialEntity } from '../../schemas/TerritorialEntity.schema';
import { AssembleTerritorialEntity } from './AssembleTerritorialEntity';
import { SanitizeTerritoryName } from './SanitizeTerritoryName';

const MAPPER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'TERRITORIAL_IBGE_MAPPER_ORCHESTRATOR',
);

const PROTOCOL_VIOLATION_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('IBGE_PROTOCOL_VIOLATION');

const NORMALIZATION_NOMINAL_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'IBGE_NORMALIZATION_NOMINAL',
);

const MAPPER_COLLAPSE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'IBGE_MAPPER_INTERNAL_FAULT',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Mapea y certifica un registro de distrito obtenido de la API de Localidades del IBGE.
 *
 * @param rawDistrictSnapshotSource - Registro crudo sin validar recibido desde el proveedor externo.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para enlazar la traza.
 * @returns {ITerritorialEntity} Entidad territorial normalizada, validada e inmutable.
 * @throws {ValidationException} Si el registro del IBGE incumple `IbgeDistrictRawResponseSchema` o la entidad resultante es inválida.
 * @throws {InternalSystemException} Si ocurre un fallo inesperado durante la transformación.
 */
export const MapIbgeToTerritorialEntity = (
  rawDistrictSnapshotSource: unknown,
  correlationIdentifierFallback?: string,
): ITerritorialEntity => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const executionStartTimestampNumeric = globalThis.performance.now();

  try {
    const protocolValidationResult =
      IbgeDistrictRawResponseSchema.safeParse(rawDistrictSnapshotSource);

    if (!protocolValidationResult.success) {
      const validationIssuesCollection = protocolValidationResult.error.flatten();

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: 'CRITICAL',
        moduleIdentifierLiteral: MAPPER_MODULE_IDENTIFIER,
        operationCodeLiteral: PROTOCOL_VIOLATION_OPERATION_CODE,
        correlationIdentifier,
        messageContentLiteral: 'TERRITORIAL.ERRORS.ADN_CORRUPTION',
        semanticIntentTag: 'IBGE_CONTRACT_VIOLATION',
        contextMetadataSnapshot: Object.freeze({
          validationIssuesCollection,
          rawInputTypeLiteral: typeof rawDistrictSnapshotSource,
        }),
      });

      const validationException = new ValidationException('CONTRATO_IBGE_INVALIDO', {
        structuralIssuesCollection: validationIssuesCollection,
        correlationIdentifier,
      });

      ReportForensicException(validationException, correlationIdentifier);
      throw validationException;
    }

    const validatedRawDistrictSnapshot: IIbgeDistrictRawResponse = protocolValidationResult.data;
    const officialTerritoryNameLiteral = SanitizeTerritoryName(validatedRawDistrictSnapshot.nome);

    const territorialEntitySnapshot = AssembleTerritorialEntity(
      {
        technicalIdentifierLiteral: validatedRawDistrictSnapshot.id.toString(),
        parentTerritoryIdentifierLiteral: validatedRawDistrictSnapshot.municipio.id.toString(),
        officialTerritoryNameLiteral,
        administrativeHierarchyLevelLiteral: 'DISTRICT',
      },
      correlationIdentifier,
    );

    const executionLatencyInMillisecondsQuantity = Math.max(
      0,
      globalThis.performance.now() - executionStartTimestampNumeric,
    );

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'DEBUG',
      moduleIdentifierLiteral: MAPPER_MODULE_IDENTIFIER,
      operationCodeLiteral: NORMALIZATION_NOMINAL_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: 'TERRITORIAL.LOGS.DATA_NORMALIZED',
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'TERRITORIAL_DATA_INGESTION',
      contextMetadataSnapshot: Object.freeze({
        territoryIdentifier: territorialEntitySnapshot.territorialTechnicalIdentifier,
        officialNameLiteral: officialTerritoryNameLiteral,
      }),
    });

    return territorialEntitySnapshot;
  } catch (caughtExecutionError: unknown) {
    if (caughtExecutionError instanceof GlobalBaseException) {
      throw caughtExecutionError;
    }

    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    const internalException = new InternalSystemException('FALLO_EN_MAPEO_TERRITORIAL', {
      originalErrorLiteral: errorDescriptionLiteral,
      correlationIdentifier,
    });

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: MAPPER_MODULE_IDENTIFIER,
      operationCodeLiteral: MAPPER_COLLAPSE_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Fallo inesperado al normalizar un registro territorial procedente del IBGE.',
      semanticIntentTag: 'TERRITORIAL_MAPPING_FAULT',
      contextMetadataSnapshot: Object.freeze({
        ...internalException.runtimeContextSnapshot,
      }),
    });

    ReportForensicException(internalException, correlationIdentifier);
    throw internalException;
  }
};
