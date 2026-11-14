/**
 * @section Infrastructure Auditor - AWS SigV4 Storage Request Builder (Orchestrator)
 * @description Orquestador de firma AWS Signature Version 4 (SigV4) para la sonda
 * física de Supabase Storage S3. Valida parámetros con Zod, resuelve coordenadas URI
 * preservando el `pathname` base del proveedor, delega el cálculo HMAC-SHA256 en átomos
 * puros y emite telemetría SRE ante entradas malformadas manteniendo compatibilidad total.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Mantenibilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import { ComputeAwsSigV4AuthorizationHeader } from './sigv4/ComputeAwsSigV4AuthorizationHeader';
import { ResolveAwsSigV4EndpointCoordinates } from './sigv4/ResolveAwsSigV4EndpointCoordinates';
import {
  AwsSigV4RequestDescriptorSchema,
  BuildAwsSigV4RequestParametersSchema,
  EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
  type IAwsSigV4RequestDescriptor,
  type IBuildAwsSigV4RequestParameters,
} from './sigv4/schemas/AwsSigV4StorageRequest.schema';

export {
  AwsSigV4RequestDescriptorSchema,
  BuildAwsSigV4RequestParametersSchema,
  type IAwsSigV4RequestDescriptor,
  type IBuildAwsSigV4RequestParameters,
};

const SIGV4_BUILDER_MODULE_IDENTIFIER = 'AWS_SIGV4_STORAGE_REQUEST_BUILDER' as ModuleIdentifier;

const emitInvalidSigV4InputSignalAction = (
  diagnosticErrorLiteral: string,
  contextMetadataSnapshot: Readonly<Record<string, unknown>>,
): void => {
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'WARNING',
    moduleIdentifierLiteral: SIGV4_BUILDER_MODULE_IDENTIFIER,
    operationCodeLiteral: 'SIGV4_REQUEST_BUILD_REJECTED' as OperationCode,
    correlationIdentifier: GenerateCorrelationIdentifier(),
    messageContentLiteral: `Construcción de petición AWS SigV4 rechazada: [${diagnosticErrorLiteral}].`,
    semanticIntentTag: 'INFRASTRUCTURE_SIGNATURE_VALIDATION_WARNING',
    contextMetadataSnapshot,
  });
};

/**
 * Construye una petición GET autenticada mediante AWS SigV4 preservando el `pathname` del endpoint S3.
 *
 * @param parametersSnapshot - Credenciales S3 normalizadas y coordenadas de bucket/región.
 * @returns {IAwsSigV4RequestDescriptor} Descriptor sellado e inmutable con URL y cabeceras HMAC.
 */
export const BuildAwsSigV4StorageRequest = (
  parametersSnapshot: IBuildAwsSigV4RequestParameters,
): IAwsSigV4RequestDescriptor => {
  const parametersValidationResult =
    BuildAwsSigV4RequestParametersSchema.safeParse(parametersSnapshot);

  if (!parametersValidationResult.success) {
    const diagnosticErrorLiteral = 'INVALID_SIGV4_PARAMETERS_CONTRACT';
    emitInvalidSigV4InputSignalAction(diagnosticErrorLiteral, {
      validationIssuesCollection: parametersValidationResult.error.flatten(),
    });

    return AwsSigV4RequestDescriptorSchema.parse({
      isEndpointValidBoolean: false,
      targetRequestUrlLiteral: parametersSnapshot.s3EndpointLiteral ?? '',
      signedHeadersSnapshot: Object.freeze({}),
      diagnosticErrorLiteral,
    });
  }

  const validatedParameters = parametersValidationResult.data;
  const endpointCoordinates = ResolveAwsSigV4EndpointCoordinates(
    validatedParameters.s3EndpointLiteral,
    validatedParameters.bucketNameLiteral,
  );

  if (!endpointCoordinates.isEndpointValidBoolean) {
    const diagnosticErrorLiteral =
      endpointCoordinates.diagnosticErrorLiteral ?? 'MALFORMED_S3_ENDPOINT_URI';
    emitInvalidSigV4InputSignalAction(diagnosticErrorLiteral, {
      diagnosticErrorLiteral,
      bucketNameLiteral: validatedParameters.bucketNameLiteral,
    });

    return AwsSigV4RequestDescriptorSchema.parse({
      isEndpointValidBoolean: false,
      targetRequestUrlLiteral: endpointCoordinates.targetRequestUrlLiteral,
      signedHeadersSnapshot: Object.freeze({}),
      diagnosticErrorLiteral,
    });
  }

  const amzDateTimestampLiteral = new Date().toISOString().replace(/[:-]|\.\d{3}/g, '');
  const dateStampLiteral = amzDateTimestampLiteral.substring(0, 8);

  const authorizationHeaderLiteral = ComputeAwsSigV4AuthorizationHeader({
    accessKeyIdentifierSecret: validatedParameters.accessKeyIdentifierSecret,
    secretAccessKeySecret: validatedParameters.secretAccessKeySecret,
    regionNameLiteral: validatedParameters.regionNameLiteral,
    targetHostLiteral: endpointCoordinates.targetHostLiteral,
    canonicalPathLiteral: endpointCoordinates.canonicalPathLiteral,
    canonicalQueryStringLiteral: endpointCoordinates.canonicalQueryStringLiteral,
    amzDateTimestampLiteral,
    dateStampLiteral,
  });

  return AwsSigV4RequestDescriptorSchema.parse({
    isEndpointValidBoolean: true,
    targetRequestUrlLiteral: endpointCoordinates.targetRequestUrlLiteral,
    signedHeadersSnapshot: Object.freeze({
      Host: endpointCoordinates.targetHostLiteral,
      'x-amz-date': amzDateTimestampLiteral,
      'x-amz-content-sha256': EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
      Authorization: authorizationHeaderLiteral,
    }),
  });
};
