/**
 * @section Storage Logic - Physical Cloud Storage Dispatcher (Orchestrator)
 * @description Orquestador de I/O encargado de ejecutar la transferencia binaria segura
 * hacia el almacenamiento cloud (Supabase Storage / S3-Compatible). Valida parámetros
 * mediante Zod, construye cabeceras inmutables, normaliza el búfer binario sin `any`,
 * controla timeouts de red con `AbortController`, mide latencia mediante `TraceExecutionTime`
 * y emite trazabilidad SRE conforme a `TelemetrySignalSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { MapHttpErrorToException, ValidationException } from '@floripa-dignidade/exceptions';
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

import {
  CloudStorageUploadParametersSchema,
  type ICloudStorageUploadParameters,
} from '../schemas/CloudStorageUpload.schema';
import { BuildCloudStorageUploadHeaders } from './BuildCloudStorageUploadHeaders';
import { ConvertUint8ArrayToExactArrayBuffer } from './ConvertUint8ArrayToExactArrayBuffer';
import { NormalizeCloudStorageUploadError } from './NormalizeCloudStorageUploadError';

export { CloudStorageUploadParametersSchema, type ICloudStorageUploadParameters };

const STORAGE_DISPATCHER_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'CLOUD_STORAGE_PHYSICAL_DISPATCHER',
);

const UPLOAD_TRACE_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'EXECUTE_PHYSICAL_BINARY_UPLOAD',
);

const UPLOAD_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLOUD_UPLOAD_NOMINAL_SUCCESS',
);

const UPLOAD_VALIDATION_WARNING_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLOUD_UPLOAD_CONTRACT_VIOLATION',
);

const UPLOAD_FAULT_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'CLOUD_UPLOAD_PHYSICAL_FAULT',
);

const MAXIMUM_RESPONSE_DIAGNOSTIC_SNIPPET_LENGTH_QUANTITY = 256;

const resolveSafeCorrelationIdentifier = (
  candidateIdentifier: string | undefined,
): CorrelationIdentifier => {
  const validationResult = CorrelationIdentifierSchema.safeParse(candidateIdentifier);
  return validationResult.success ? validationResult.data : GenerateCorrelationIdentifier();
};

const extractSanitizedEndpointPathLiteral = (rawUrlLiteral: string): string => {
  try {
    const parsedUrl = new URL(rawUrlLiteral);
    return `${parsedUrl.origin}${parsedUrl.pathname}`;
  } catch {
    return 'INVALID_STORAGE_ENDPOINT';
  }
};

/**
 * Ejecuta el despacho binario seguro hacia el servicio de almacenamiento en la nube.
 *
 * @param parametersSnapshot - Configuración de endpoint HTTPS, credenciales, MIME y búfer binario.
 * @returns {Promise<void>} Promesa que resuelve cuando la nube confirma la persistencia del objeto.
 * @throws {ValidationException} Si los parámetros violan el contrato Zod o las reglas TLS/cuota.
 * @throws {GlobalBaseException} Si la transferencia expira, es rechazada por el proveedor o falla la red.
 */
