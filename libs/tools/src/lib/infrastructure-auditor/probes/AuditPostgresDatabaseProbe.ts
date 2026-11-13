/**
 * @section Tools & Infrastructure - PostgreSQL Database Network Probe (Orchestrator)
 * @description Sonda de conectividad y salud encargada de auditar la disponibilidad,
 * formato de URI y latencia del motor relacional PostgreSQL configurado en 'DATABASE_URL'.
 * Delega el establecimiento de sockets TCP/TLS, parseo de URI y evaluación de veredicto
 * en módulos especializados bajo la doctrina Source-First (OEDP-V18.1).
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

/* 3. Átomos Especializados Locales (Clean Paths - Extensionless) */
import { ExecutePostgresSocketHandshake } from './atoms/ExecutePostgresSocketHandshake';
import { ParsePostgresConnectionTarget } from './atoms/ParsePostgresConnectionTarget';
import { ResolvePostgresProbeVerdict } from './atoms/ResolvePostgresProbeVerdict';

const PROBE_MODULE_IDENTIFIER = 'POSTGRES_DATABASE_NETWORK_PROBE_ATOM' as ModuleIdentifier;

const DatabaseConnectionStringSchema = z.string().trim().min(1);

/**
 * Audita activamente la disponibilidad y conectividad del motor relacional PostgreSQL.
 *
 * @param correlationIdentifierFallback - Identificador de correlación opcional para trazabilidad forense.
 * @returns {Promise<IIndividualProviderAuditSnapshot>} Snapshot inmutable con el diagnóstico de la base de datos.
 */
export const AuditPostgresDatabaseProbe = async (
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<IIndividualProviderAuditSnapshot> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const environmentMetadataSnapshot = GatherEnvironmentMetadata();

  // 1. AUDITORÍA PRE-VUELO DE CONFIGURACIÓN (Contrato Zod)
  const databaseUrlValidationResult = DatabaseConnectionStringSchema.safeParse(
    environmentMetadataSnapshot['DATABASE_URL'],
  );

  if (!databaseUrlValidationResult.success) {
    void EmitTelemetrySignal({
      occurrenceTimestampISO: new Date().toISOString(),
      severityLevelLiteral: 'WARNING',
      moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
      operationCodeLiteral: 'POSTGRES_PROBE_CREDENTIALS_MISSING' as OperationCode,
      correlationIdentifier,
      messageContentLiteral: 'Sonda de base de datos omitida: DATABASE_URL ausente en el entorno.',
      semanticIntentTag: 'INFRASTRUCTURE_PROBE_SKIPPED',
    });

    return Object.freeze({
      providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La variable de entorno DATABASE_URL no está configurada.',
      endpointTargetLiteral: 'UNKNOWN_HOST',
      hasValidSecretFormatBoolean: false,
      diagnosticErrorLiteral: 'DATABASE_URL_NOT_DEFINED',
    });
  }

  const sanitizedDatabaseUrlLiteral = databaseUrlValidationResult.data;

  // 2. PARSEO Y SANEAMIENTO DE DESTINO (Delegación Atómica)
  const parsedTarget = ParsePostgresConnectionTarget(sanitizedDatabaseUrlLiteral);

  if (!parsedTarget.isTargetValidBoolean) {
    return Object.freeze({
      providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
      probeStatusLiteral: 'UNCONFIGURED_CREDENTIALS',
      executionLatencyInMillisecondsQuantity: 0,
      statusDescriptionLiteral: 'La cadena DATABASE_URL posee un formato de URI inválido.',
      endpointTargetLiteral: 'MALFORMED_URI',
      hasValidSecretFormatBoolean: false,
      ...(parsedTarget.diagnosticErrorLiteral !== undefined && {
        diagnosticErrorLiteral: parsedTarget.diagnosticErrorLiteral,
      }),
    });
  }

  // 3. VERIFICACIÓN TCP/TLS DE BAJO NIVEL (Delegación Atómica)
  const { isReachableBoolean, latencyInMillisecondsQuantity, diagnosticMessageLiteral } =
    await ExecutePostgresSocketHandshake(
      parsedTarget.targetHostLiteral,
      parsedTarget.targetPortQuantity,
      parsedTarget.isSecureSocketsLayerRequiredBoolean,
    );

  // 4. RESOLUCIÓN DE VEREDICTO SRE (Delegación Atómica)
  const { finalProbeStatusLiteral, severityLevelLiteral } = ResolvePostgresProbeVerdict(
    isReachableBoolean,
    latencyInMillisecondsQuantity,
  );

  // 5. REPORTE DE TELEMETRÍA FORENSE
  void EmitTelemetrySignal({
    occurrenceTimestampISO: new Date().toISOString(),
    severityLevelLiteral,
    moduleIdentifierLiteral: PROBE_MODULE_IDENTIFIER,
    operationCodeLiteral: 'POSTGRES_PROBE_EXECUTION_COMPLETED' as OperationCode,
    correlationIdentifier,
    messageContentLiteral: `Sonda de PostgreSQL completada: [${finalProbeStatusLiteral}]. ${diagnosticMessageLiteral}`,
    executionLatencyInMillisecondsQuantity: latencyInMillisecondsQuantity,
    semanticIntentTag: 'INFRASTRUCTURE_PROBE_RESULT',
    contextMetadataSnapshot: {
      targetHostLiteral: parsedTarget.targetHostLiteral,
      targetPortQuantity: parsedTarget.targetPortQuantity,
      finalProbeStatusLiteral,
    },
  });

  return Object.freeze({
    providerIdentifier: 'DATABASE_POSTGRES_RELATIONAL',
    probeStatusLiteral: finalProbeStatusLiteral,
    executionLatencyInMillisecondsQuantity: Math.round(latencyInMillisecondsQuantity),
    statusDescriptionLiteral: diagnosticMessageLiteral,
    endpointTargetLiteral: parsedTarget.sanitizedEndpointTargetLiteral,
    hasValidSecretFormatBoolean: true,
    ...(!isReachableBoolean && {
      diagnosticErrorLiteral: diagnosticMessageLiteral,
    }),
  });
};
