/**
 * @section Infrastructure Auditor - Supabase Storage S3 Response Triage (Atom)
 * @description Átomo de lógica pura encargado de evaluar la respuesta HTTP devuelta
 * por la pasarela S3-Compatible de Supabase Storage, diagnosticar latencias elevadas,
 * rechazos de firma SigV4 (HTTP 403) o ausencia de bucket (HTTP 404), y emitir
 * telemetría forense estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

/* 1. Infraestructura Core de Telemetría */
import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría (Clean Paths) */
import type {
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../../schemas/CloudInfrastructureAuditReport.schema';

const TRIAGE_MODULE_IDENTIFIER = 'SUPABASE_STORAGE_S3_TRIAGE_ATOM' as ModuleIdentifier;
const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 1000;

interface IS3OutcomeDescriptor {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly severityLevelLiteral: 'INFO' | 'WARNING';
}

/**
 * Clasifica una respuesta HTTP 2xx evaluando si la latencia supera el umbral SRE.
 */
const resolveNominalS3Outcome = (
  executionLatencyInMillisecondsQuantity: number,
  bucketNameLiteral: string,
): IS3OutcomeDescriptor => {
  const isLatencyDegradedBoolean =
    executionLatencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

  if (isLatencyDegradedBoolean) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral: `Pasarela S3 operativa con latencia elevada (${executionLatencyInMillisecondsQuantity}ms). Bucket: [${bucketNameLiteral}].`,
      severityLevelLiteral: 'WARNING',
    };
  }

  return {
    probeStatusLiteral: 'NOMINAL_OPERATIONAL',
    statusDescriptionLiteral: `Pasarela S3 de Supabase Storage plenamente operativa y autenticada. Bucket: [${bucketNameLiteral}].`,
    severityLevelLiteral: 'INFO',
  };
};

/**
 * Clasifica códigos de error S3 (403 firma inválida, 404 bucket ausente u otros).
 */
const resolveErrorS3Outcome = (
  httpStatusCodeNumeric: number,
  bucketNameLiteral: string,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly operationCodeLiteral: OperationCode;
} => {
  const isAuthenticationFailureBoolean = httpStatusCodeNumeric === 403;
  const isBucketNotFoundBoolean = httpStatusCodeNumeric === 404;

  if (isAuthenticationFailureBoolean) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral:
        'Autenticación S3 rechazada (HTTP 403): Claves de acceso S3 inválidas o desalineadas con la región.',
      operationCodeLiteral: 'S3_PROBE_AUTH_REJECTED' as OperationCode,
    };
  }

  if (isBucketNotFoundBoolean) {
    return {
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      statusDescriptionLiteral: `El bucket [${bucketNameLiteral}] no existe en Supabase Storage (HTTP 404). Debe crearlo en el panel.`,
      operationCodeLiteral: 'S3_PROBE_BUCKET_MISSING' as OperationCode,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `La pasarela S3 respondió con código de error inesperado (HTTP ${httpStatusCodeNumeric}).`,
    operationCodeLiteral: 'S3_PROBE_HTTP_ERROR' as OperationCode,
  };
};

/**
 * Evalúa la respuesta HTTP de la pasarela S3 y construye el snapshot forense inmutable.
 *
 * @param incomingNetworkResponse - Respuesta HTTP recibida desde el gateway S3.
 * @param executionLatencyInMillisecondsQuantity - Latencia de red medida en milisegundos.
 * @param endpointTargetLiteral - URL objetivo consultada durante el sondeo.
 * @param bucketNameLiteral - Nombre del bucket evaluado.
 * @param correlationIdentifier - Identificador único de correlación para trazabilidad forense.
 * @returns {IIndividualProviderAuditSnapshot} Snapshot inmutable con el veredicto de salud S3.
 */
export const TriageSupabaseStorageS3Response = (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  endpointTargetLiteral: string,
  bucketNameLiteral: string,
  correlationIdentifier: string,
): IIndividualProviderAuditSnapshot => {
  if (incomingNetworkResponse.ok) {
    const { probeStatusLiteral, statusDescriptionLiteral, severityLevelLiteral } =
      resolveNominalS3Outcome(executionLatencyInMillisecondsQuantity, bucketNameLiteral);

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral,
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'S3_PROBE_SUCCESSFUL' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
      contextMetadataSnapshot: {
        bucketNameLiteral,
        executionLatencyInMillisecondsQuantity,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
      probeStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral,
      hasValidSecretFormatBoolean: true,
    });
  }

  const { probeStatusLiteral, statusDescriptionLiteral, operationCodeLiteral } =
    resolveErrorS3Outcome(incomingNetworkResponse.status, bucketNameLiteral);

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: 'CRITICAL',
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric: incomingNetworkResponse.status,
      bucketNameLiteral,
    },
  });

  return Object.freeze({
    providerIdentifier: 'SUPABASE_STORAGE_S3_GATEWAY',
    probeStatusLiteral,
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral,
    endpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}`,
  });
};
