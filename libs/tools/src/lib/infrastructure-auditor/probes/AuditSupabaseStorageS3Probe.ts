/**
 * @section Tools & Infrastructure - Supabase Storage S3 Gateway Probe (Orchestrator)
 * @description Sonda de conectividad y autenticación de red encargada de auditar
 * la pasarela S3-Compatible de Supabase Storage ('S3_ENDPOINT', 'S3_ACCESS_KEY_ID',
 * 'S3_SECRET_ACCESS_KEY', 'S3_BUCKET', 'S3_REGION'). Delega la extracción de entorno,
 * la firma criptográfica AWS SigV4 y el triaje de respuestas HTTP en átomos puros.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría (Clean Paths) */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';

/* 3. Átomos Especializados Locales (Clean Paths) */
import { BuildAwsSigV4StorageRequest } from './atoms/BuildAwsSigV4StorageRequest';
import { ExtractSanitizedS3Configuration } from './atoms/ExtractSanitizedS3Configuration';
import { TriageSupabaseStorageS3Response } from './atoms/TriageSupabaseStorageS3Response';

const PROBE_MODULE_IDENTIFIER = 'SUPABASE_STORAGE_S3_PROBE_ATOM' as ModuleIdentifier;
const MAXIMUM_S3_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

/**
 * Audita físicamente la pasarela S3 de Supabase ejecutando una consulta autenticada SigV4.
 *
 * @param correlationIdentifierFallback - Identificador único opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico S3.
 */
export const AuditSupabaseStorageS3Probe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const s3ConfigurationSnapshot = ExtractSanitizedS3Configuration(GatherEnvironmentMetadata());

  if (!s3ConfigurationSnapshot.isConfiguredBoolean) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'S3_PROBE_CREDENTIALS_MISSING' as OperationCode,
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
      endpointTargetLiteral:
        s3ConfigurationSnapshot.s3EndpointLiteral || 'ENDPOINT_S3_NO_CONFIGURADO',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_S3_STORAGE_SECRETS',
    });
  }

  const sigV4RequestDescriptor = BuildAwsSigV4StorageRequest(s3ConfigurationSnapshot);

  if (!sigV4RequestDescriptor.isEndpointValidBoolean) {
    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La URL configurada en S3_ENDPOINT posee un formato inválido.',
      endpointTargetLiteral: sigV4RequestDescriptor.targetRequestUrlLiteral,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral:
        sigV4RequestDescriptor.diagnosticErrorLiteral ?? 'MALFORMED_S3_ENDPOINT_URI',
    });
  }

  const executionStartTimestampNumeric = performance.now();

  try {
    const incomingNetworkResponse = await fetch(sigV4RequestDescriptor.targetRequestUrlLiteral, {
      method: 'GET',
      headers: { ...sigV4RequestDescriptor.signedHeadersSnapshot },
      signal: AbortSignal.timeout(MAXIMUM_S3_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    return TriageSupabaseStorageS3Response(
      incomingNetworkResponse,
      executionLatencyInMillisecondsQuantity,
      sigV4RequestDescriptor.targetRequestUrlLiteral,
      s3ConfigurationSnapshot.bucketNameLiteral,
      correlationIdentifier,
    );
  } catch (caughtExecutionError: unknown) {
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
        targetRequestUrlLiteral: sigV4RequestDescriptor.targetRequestUrlLiteral,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de alcanzar la pasarela S3: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: sigV4RequestDescriptor.targetRequestUrlLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
