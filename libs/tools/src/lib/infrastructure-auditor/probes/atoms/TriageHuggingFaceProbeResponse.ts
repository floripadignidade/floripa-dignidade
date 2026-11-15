/**
 * @file libs/tools/src/lib/infrastructure-auditor/probes/atoms/TriageHuggingFaceProbeResponse.ts
 * @section Infrastructure Auditor - Hugging Face Response Triage Engine (Atom)
 * @description Átomo encargado de evaluar la respuesta HTTP de Hugging Face Router
 * (`200 OK`, `400/404/422` modelo no soportado o solicitud inválida, `401/403` autenticación,
 * `429` cuota excedida, `503` carga en frío y `5xx`), detectar latencia degradada, emitir
 * telemetría SRE conforme a `TelemetrySignalSchema` y validar contra `IndividualProviderAuditSnapshotSchema`.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import {
  EmitTelemetrySignal,
  type ModuleIdentifier,
  ModuleIdentifierSchema,
  type OperationCode,
  OperationCodeSchema,
} from '@floripa-dignidade/telemetry';

import {
  type IIndividualProviderAuditSnapshot,
  IndividualProviderAuditSnapshotSchema,
  type TProbeExecutionStatus,
} from '../../schemas/CloudInfrastructureAuditReport.schema';

const TRIAGE_MODULE_IDENTIFIER: ModuleIdentifier = ModuleIdentifierSchema.parse(
  'HUGGING_FACE_RESPONSE_TRIAGE_ATOM',
);

const PROBE_SUCCESS_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_PROBE_SUCCESSFUL',
);

const AUTH_REJECTED_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_PROBE_AUTH_REJECTED',
);

const HTTP_ERROR_OPERATION_CODE: OperationCode = OperationCodeSchema.parse(
  'HUGGING_FACE_PROBE_HTTP_ERROR',
);

const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 1500;
const MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY = 200;

interface IHuggingFaceHttpErrorDescriptor {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly severityLevelLiteral: 'WARNING' | 'CRITICAL';
  readonly operationCodeLiteral: OperationCode;
}

const classifyHttpErrorDescriptor = (
  httpStatusCodeNumeric: number,
  modelIdentifierLiteral: string,
  responseSnippetLiteral: string,
): IHuggingFaceHttpErrorDescriptor => {
  if (httpStatusCodeNumeric === 503) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral: `El modelo [${modelIdentifierLiteral}] está cargando en memoria del enrutador (Cold Start 503). Reintento sugerido.`,
      severityLevelLiteral: 'WARNING',
      operationCodeLiteral: HTTP_ERROR_OPERATION_CODE,
    };
  }

  if (httpStatusCodeNumeric === 429) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral: 'Límite de solicitudes excedido en Hugging Face Router (HTTP 429).',
      severityLevelLiteral: 'WARNING',
      operationCodeLiteral: HTTP_ERROR_OPERATION_CODE,
    };
  }

  if (httpStatusCodeNumeric === 401 || httpStatusCodeNumeric === 403) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Hugging Face Router rechazó la autenticación (HTTP ${httpStatusCodeNumeric}): HUGGING_FACE_API_TOKEN inválido o sin permisos.`,
      severityLevelLiteral: 'CRITICAL',
      operationCodeLiteral: AUTH_REJECTED_OPERATION_CODE,
    };
  }

  if (
    httpStatusCodeNumeric === 400 ||
    httpStatusCodeNumeric === 404 ||
    httpStatusCodeNumeric === 422
  ) {
    const suffixDetailLiteral = responseSnippetLiteral ? ` (${responseSnippetLiteral})` : '';
    return {
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      statusDescriptionLiteral: `Modelo [${modelIdentifierLiteral}] no soportado o solicitud inválida en Hugging Face Router (HTTP ${httpStatusCodeNumeric})${suffixDetailLiteral}.`,
      severityLevelLiteral: 'CRITICAL',
      operationCodeLiteral: HTTP_ERROR_OPERATION_CODE,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `Hugging Face Router respondió con código de error HTTP ${httpStatusCodeNumeric}.`,
    severityLevelLiteral: 'CRITICAL',
    operationCodeLiteral: HTTP_ERROR_OPERATION_CODE,
  };
};

const readBoundedErrorSnippetAction = async (
  incomingNetworkResponse: Response,
): Promise<string> => {
  try {
    const rawBodyTextLiteral = await incomingNetworkResponse.text();
    return rawBodyTextLiteral.trim().slice(0, MAXIMUM_ERROR_SNIPPET_LENGTH_QUANTITY);
  } catch {
    return '';
  }
};

/**
 * Evalúa la respuesta HTTP de Hugging Face Router y emite el diagnóstico certificado.
 *
 * @param incomingNetworkResponse - Respuesta HTTP cruda devuelta por el enrutador.
 * @param executionLatencyInMillisecondsQuantity - Latencia medida en milisegundos.
 * @param endpointTargetLiteral - URL consultada durante la verificación.
 * @param modelIdentifierLiteral - Identificador del modelo sondeado.
 * @param correlationIdentifier - Identificador UUID v4 de correlación forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable y validado por Zod.
 */
