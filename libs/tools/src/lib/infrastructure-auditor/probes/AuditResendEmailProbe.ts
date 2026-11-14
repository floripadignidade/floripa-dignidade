/**
 * @section Tools & Infrastructure - Resend Transactional Email Probe (Orchestrator)
 * @description Sonda de conectividad y autenticación de red encargada de auditar
 * activamente la clave de API oficial de Resend (`RESEND_API_KEY`) y verificar el
 * formato de la dirección remitente (`RESEND_FROM_EMAIL`). Realiza una consulta GET
 * autenticada a `/domains` y delega en `TriageResendProbeResponse` la clasificación
 * SRE, incluyendo el reconocimiento nominal de claves de solo envío (`restricted_api_key`).
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { z } from 'zod';

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

/* 3. Átomo Local de Triaje HTTP */
import { TriageResendProbeResponse } from './atoms/TriageResendProbeResponse';

const PROBE_MODULE_IDENTIFIER = 'RESEND_EMAIL_NETWORK_PROBE_ATOM' as ModuleIdentifier;
const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;
const RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL = 'https://api.resend.com/domains';

const ResendApiKeyPresenceSchema = z.string().trim().min(1);
const ResendApiKeyFormatSchema = z.string().trim().startsWith('re_');
const ResendSenderEmailSchema = z.string().trim().email();

/**
 * Audita activamente las credenciales y conectividad con el servicio transaccional Resend.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la sonda.
 */
export const AuditResendEmailProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const apiKeyPresenceValidation = ResendApiKeyPresenceSchema.safeParse(
    environmentMetadataSnapshot['RESEND_API_KEY'],
  );

  if (!apiKeyPresenceValidation.success) {
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

  const sanitizedApiKeySecret = apiKeyPresenceValidation.data;
  const hasValidSecretFormatBoolean =
    ResendApiKeyFormatSchema.safeParse(sanitizedApiKeySecret).success;
  const isSenderEmailConfiguredBoolean = ResendSenderEmailSchema.safeParse(
    environmentMetadataSnapshot['RESEND_FROM_EMAIL'],
  ).success;

  const executionStartTimestampNumeric = performance.now();

  try {
    const incomingNetworkResponse = await fetch(RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL, {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${sanitizedApiKeySecret}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    return await TriageResendProbeResponse(
      incomingNetworkResponse,
      executionLatencyInMillisecondsQuantity,
      RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean,
      isSenderEmailConfiguredBoolean,
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
      operationCodeLiteral: 'RESEND_PROBE_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con Resend API: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetEndpointLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      },
    });

    return Object.freeze({
      providerIdentifier: 'RESEND_TRANSACTIONAL_EMAIL',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de conectar con Resend API: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: RESEND_API_DOMAINS_ENDPOINT_URL_LITERAL,
      hasValidSecretFormatBoolean,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
