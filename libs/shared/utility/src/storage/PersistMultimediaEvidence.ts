/**
 * @section Storage Logic - Multimedia Evidence Orchestrator
 * @description Orquestador encargado de validar activos multimedia o documentales
 * mediante Zod, normalizar sus bytes de forma isomórfica, generar una clave S3
 * particionada y segura, persistir el objeto en Supabase Storage vía HTTPS (ADR 0015),
 * certificar la URL pública de acceso y emitir trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { ValidateEnvironmentContract } from '@floripa-dignidade/environment-validator';
import {
  GlobalBaseException,
  MapHttpErrorToException,
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
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { MultimediaEvidencePayloadSchema } from './schemas/MultimediaEvidence.schema';
import {
  type IMultimediaVaultResult,
  MultimediaVaultResultSchema,
} from './schemas/MultimediaVaultResult.schema';
import { BuildStorageAccessUrl } from './logic/BuildStorageAccessUrl';
import { BuildStorageUploadEndpointUrl } from './logic/BuildStorageUploadEndpointUrl';
import { ExecuteCloudStorageUpload } from './logic/ExecuteCloudStorageUpload';
import { GenerateEnterpriseStoragePath } from './logic/GenerateSovereignStoragePath';
import { TransformToStandardBinaryBuffer } from './logic/TransformToSovereignBinary';

export { MultimediaVaultResultSchema, type IMultimediaVaultResult };

const ORCHESTRATOR_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'MULTIMEDIA_STORAGE_ORCHESTRATOR',
);

const INGESTION_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_MULTIMEDIA_INGESTION_FLOW',
);

const EVIDENCE_STORED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EVIDENCE_STORED_NOMINAL_SUCCESS',
);

const PAYLOAD_REJECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MULTIMEDIA_PAYLOAD_CONTRACT_VIOLATION',
);

const INGESTION_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'MULTIMEDIA_INGESTION_ORCHESTRATION_FAULT',
);

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

/**
 * Ejecuta el pipeline completo de validación, almacenamiento cloud y certificación de URL pública.
 *
 * @param rawPayloadSnapshot - Datos crudos de evidencia multimedia/documental recibidos en frontera.
 * @param correlationIdentifierFallback - Identificador UUID v4 opcional para enlazar trazabilidad distribuida.
 * @returns {Promise<IMultimediaVaultResult>} Snapshot inmutable con la URL HTTPS pública y la clave interna.
 * @throws {ValidationException} Si el payload binario o sus metadatos incumplen `MultimediaEvidencePayloadSchema`.
 * @throws {GlobalBaseException} Si falla la validación de entorno, el transporte hacia Supabase Storage o el contrato de salida.
 */
export const PersistMultimediaEvidence = async (
  rawPayloadSnapshot: unknown,
  correlationIdentifierFallback?: string,
): Promise<IMultimediaVaultResult> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(correlationIdentifierFallback);
  const evidenceIdentifierLiteral = crypto.randomUUID();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    INGESTION_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<IMultimediaVaultResult> => {
      const payloadValidationResult = MultimediaEvidencePayloadSchema.safeParse(rawPayloadSnapshot);

      if (!payloadValidationResult.success) {
        const structuralIssuesCollection = payloadValidationResult.error.flatten();

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'WARNING',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: PAYLOAD_REJECTED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Evidencia multimedia rechazada en frontera por violación de contrato estructural.',
          semanticIntentTag: 'MULTIMEDIA_VALIDATION_WARNING',
          contextMetadataSnapshot: Object.freeze({ structuralIssuesCollection }),
        });

        const validationException = new ValidationException('INVALID_MULTIMEDIA_EVIDENCE_PAYLOAD', {
          structuralIssuesCollection,
          correlationIdentifier,
        });

        ReportForensicException(validationException, correlationIdentifier);
        throw validationException;
      }

      const validatedPayload = payloadValidationResult.data;
      const { institutionalContextMetadata } = validatedPayload;

      try {
        const {
          S3_BUCKET: bucketNameLiteral,
          SUPABASE_URL: supabaseBaseUrlLiteral,
          SUPABASE_SERVICE_ROLE_KEY: cloudSecurityKeySecret,
        } = await ValidateEnvironmentContract();

        const binaryContentBody = await TransformToStandardBinaryBuffer(
          validatedPayload.fileBlobReference,
        );

        const storagePathLiteral = GenerateEnterpriseStoragePath(
          validatedPayload,
          evidenceIdentifierLiteral,
          correlationIdentifier,
        );

        const targetUploadEndpointLiteral = BuildStorageUploadEndpointUrl(
          supabaseBaseUrlLiteral,
          bucketNameLiteral,
          storagePathLiteral,
        );

        await ExecuteCloudStorageUpload({
          targetUploadEndpointLiteral,
          cloudAccessSecurityKeySecret: cloudSecurityKeySecret,
          contentMimeTypeLiteral: institutionalContextMetadata.mimeTypeLiteral,
          binaryContentBody,
          correlationIdentifier,
        });

        const evidenceUrlLiteral = BuildStorageAccessUrl(
          supabaseBaseUrlLiteral,
          bucketNameLiteral,
          storagePathLiteral,
        );

        const validatedVaultResultSnapshot = MultimediaVaultResultSchema.parse({
          evidenceUrlLiteral,
          storagePathLiteral,
        });

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: EVIDENCE_STORED_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Evidencia multimedia consolidada exitosamente en el almacenamiento cloud.',
          semanticIntentTag: 'MULTIMEDIA_STORAGE_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            storagePathLiteral: validatedVaultResultSnapshot.storagePathLiteral,
            mimeTypeLiteral: institutionalContextMetadata.mimeTypeLiteral,
            fileSizeInBytesQuantity: validatedPayload.fileSizeInBytesQuantity,
          }),
        });

        return Object.freeze(validatedVaultResultSnapshot);
      } catch (caughtExecutionError: unknown) {
        const normalizedException =
          caughtExecutionError instanceof GlobalBaseException
            ? caughtExecutionError
            : MapHttpErrorToException(500, 'MULTIMEDIA_STORAGE_ORCHESTRATION_FAILURE', {
                originalErrorLiteral:
                  caughtExecutionError instanceof Error
                    ? caughtExecutionError.message
                    : String(caughtExecutionError),
                correlationIdentifier,
              });

        const isClientFaultBoolean = normalizedException.httpStatusCodeNumeric < 500;

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: isClientFaultBoolean ? 'WARNING' : 'CRITICAL',
          moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
          operationCodeLiteral: INGESTION_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo durante el procesamiento o almacenamiento cloud de la evidencia multimedia.',
          semanticIntentTag: isClientFaultBoolean
            ? 'MULTIMEDIA_VALIDATION_WARNING'
            : 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: Object.freeze({
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      }
    },
  );
};