export const TriageHuggingFaceProbeResponse = async (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  endpointTargetLiteral: string,
  modelIdentifierLiteral: string,
  correlationIdentifier: string,
): Promise<IIndividualProviderAuditSnapshot> => {
  if (incomingNetworkResponse.ok) {
    const isLatencyDegradedBoolean =
      executionLatencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

    const probeStatusLiteral: TProbeExecutionStatus = isLatencyDegradedBoolean
      ? 'DEGRADED_LATENCY'
      : 'NOMINAL_OPERATIONAL';

    const statusDescriptionLiteral = isLatencyDegradedBoolean
      ? `Hugging Face Router operativo (${modelIdentifierLiteral}) con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
      : `Hugging Face Router plenamente operativo y autenticado (${modelIdentifierLiteral}, ${executionLatencyInMillisecondsQuantity}ms).`;

    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: isLatencyDegradedBoolean ? 'WARNING' : 'INFO',
      moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
      operationCodeLiteral: PROBE_SUCCESS_OPERATION_CODE,
      correlationIdentifier,
      messageContentLiteral: statusDescriptionLiteral,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
      contextMetadataSnapshot: Object.freeze({
        httpStatusCodeNumeric: incomingNetworkResponse.status,
        modelIdentifierLiteral,
        endpointTargetLiteral,
      }),
    });

    return Object.freeze(
      IndividualProviderAuditSnapshotSchema.parse({
        providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
        probeStatusLiteral,
        executionLatencyInMillisecondsQuantity,
        statusDescriptionLiteral,
        endpointTargetLiteral,
        hasValidSecretFormatBoolean: true,
      }),
    );
  }

  const responseSnippetLiteral = await readBoundedErrorSnippetAction(incomingNetworkResponse);
  const errorDescriptor = classifyHttpErrorDescriptor(
    incomingNetworkResponse.status,
    modelIdentifierLiteral,
    responseSnippetLiteral,
  );

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: errorDescriptor.severityLevelLiteral,
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: errorDescriptor.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: errorDescriptor.statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_FAILURE',
    contextMetadataSnapshot: Object.freeze({
      httpStatusCodeNumeric: incomingNetworkResponse.status,
      modelIdentifierLiteral,
      endpointTargetLiteral,
      ...(responseSnippetLiteral.length > 0 && { responseSnippetLiteral }),
    }),
  });

  return Object.freeze(
    IndividualProviderAuditSnapshotSchema.parse({
      providerIdentifier: 'HUGGING_FACE_COGNITIVE_INFERENCE',
      probeStatusLiteral: errorDescriptor.probeStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: errorDescriptor.statusDescriptionLiteral,
      endpointTargetLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}`,
    }),
  );
};
