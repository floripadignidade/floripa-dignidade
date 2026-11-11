/**
 * @section Tools & Infrastructure - Resend Transactional Email Probe (Atom)
 * @description Sonda de conectividad y autenticación de red encargada de verificar
 * activamente la clave de API oficial de Resend ('RESEND_API_KEY') y la dirección remitente.
 * Realiza una consulta GET autenticada a la API de dominios ('https://api.resend.com/domains').
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
 * SANEADO: Complejidad ciclomática reducida a 3 mediante resolución atómica de estatus.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
} from '@floripa-dignidade/telemetry';

import type {
  IIndividualProviderAuditSnapshot,
  TProbeExecutionStatus,
} from '../schemas/CloudInfrastructureAuditReport.schema';

const PROBE_MODULE_IDENTIFIER = 'RESEND_EMAIL_NETWORK_PROBE_ATOM' as ModuleIdentifier;

const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;
const RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL = 'https://api.resend.com/domains';

/**
 * Resuelve el estatus operacional ante respuestas HTTP exitosas evaluando la latencia SRE.
 */
const resolveResendNominalOutcome = (
  executionLatencyInMillisecondsQuantity: number,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
} => {
  const isLatencyDegradedBoolean = executionLatencyInMillisecondsQuantity > 800;

  if (isLatencyDegradedBoolean) {
    return {
      probeStatusLiteral: 'DEGRADED_LATENCY',
      statusDescriptionLiteral: `Resend API operativa con latencia elevada (${executionLatencyInMillisecondsQuantity}ms).`,
    };
  }

  return {
    probeStatusLiteral: 'NOMINAL_OPERATIONAL',
    statusDescriptionLiteral: 'Resend Transactional Email plenamente operativo y autenticado.',
  };
};

/**
 * Resuelve el estatus categórico ante códigos HTTP de error de Resend.
 */
const resolveResendErrorStatus = (
  statusCodeNumeric: number,
): {
  readonly probeStatusLiteral: TProbeExecutionStatus;
  readonly statusDescriptionLiteral: string;
} => {
  const isAuthenticationFailureBoolean = statusCodeNumeric === 401 || statusCodeNumeric === 403;

  if (isAuthenticationFailureBoolean) {
    return {
      probeStatusLiteral: 'AUTHENTICATION_REJECTED',
      statusDescriptionLiteral: `Resend API rechazó la autenticación (HTTP ${statusCodeNumeric}): RESEND_API_KEY inválida.`,
    };
  }

  return {
    probeStatusLiteral: 'UNREACHABLE_FAILURE',
    statusDescriptionLiteral: `Resend API respondió con código de error HTTP ${statusCodeNumeric}.`,
  };
};

/**
 * Extrae la descripción legible de una excepción capturada.
 */
const extractExecutionErrorMessageLiteral = (caughtExecutionError: unknown): string => {
  return caughtExecutionError instanceof Error
    ? caughtExecutionError.message
    : String(caughtExecutionError);
};

/**
 * Audita activamente las credenciales y conectividad con el servicio de correo Resend.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la sonda.
 */
export const AuditResendEmailProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();
  const rawApiKeySecret = environmentMetadataSnapshot['RESEND_API_KEY'];

  if (!rawApiKeySecret || rawApiKeySecret.trim() === '') {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'RESEND_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Resend omitida: RESEND_API_KEY no configurada en el entorno.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La variable de entorno RESEND_API_KEY no está configurada.',
      endpointTargetLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_RESEND_API_KEY',
    });
  }

  const executionStartTimestampNumeric = performance.now();

  try {
    const incomingNetworkResponse = await fetch(RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${rawApiKeySecret.trim()}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    if (incomingNetworkResponse.ok) {
      const { probeStatusLiteral, statusDescriptionLiteral } = resolveResendNominalOutcome(
        executionLatencyInMillisecondsQuantity,
      );

      return Object.freeze({
        providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
        probeStatusLiteral,
        executionLatencyInMillisecondsQuantity,
        statusDescriptionLiteral,
        endpointTargetLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
        hasValidSecretFormatBoolean: true,
      });
    }

    const { probeStatusLiteral, statusDescriptionLiteral } = resolveResendErrorStatus(
      incomingNetworkResponse.status,
    );

    return Object.freeze({
      providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
      probeStatusLiteral,
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral,
      endpointTargetLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: `HTTP_STATUS_${incomingNetworkResponse.status}`,
    });
  } catch (caughtExecutionError: unknown) {
    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );
    const errorDescriptionLiteral = extractExecutionErrorMessageLiteral(caughtExecutionError);

    return Object.freeze({
      providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de conectar con Resend API: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
