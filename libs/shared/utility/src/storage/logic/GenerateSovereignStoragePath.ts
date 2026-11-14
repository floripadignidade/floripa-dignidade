/**
 * @section Storage Logic - Enterprise Storage Path Generator (Orchestrator Atom)
 * @description Orquesta la generación determinista de claves jerárquicas S3-Compatible
 * (`{organizacion}/{categoria}/{añoUTC}/{mesUTC}/{uuid}-{nombre-saneado}`), validando
 * parámetros con Zod, sanitizando segmentos contra Path Traversal y emitiendo trazabilidad
 * SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Seguridad y Mantenibilidad).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

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

import type { IMultimediaEvidencePayload } from '../schemas/MultimediaEvidence.schema';
import {
  EnterpriseStoragePathLiteralSchema,
  GenerateEnterpriseStoragePathParametersSchema,
  type TEnterpriseStoragePathLiteral,
} from '../schemas/EnterpriseStoragePath.schema';
import { SanitizeOrganizationPathSegment } from './SanitizeOrganizationPathSegment';
import { SanitizeStorageFileName } from './SanitizeStorageFileName';

export { EnterpriseStoragePathLiteralSchema, type TEnterpriseStoragePathLiteral };

const STORAGE_PATH_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'ENTERPRISE_STORAGE_PATH_GENERATOR',
);

const PATH_GENERATED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'ENTERPRISE_STORAGE_PATH_GENERATED',
);

const PATH_VALIDATION_ERROR_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'STORAGE_PATH_PARAMETERS_INVALID',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Genera de forma síncrona y determinista una clave S3 segura, particionada en UTC y sellada.
 *
 * @param evidencePayloadSnapshot - Snapshot inmutable con los metadatos institucionales y archivo.
 * @param uniqueIdentifierLiteral - Identificador UUID v4 único para prevenir colisiones en S3.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para enlazar trazabilidad SRE.
 * @returns {TEnterpriseStoragePathLiteral} Clave jerárquica S3 validada y sellada nominalmente.
 * @throws {ValidationException} Si los metadatos de entrada o el UUID v4 incumplen el contrato Zod.
 */
export const GenerateEnterpriseStoragePath = (
  evidencePayloadSnapshot: IMultimediaEvidencePayload,
  uniqueIdentifierLiteral: string,
  correlationIdentifierFallback?: string,
): TEnterpriseStoragePathLiteral => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);

  const parametersValidationResult = GenerateEnterpriseStoragePathParametersSchema.safeParse({
    institutionalContextMetadata: evidencePayloadSnapshot?.institutionalContextMetadata,
    uniqueIdentifierLiteral,
  });

  if (!parametersValidationResult.success) {
    const validationIssuesCollection = parametersValidationResult.error.flatten();
    const occurrenceTimestampISO = new Date().toISOString();

    void EmitTelemetrySignal({
      occurrenceTimestampISO,
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: STORAGE_PATH_MODULE_IDENTIFIER,
      operationCodeLiteral: PATH_VALIDATION_ERROR_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Generación de ruta de almacenamiento rechazada por contrato de parámetros inválido.',
      semanticIntentTag: 'STORAGE_PATH_VALIDATION_WARNING',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('INVALID_STORAGE_PATH_PARAMETERS', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const { institutionalContextMetadata, uniqueIdentifierLiteral: validatedUuidLiteral } =
    parametersValidationResult.data;

  const currentExecutionDateTime = new Date();
  const currentUtcYearLiteral = currentExecutionDateTime.getUTCFullYear().toString();
  const currentUtcMonthLiteral = (currentExecutionDateTime.getUTCMonth() + 1)
    .toString()
    .padStart(2, '0');

  const sanitizedOrganizationLiteral = SanitizeOrganizationPathSegment(
    institutionalContextMetadata.ownerOrganizationIdentifier,
  );
  const sanitizedFileNameLiteral = SanitizeStorageFileName(
    institutionalContextMetadata.originalFileNameLiteral,
  );

  const fileKeySegmentLiteral = `${validatedUuidLiteral}-${sanitizedFileNameLiteral}`;
  const rawStoragePathLiteral = [
    sanitizedOrganizationLiteral,
    institutionalContextMetadata.evidenceCategoryLiteral,
    currentUtcYearLiteral,
    currentUtcMonthLiteral,
    fileKeySegmentLiteral,
  ].join('/');

  const validatedStoragePathLiteral =
    EnterpriseStoragePathLiteralSchema.parse(rawStoragePathLiteral);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: currentExecutionDateTime.toISOString(),
    severityLevelLiteral: 'DEBUG',
    moduleIdentifierLiteral: STORAGE_PATH_MODULE_IDENTIFIER,
    operationCodeLiteral: PATH_GENERATED_OPERATION_CODE,
    correlationIdentifier,
    messageContentLiteral:
      'Clave jerárquica de almacenamiento S3 generada y validada nominalmente.',
    semanticIntentTag: 'STORAGE_KEY_GENERATED',
    contextMetadataSnapshot: Object.freeze({
      evidenceCategoryLiteral: institutionalContextMetadata.evidenceCategoryLiteral,
      utcPartitionPeriodLiteral: `${currentUtcYearLiteral}-${currentUtcMonthLiteral}`,
    }),
  });

  return validatedStoragePathLiteral;
};

/**
 * @name GenerateSovereignStoragePath
 * @description Alias de compatibilidad transicional mientras se nivelan los consumidores en Fase 1.
 * @deprecated Utilizar canónicamente `GenerateEnterpriseStoragePath` bajo el estándar OEDP-V18.1.
 */
export const GenerateSovereignStoragePath = GenerateEnterpriseStoragePath;