export const ExecuteCloudStorageUpload = async (
  parametersSnapshot: ICloudStorageUploadParameters,
): Promise<void> => {
  const correlationIdentifier = resolveSafeCorrelationIdentifier(
    parametersSnapshot?.correlationIdentifier,
  );

  const parametersValidationResult =
    CloudStorageUploadParametersSchema.safeParse(parametersSnapshot);

  if (!parametersValidationResult.success) {
    const validationIssuesCollection = parametersValidationResult.error.flatten();

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: STORAGE_DISPATCHER_MODULE_IDENTIFIER,
      operationCodeLiteral: UPLOAD_VALIDATION_WARNING_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral:
        'Carga multimedia bloqueada en frontera por violación del contrato de parámetros.',
      semanticIntentTag: 'MULTIMEDIA_UPLOAD_CONTRACT_VIOLATION',
      contextMetadataSnapshot: Object.freeze({ validationIssuesCollection }),
    });

    const validationException = new ValidationException('INVALID_CLOUD_STORAGE_UPLOAD_PARAMETERS', {
      validationIssuesCollection,
      correlationIdentifier,
    });

    ReportForensicException(validationException, correlationIdentifier);
    throw validationException;
  }

  const validatedParameters = parametersValidationResult.data;
  const endpointSanitizedPathLiteral = extractSanitizedEndpointPathLiteral(
    validatedParameters.targetUploadEndpointLiteral,
  );

  return await TraceExecutionTime(
    STORAGE_DISPATCHER_MODULE_IDENTIFIER,
    UPLOAD_TRACE_OPERATION_CODE,
    correlationIdentifier,
    async (): Promise<void> => {
      const abortControllerInstance = new AbortController();
      const timeoutHandleReference = setTimeout(
        () => abortControllerInstance.abort(),
        validatedParameters.timeoutInMillisecondsQuantity,
      );

      try {
        const uploadHeadersSnapshot = BuildCloudStorageUploadHeaders({
          cloudAccessSecurityKeySecret: validatedParameters.cloudAccessSecurityKeySecret,
          contentMimeTypeLiteral: validatedParameters.contentMimeTypeLiteral,
          isUpsertEnabledBoolean: validatedParameters.isUpsertEnabledBoolean,
          cacheControlSecondsLiteral: validatedParameters.cacheControlSecondsLiteral,
        });

        const exactBinaryPayloadBuffer = ConvertUint8ArrayToExactArrayBuffer(
          validatedParameters.binaryContentBody,
        );

        const networkResponse = await fetch(validatedParameters.targetUploadEndpointLiteral, {
          method: 'POST',
          headers: { ...uploadHeadersSnapshot },
          body: exactBinaryPayloadBuffer,
          signal: abortControllerInstance.signal,
        });

        if (!networkResponse.ok) {
          const rawErrorSnippetLiteral = await networkResponse
            .text()
            .then((textContentLiteral) =>
              textContentLiteral.slice(0, MAXIMUM_RESPONSE_DIAGNOSTIC_SNIPPET_LENGTH_QUANTITY),
            )
            .catch(() => '');

          throw MapHttpErrorToException(
            networkResponse.status,
            'STORAGE_UPLOAD_REJECTED_BY_PROVIDER',
            {
              httpStatusNumeric: networkResponse.status,
              statusTextLiteral: networkResponse.statusText,
              endpointSanitizedPathLiteral,
              ...(rawErrorSnippetLiteral.length > 0 && { rawErrorSnippetLiteral }),
            },
          );
        }

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'INFO',
          moduleIdentifierLiteral: STORAGE_DISPATCHER_MODULE_IDENTIFIER,
          operationCodeLiteral: UPLOAD_SUCCESS_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral: 'Transferencia física de activo multimedia completada.',
          semanticIntentTag: 'MULTIMEDIA_CLOUD_UPLOAD_SUCCESS',
          contextMetadataSnapshot: Object.freeze({
            contentMimeTypeLiteral: validatedParameters.contentMimeTypeLiteral,
            payloadSizeBytesQuantity: validatedParameters.binaryContentBody.byteLength,
            endpointSanitizedPathLiteral,
          }),
        });
      } catch (caughtExecutionError: unknown) {
        const normalizedException = NormalizeCloudStorageUploadError(
          caughtExecutionError,
          endpointSanitizedPathLiteral,
          validatedParameters.timeoutInMillisecondsQuantity,
          correlationIdentifier,
        );

        void EmitTelemetrySignal({
          occurrenceTimestampISO: new Date().toISOString(),
          severityLevelLiteral: 'CRITICAL',
          moduleIdentifierLiteral: STORAGE_DISPATCHER_MODULE_IDENTIFIER,
          operationCodeLiteral: UPLOAD_FAULT_OPERATION_CODE,
          correlationIdentifier,
          messageContentLiteral:
            'Fallo crítico en el enlace físico de carga multimedia en la nube.',
          semanticIntentTag: 'INFRASTRUCTURE_IO_FAULT',
          contextMetadataSnapshot: Object.freeze({
            httpStatusCodeNumeric: normalizedException.httpStatusCodeNumeric,
            operationalErrorCodeLiteral: normalizedException.operationalErrorCodeLiteral,
            endpointSanitizedPathLiteral,
          }),
        });

        ReportForensicException(normalizedException, correlationIdentifier);
        throw normalizedException;
      } finally {
        clearTimeout(timeoutHandleReference);
      }
    },
  );
};
