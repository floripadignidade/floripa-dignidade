/**
 * @section Tools & Infrastructure - Supabase Storage S3 Gateway Probe (Atom)
 * @description Sonda de conectividad y autenticación de red encargada de auditar
 * la pasarela S3-Compatible de Supabase Storage ('S3_ENDPOINT', 'S3_ACCESS_KEY_ID',
 * 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET', 'S3_REGION').
 * Implementa la firma canónica AWS Signature Version 4 (SigV4) de forma pura mediante 'node:crypto',
 * garantizando cero dependencias externas y ejecución isomórfica ultra-rápida.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { createHash, createHmac } from 'node:crypto';
import { URL } from 'node:url';

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const PROBE_MODULE_IDENTIFIER =
  'SUPABASE_STORAGE_S3_PROBE_ATOM' as ModuleIdentifier;

/**
 * @constant MAXIMUM_S3_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY
 * Límite estricto de tiempo de respuesta para la prueba de la pasarela S3.
 */
const MAXIMUM_S3_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * @constant EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL
 * Hash SHA-256 de un cuerpo vacío, constante estándar en el protocolo AWS SigV4.
 */
const EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL =
  'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855';

/**
 * Calcula la clave de firma derivada para el protocolo AWS Signature Version 4.
 *
 * @param secretAccessKeyLiteral - Clave secreta de acceso S3.
 * @param dateStampLiteral - Fecha en formato YYYYMMDD.
 * @param regionNameLiteral - Región de la infraestructura (ej: us-east-1).
 * @param serviceNameLiteral - Nombre del servicio (s3).
 * @returns {Buffer} Búfer binario con la clave criptográfica derivada.
 */
const DeriveAwsSignatureKeyBuffer = (
  secretAccessKeyLiteral: string,
  dateStampLiteral: string,
  regionNameLiteral: string,
  serviceNameLiteral: string,
): Buffer => {
  const initialKeySignature = createHmac(
    'sha256',
    `AWS4${secretAccessKeyLiteral}`,
  )
    .update(dateStampLiteral)
    .digest();

  const regionKeySignature = createHmac('sha256', initialKeySignature)
    .update(regionNameLiteral)
    .digest();

  const serviceKeySignature = createHmac('sha256', regionKeySignature)
    .update(serviceNameLiteral)
    .digest();

  return createHmac('sha256', serviceKeySignature)
    .update('aws4_request')
    .digest();
};

/**
 * Audita físicamente la pasarela S3 de Supabase ejecutando una consulta autenticada SigV4.
 *
 * @param correlationIdentifierFallback - Identificador único opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot con el diagnóstico de la pasarela S3.
 */
