/**
 * @section Tools & Infrastructure - Supabase PostgREST Gateway Probe (Orchestrator)
 * @description Sonda de conectividad y salud encargada de auditar la disponibilidad,
 * validez del token 'Service Role' y latencia de respuesta del gateway REST (PostgREST)
 * de Supabase configurado en 'SUPABASE_URL' y 'SUPABASE_SERVICE_ROLE_KEY'.
 * Delega la evaluación de respuestas HTTP en un átomo especializado bajo la doctrina Source-First.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Técnica) e ISO/IEC 25010 (Confiabilidad y Rendimiento).
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

/* 2. Contratos Centralizados de Auditoría (Clean Paths - Extensionless) */
import type { IIndividualProviderAuditSnapshot } from '../schemas/CloudInfrastructureAuditReport.schema';

/* 3. Átomo Local de Evaluación HTTP (Clean Paths - Extensionless) */
import { TriageSupabaseRestResponse } from './atoms/TriageSupabaseRestResponse';

const PROBE_MODULE_IDENTIFIER = 'SUPABASE_REST_GATEWAY_PROBE_ATOM' as ModuleIdentifier;

const MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY = 5000;

const SupabaseRestCredentialsSchema = z
  .object({
    supabaseUrlLiteral: z.string().trim().min(1),
    serviceRoleKeySecret: z.string().trim().min(1),
  })
  .readonly();

/**
 * Normaliza la URL base de Supabase y compone el endpoint canónico de PostgREST.
 *
 * @param rawUrlLiteral - URL base purificada del proyecto Supabase.
 * @returns {string} Endpoint REST normalizado con sufijo '/rest/v1/'.
 */
const resolveTargetRestEndpointLiteral = (rawUrlLiteral: string): string => {
  const sanitizedBaseUrlLiteral = rawUrlLiteral.endsWith('/')
    ? rawUrlLiteral.slice(0, -1)
    : rawUrlLiteral;

  return `${sanitizedBaseUrlLiteral}/rest/v1/`;
};

/**
 * Audita activamente la autenticación y disponibilidad física del gateway REST de Supabase.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la API REST.
 */
export const AuditSupabaseRestProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  const rawSupabaseUrlCandidate = environmentMetadataSnapshot['SUPABASE_URL'];

  // 1. AUDITORÍA PRE-VUELO DE CREDENCIALES (Contrato Zod)
  const credentialsValidationResult = SupabaseRestCredentialsSchema.safeParse({
    supabaseUrlLiteral: rawSupabaseUrlCandidate,
    serviceRoleKeySecret: environmentMetadataSnapshot['SUPABASE_SERVICE_ROLE_KEY'],
  });

  if (!credentialsValidationResult.success) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'SUPABASE_REST_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral:
        'Sonda de Supabase REST omitida: Variables SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY ausentes.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    const endpointFallbackLiteral =
      typeof rawSupabaseUrlCandidate === 'string' && rawSupabaseUrlCandidate.trim() !== ''
        ? rawSupabaseUrlCandidate.trim()
        : 'URL_NO_CONFIGURADA';

    return Object.freeze({
      providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral:
        'Las credenciales SUPABASE_URL o SUPABASE_SERVICE_ROLE_KEY no están configuradas.',
      endpointTargetLiteral: endpointFallbackLiteral,
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'MISSING_SUPABASE_REST_SECRETS',
    });
  }

  const { supabaseUrlLiteral, serviceRoleKeySecret } = credentialsValidationResult.data;
  const targetRestEndpointLiteral = resolveTargetRestEndpointLiteral(supabaseUrlLiteral);
  const executionStartTimestampNumeric = performance.now();

  try {
    // 2. DESPACHO DE CONSULTA DE SONDEO (Stateless I/O)
    const incomingNetworkResponse = await fetch(targetRestEndpointLiteral, {
      method: 'GET',
      headers: {
        apikey: serviceRoleKeySecret,
        Authorization: `Bearer ${serviceRoleKeySecret}`,
        Accept: 'application/json',
      },
      signal: AbortSignal.timeout(MAXIMUM_GATEWAY_TIMEOUT_IN_MILLISECONDS_QUANTITY),
    });

    const executionLatencyInMillisecondsQuantity = Math.round(
      performance.now() - executionStartTimestampNumeric,
    );

    // 3. EVALUACIÓN SRE DE RESPUESTA (Delegación Atómica)
    return TriageSupabaseRestResponse(
      incomingNetworkResponse,
      executionLatencyInMillisecondsQuantity,
      targetRestEndpointLiteral,
      correlationIdentifier,
    );
  } catch (caughtExecutionError: unknown) {
    // 4. GESTIÓN DE COLAPSO DE RED / TIMEOUT
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
      operationCodeLiteral: 'SUPABASE_REST_NETWORK_COLLAPSE' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: `Fallo de red al conectar con Supabase REST: ${errorDescriptionLiteral}`,
      executionLatencyInMillisecondsQuantity,
      semanticIntentTag: 'INFRASTRUCTURE_NETWORK_COLLAPSE',
      contextMetadataSnapshot: {
        errorDescriptionLiteral,
        targetEndpointLiteral: targetRestEndpointLiteral,
      },
    });

    return Object.freeze({
      providerIdentifier: 'SUPABASE_REST_DATA_LAKE',
      probeStatusLiteral: 'UNREACHABLE_FAILURE',
      executionLatencyInMillisecondsQuantity,
      statusDescriptionLiteral: `Incapaz de establecer conexión con Supabase REST: ${errorDescriptionLiteral}`,
      endpointTargetLiteral: targetRestEndpointLiteral,
      hasValidSecretFormatBoolean: true,
      diagnosticErrorLiteral: errorDescriptionLiteral,
    });
  }
};
