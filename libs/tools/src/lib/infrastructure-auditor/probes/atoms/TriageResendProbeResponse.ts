/**
 * @section Infrastructure Auditor - Resend Response Triage Engine (Atom)
 * @description Átomo encargado de evaluar la respuesta HTTP devuelta por la API
 * de Resend (`/domains`), validar el payload JSON de error con Zod para reconocer
 * claves restringidas válidas de solo envío (`restricted_api_key`), diagnosticar
 * degradación de latencia y emitir telemetría SRE estandarizada.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

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

const TRIAGE_MODULE_IDENTIFIER = 'RESEND_RESPONSE_TRIAGE_ATOM' as ModuleIdentifier;
const MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY = 800;
const RESEND_RESTRICTED_API_KEY_CODE_LITERAL = 'restricted_api_key';

/**
 * @name ResendErrorBodySchema
 * @description Aduana Zod inmutable para inspeccionar respuestas de error estructuradas de Resend.
 */
const ResendErrorBodySchema = z
  .object({
    statusCode: z.number().optional(),
    name: z.string().optional(),
    message: z.string().optional(),
  })
  .readonly();

interface IResendTriageOutcome {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
  readonly severityLevelLiteral: 'INFO' | 'WARNING' | 'CRITICAL';
  readonly operationCodeLiteral: OperationCode;
  readonly diagnosticErrorLiteral?: string;
}

/**
 * Extrae de forma segura el código `name` del payload JSON de error de Resend sin lanzar excepciones.
 *
 * @param incomingNetworkResponse - Respuesta HTTP cruda de error recibida desde Resend.
 * @returns {Promise<string | undefined>} Identificador de error normalizado o `undefined`.
 */
const parseResendErrorNameLiteral = async (
  incomingNetworkResponse: Response,
): Promise<string | undefined> => {
  try {
    const rawBodyPayload: unknown = await incomingNetworkResponse.json();
    const validationResult = ResendErrorBodySchema.safeParse(rawBodyPayload);

    return validationResult.success ? validationResult.data.name : undefined;
  } catch {
    return undefined;
  }
};

/**
 * Construye el veredicto operacional para claves verificadas (acceso total o solo envío).
 */
const resolveNominalOutcomeSnapshot = (
  executionLatencyInMillisecondsQuantity: number,
  isRestrictedSendingOnlyBoolean: boolean,
): IResendTriageOutcome => {
  const isLatencyDegradedBoolean =
    executionLatencyInMillisecondsQuantity > MAXIMUM_NOMINAL_LATENCY_IN_MILLISECONDS_QUANTITY;

  const probeStatusLiteral: TProbeExecutionStatus = isLatencyDegradedBoolean
    ? 'DEGRADED_LATENCY'
    : 'NOMINAL_OPERATIONAL';

  const severityLevelLiteral = isLatencyDegradedBoolean ? 'WARNING' : 'INFO';

  if (isRestrictedSendingOnlyBoolean) {
    const statusDescriptionLiteral = isLatencyDegradedBoolean
      ? `Resend operativo con clave de solo envío (restricted_api_key) y latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
      : 'Resend Transactional Email operativo con clave restringida de solo envío (restricted_api_key).';

    return {
      probeStatusLiteral,
      statusDescriptionLiteral,
      severityLevelLiteral,
      operationCodeLiteral: 'RESEND_PROBE_RESTRICTED_KEY_NOMINAL' as OperationCode,
    };
  }

  const statusDescriptionLiteral = isLatencyDegradedBoolean
    ? `Resend API operativa con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`
    : 'Resend Transactional Email plenamente operativo y autenticado.';

  return {
    probeStatusLiteral,
    statusDescriptionLiteral,
    severityLevelLiteral,
    operationCodeLiteral: 'RESEND_PROBE_SUCCESSFUL' as OperationCode,
  };
};

/**
 * Clasifica rechazos reales de autenticación (401/403) y fallos HTTP inesperados.
 */
const resolveRejectionOutcomeSnapshot = (
  httpStatusCodeNumeric: number,
  resendErrorNameLiteral: string | undefined,
): IResendTriageOutcome => {
  const isAuthenticationFailureBoolean =
    httpStatusCodeNumeric === 401 || httpStatusCodeNumeric === 403;

  const diagnosticSuffixLiteral = resendErrorNameLiteral ? `_${resendErrorNameLiteral}` : '';

  if (isAuthenticationFailureBoolean) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Resend API rechazó la autenticación (HTTP ${httpStatusCodeNumeric}): RESEND_API_KEY inválida o revocada.`,
      severityLevelLiteral: 'CRITICAL',
      operationCodeLiteral: 'RESEND_PROBE_AUTH_REJECTED' as OperationCode,
      diagnosticErrorLiteral: `HTTP_STATUS_${httpStatusCodeNumeric}${diagnosticSuffixLiteral}`,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `Resend API respondió con código de error inesperado (HTTP ${httpStatusCodeNumeric}).`,
    severityLevelLiteral: 'CRITICAL',
    operationCodeLiteral: 'RESEND_PROBE_HTTP_ERROR' as OperationCode,
    diagnosticErrorLiteral: `HTTP_STATUS_${httpStatusCodeNumeric}${diagnosticSuffixLiteral}`,
  };
};