export const AuditSupabaseStorageS3Probe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawS3EndpointLiteral = environmentMetadataSnapshot['S3_ENDPOINT'];
  const rawAccessKeyIdLiteral = environmentMetadataSnapshot['S3_ACCESS_KEY_ID'];
  const rawSecretAccessKeyLiteral =
    environmentMetadataSnapshot['S3_SECRET_ACCESS_KEY'];
  const rawBucketNameLiteral =
    environmentMetadataSnapshot['S3_BUCKET'] ?? 'media-vault';
  const rawRegionNameLiteral =
    environmentMetadataSnapshot['S3_REGION'] ?? 'us-east-1';

  // 1. VERIFICACIÓN DE CONFIGURACIÓN DE SECRETOS
  const isS3ConfiguredBoolean =
    !!rawS3EndpointLiteral &&
    !!rawAccessKeyIdLiteral &&
    !!rawSecretAccessKeyLiteral;

  if (!isS3ConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral:
        'S3_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Supabase S3 omitida: Variables S3_ENDPOINT, S3_ACCESS_KEY_ID o S3_SECRET_ACCESS_KEY no configuradas.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'Las credenciales de acceso S3 de Supabase Storage no están configuradas.',
      endpointTargetLiteral: rawS3EndpointLiteral ?? 'ENDPOINT_S3_NO_CONFIGURADO',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_S3_STORAGE_SECRETS',
    });
  }

  // 2. CONSTRUCCIÓN DE RUTAS Y MARCAS TEMPORALES
  let parsedEndpointUrl: URL;
  try {
    parsedEndpointUrl = new URL(rawS3EndpointLiteral);
  } catch (caughtUrlError: unknown) {
    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'La URL configurada en S3_ENDPOINT posee un formato inválido.',
      endpointTargetLiteral: rawS3EndpointLiteral,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MALFORMED_S3_ENDPOINT_URI',
    });
  }

  const currentDateInstance = new Date();
  const amzDateTimestampLiteral = currentDateInstance
    .toISOString()
    .replace(/[:-]|\.\d{3}/g, '');
  const dateStampLiteral = amzDateTimestampLiteral.substring(0, 8);

  // Consulta por lista de objetos limitada a 0 claves para probar existencia y credenciales
  const canonicalPathLiteral = `/${rawBucketNameLiteral}`;
  const canonicalQueryStringLiteral = 'max-keys=0';
  const targetHostLiteral = parsedEndpointUrl.host;

  const targetRequestUrlLiteral = `${parsedEndpointUrl.protocol}//${targetHostLiteral}${canonicalPathLiteral}?${canonicalQueryStringLiteral}`;

  // 3. GENERACIÓN CRIPTOGRÁFICA DE AWS SIGNATURE V4
  const canonicalHeadersLiteral = `host:${targetHostLiteral}\nx-amz-content-sha256:${EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL}\nx-amz-date:${amzDateTimestampLiteral}\n`;
  const signedHeadersLiteral = 'host;x-amz-content-sha256;x-amz-date';

  const canonicalRequestLiteral = [
    'GET',
    canonicalPathLiteral,
    canonicalQueryStringLiteral,
    canonicalHeadersLiteral,
    signedHeadersLiteral,
    EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
  ].join('\n');

  const canonicalRequestHashLiteral = createHash('sha256')
    .update(canonicalRequestLiteral)
    .digest('hex');

  const credentialScopeLiteral = `${dateStampLiteral}/${rawRegionNameLiteral}/s3/aws4_request`;

  const stringToSignLiteral = [
    'AWS4-HMAC-SHA256',
    amzDateTimestampLiteral,
    credentialScopeLiteral,
    canonicalRequestHashLiteral,
  ].join('\n');

  const signingKeyBuffer = DeriveAwsSignatureKeyBuffer(
    rawSecretAccessKeyLiteral,
    dateStampLiteral,
    rawRegionNameLiteral,
    's3',
  );

  const calculatedSignatureHexLiteral = createHmac('sha256', signingKeyBuffer)
    .update(stringToSignLiteral)
    .digest('hex');

  const authorizationHeaderLiteral = `AWS4-HMAC-SHA256 Credential=${rawAccessKeyIdLiteral}/${credentialScopeLiteral}, SignedHeaders=${signedHeadersLiteral}, Signature=${calculatedSignatureHexLiteral}`;

  const executionStartTimestampNumeric = performance.now();

  try {
    // 4. DESPACHO DE LA CONSULTA FÍSICA AL GATEWAY S3
    const incomingNetworkResponse = await fetch(targetRequestUrlLiteral, {
      method: 'GET',
      headers: {
        Host: targetHostLiteral,
        'x-amz-date': amzDateTimestampLiteral,
        'x-amz-content-sha256': EMPTY_PAYLOAD_SHA256_HASH_HEX_LITERAL,
        Authorization: authorizationHeaderLiteral,
      },
      signal: AbortSignal.timeout(
        MAXIMUM_S3_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY,
      ),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    // 5. TRIAJE DE CÓDIGOS DE ESTADO S3
    if (incomingNetworkResponse.ok) {
      const isLatencyDegradedBoolean =
        executionLatencyInMillisecondsQuantity > 1000;

      const finalStatusLiteral = isLatencyDegradedBoolean
        ? 'DEGRADED_LATENCY'
        : 'NOMINAL_OPERATIONAL';

      const statusDescriptionLiteral = isLatencyDegradedBoolean
        ? `Pasarela S3 operativa con latencia elevada (${executionLatencyInMillisecondsQuantity}ms). Bucket: [${rawBucketNameLiteral}].`
        : `Pasarela S3 de Supabase Storage plenamente operativa y autenticada. Bucket: [${rawBucketNameLiteral}].`;

      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
        moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
        operationCodeLiteral: 'S3_PROBE_SUCCESSFUL' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: statusDescriptionLiteral,
        executionLatencyInMillisecondsQuantity,
        semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
        contextMetadataSnapshot: {
          bucketNameLiteral: rawBucketNameLiteral,
          executionLatencyInMillisecondsQuantity,
        },
      });

      return Object.freeze({
        providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
        probeStatusLiteral: finalStatusLiteral,
        executionLatencyInMillisecondsQuantity,
        statusDescriptionLiteral,
        endpointTargetLiteral: targetRequestUrlLiteral,
        hasValidSecretFormatBoolean: true,
      });
    }

    // 6. TRIAJE DE RECHAZO DE FIRMA O BUCKET INEXISTENTE
    const isAuthenticationFailureBoolean =
      incomingNetworkResponse.status === 403;
    const isBucketNotFoundBoolean = incomingNetworkResponse.status === 404;

    const errorStatusDescriptionLiteral = isAuthenticationFailureBoolean
      ? `Autenticación S3 rechazada (HTTP 403): Claves de acceso S3 inválidas o desalineadas con la región.`
      : isBucketNotFoundBoolean
        ? `El bucket [${rawBucketNameLiteral}] no existe en Supabase Storage (HTTP 404). Debe crearlo en el panel.`
        : `La pasarela S3 respondió con código de error inesperado (HTTP ${incomingNetworkResponse.status}).`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: isAuthenticationFailureBoolean
        ? ('S3_PROBE_AUTH_REJECTED' as OperationCode)
        : ('S3_PROBE_HTTP_ERROR' as OperationCode),
      correlationIdentifier,
      messageContentLiteral: errorStatusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
      contextMetadataSnapshot: {
        httpStatusCodeNumeric: incomingNetworkResponse.status,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: isAuthenticationFailureBoolean
        ? 'AUTHENTICATION_REJECTED'
        : 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: errorStatusDescriptionLiteral,
      endpointTargetLiteral: targetRequestUrlLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}`,
    });
  } catch (caughtExecutionError: unknown) {
    // 7. TRIAJE DE COLAPSO DE RED
    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    const errorDescriptionLiteral =
      caughtExecutionError instanceof Error
        ? caughtExecutionError.message
        : String(caughtExecutionError);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'CRITICAL',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'S3_PROBE_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con pasarela S3: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetRequestUrlLiteral,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de alcanzar la pasarela S3: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: targetRequestUrlLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};