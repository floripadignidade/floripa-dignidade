/**
 * @section Territorial Logic - Territorial Entity Assembler (Atom)
 * @description Átomo de lógica pura encargado de validar parámetros, construir y
 * sellar inmutablemente una entidad territorial (`ITerritorialEntity`) conforme al
 * contrato `TerritorialEntitySchema`, con trazabilidad forense SRE y excepciones
 * estandarizadas bajo arquitectura Source-First.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Mantenibilidad y Confiabilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

import { ValidationException } from '@floripa-dignidade/exceptions';
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
  AdministrativeHierarchySchema,
  type ITerritorialEntity,
  type TAdministrativeHierarchy,
  TerritorialEntitySchema,
  TerritorialTechnicalIdentifierSchema,
} from '../../schemas/TerritorialEntity.schema';

const ASSEMBLER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'TERRITORIAL_ENTITY_ASSEMBLER_ATOM',
);

const CONTRACT_VIOLATION_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ASSEMBLER_CONTRACT_VIOLATION',
);

const ASSEMBLY_NOMINAL_OPERATION_CODE: OperationCode =
  OperationCodeSchema.parse('ENTITY_ASSEMBLY_NOMINAL');

const AssembleTerritorialEntityParametersSchema = z
  .object({
    technicalIdentifierLiteral: TerritorialTechnicalIdentifierSchema,
    parentTerritoryIdentifierLiteral: TerritorialTechnicalIdentifierSchema.nullable(),
    officialTerritoryNameLiteral: z
      .string()
      .trim()
      .min(2, { message: 'INVALID_OFFICIAL_TERRITORY_NAME_LENGTH' }),
    administrativeHierarchyLevelLiteral: AdministrativeHierarchySchema,
  })
  .readonly();

/**
 * @interface ITerritorialAssemblerParameters
 * @description Contrato inmutable de entrada para la construcción de una entidad territorial.
 */
export interface ITerritorialAssemblerParameters {
  readonly technicalIdentifierLiteral: string;
  readonly parentTerritoryIdentifierLiteral: string | null;
  readonly officialTerritoryNameLiteral: string;
  readonly administrativeHierarchyLevelLiteral: TAdministrativeHierarchy;
}

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Valida parámetros territoriales, ensambla la entidad certificada y sella su inmutabilidad.
 *
 * @param parametersSnapshot - Datos normalizados de identificador, jerarquía y toponimia.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para enlazar trazabilidad.
 * @returns {ITerritorialEntity} Entidad territorial certificada e inmutable (`Object.freeze`).
 * @throws {ValidationException} Si los parámetros incumplen los contratos Zod de territorio.
 */
export const AssembleTerritorialEntity = (
  parametersSnapshot: ITerritorialAssemblerParameters,
  correlationIdentifierFallback?: string,
): ITerritorialEntity => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const validationResult = AssembleTerritorialEntityParametersSchema.safeParse(parametersSnapshot);

  if (!validationResult.success) {
    const validationIssuesCollection = validationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: ASSEMBLER_MODULE_IDENTIFIER,
      operationCodeLiteral: CONTRACT_VIOLATION_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Se intentó ensamblar una entidad territorial con contrato estructural inválido.',
      semanticIntentTag: 'TERRITORIAL_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('TERRITORIAL_ENTITY_ASSEMBLY_INVALID', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const {
    technicalIdentifierLiteral,
    parentTerritoryIdentifierLiteral,
    officialTerritoryNameLiteral,
    administrativeHierarchyLevelLiteral,
  } = validationResult.data;

  const occurrenceTimestampISO = new Date().toISOString();

  const certifiedTerritorialEntity = TerritorialEntitySchema.parse({
    territorialTechnicalIdentifier: technicalIdentifierLiteral,
    parentTerritoryIdentifier: parentTerritoryIdentifierLiteral,
    officialTerritoryNameLiteral,
    administrativeHierarchyLevel: administrativeHierarchyLevelLiteral,
    lastSovereignSyncTimestampISO: occurrenceTimestampISO,
  });

  void EmitTelemetrySignal({
    occurrenceTimestampISO,
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: ASSEMBLER_MODULE_IDENTIFIER,
    operationCodeLiteral: ASSEMBLY_NOMINAL_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral: 'Ensamblaje inmutable de entidad territorial finalizado con éxito.',
    semanticIntentTag: 'TERRITORIAL_DATA_NORMALIZATION',
    contextMetadataSnapshot: Object.freeze({
      technicalIdentifierLiteral,
      hierarchyLiteral: administrativeHierarchyLevelLiteral,
    }),
  });

  return Object.freeze(certifiedTerritorialEntity);
};