/**
 * Emite la señal telemétrica SRE consolidada tras evaluar la respuesta HTTP de Resend.
 */
const emitResendTelemetrySignalAction = (
  outcomeSnapshot: IResendTriageOutcome,
  executionLatencyInMillisecondsQuantity: number,
  httpStatusCodeNumeric: number,
  isSenderEmailConfiguredBoolean: boolean,
  correlationIdentifier: string,
): void => {
  const isFailureBoolean =
    outcomeSnapshot.probeStatusLiteral === 'AUTHENTICATION_REJECTED' ||
    outcomeSnapshot.probeStatusLiteral === 'UNREACHABLE_FAILURE';

  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral: outcomeSnapshot.severityLevelLiteral,
    moduleIdentifierLiteral: TRIAGE_MODULE_IDENTIFIER,
    operationCodeLiteral: outcomeSnapshot.operationCodeLiteral,
    correlationIdentifier,
    messageContentLiteral: outcomeSnapshot.statusDescriptionLiteral,
    executionLatencyInMillisecondsQuantity,
    semanticIntentTag: isFailureBoolean
      ? 'INFRASTRUCTURE_PROBE_FAILURE'
      : 'INFRASTRUCTURE_PROBE_RESULT',
    contextMetadataSnapshot: {
      httpStatusCodeNumeric,
      executionLatencyInMillisecondsQuantity,
      isSenderEmailConfiguredBoolean,
      probeStatusLiteral: outcomeSnapshot.probeStatusLiteral,
    },
  });
};

/**
 * Evalúa la respuesta HTTP de Resend y construye el snapshot forense inmutable del proveedor.
 *
 * @param incomingNetworkResponse - Respuesta HTTP cruda de `GET /domains`.
 * @param executionLatencyInMillisecondsQuantity - Latencia medida en milisegundos.
 * @param endpointTargetLiteral - URI objetivo sondeada.
 * @param hasValidSecretFormatBoolean - Indica si la clave cumple el prefijo institucional `re_`.
 * @param isSenderEmailConfiguredBoolean - Indica si `RESEND_FROM_EMAIL` posee formato válido.
 * @param correlationIdentifier - Identificador UUID único de correlación forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Veredicto sellado e inmutable.
 */
export const TriageResendProbeResponse = async (
  incomingNetworkResponse: Response,
  executionLatencyInMillisecondsQuantity: number,
  endpointTargetLiteral: string,
  hasValidSecretFormatBoolean: boolean,
  isSenderEmailConfiguredBoolean: boolean,
  correlationIdentifier: string,
): Promise<IIndividualProviderAuditSnapshot> => {
  let outcomeSnapshot: IResendTriageOutcome;

  if (incomingNetworkResponse.ok) {
    outcomeSnapshot = resolveNominalOutcomeSnapshot(executionLatencyInMillisecondsQuantity, false);
  } else {
    const resendErrorNameLiteral = await parseResendErrorNameLiteral(incomingNetworkResponse);
    const isRestrictedSendingOnlyKeyBoolean =
      incomingNetworkResponse.status === 401 &&
      resendErrorNameLiteral === RESEND_RESTRICTED_API_KEY_CODE_LITERAL;

    outcomeSnapshot = isRestrictedSendingOnlyKeyBoolean
      ? resolveNominalOutcomeSnapshot(executionLatencyInMillisecondsQuantity, true)
      : resolveRejectionOutcomeSnapshot(incomingNetworkResponse.status, resendErrorNameLiteral);
  }

  emitResendTelemetrySignalAction(
    outcomeSnapshot,
    executionLatencyInMillisecondsQuantity,
    incomingNetworkResponse.status,
    isSenderEmailConfiguredBoolean,
    correlationIdentifier,
  );

  return Object.freeze({
    providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
    probeStatusLiteral: outcomeSnapshot.probeStatusLiteral,
    executionLatencyInMillisecondsQuantity,
    statusDescriptionLiteral: outcomeSnapshot.statusDescriptionLiteral,
    endpointTargetLiteral,
    hasValidSecretFormatBoolean,
    ...(outcomeSnapshot.diagnosticErrorLiteral !== undefined && {
      diagnosticErrorLiteral: outcomeSnapshot.diagnosticErrorLiteral,
    }),
  });
};
