/**
 * @section Tools & Infrastructure - Cloud Infrastructure Audit Orchestrator
 * @description Orquestador supremo encargado de ejecutar concurrentemente el enjambre
 * de sondas físicas de infraestructura (PostgreSQL, Supabase PostgREST, Supabase S3 Storage,
 * Resend Email, Google Gemini AI, Hugging Face Router y WhatsApp Meta Gateway).
 * Delega cálculos y persistencia en átomos especializados, certifica el contrato con Zod
 * y emite el reporte forense inmutable en 'reports/infrastructure/'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First & Clean Paths).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith:
 * 1. Erradicación de TS2552 mapeando explícitamente 'executionLatencyInMillisecondsQuantity: executionDurationInMillisecondsQuantity'.
 * 2. Preservación estricta de Rutas Limpias (Extensionless) para compatibilidad total con Turbopack.
 * 3. Inmutabilidad forzada y telemetría forense sincronizada con el contrato TelemetrySignalSchema.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as pathModule from 'node:path';

/* 1. Infraestructura Core de Entorno y Telemetría */
import { GatherEnvironmentMetadata } from '@floripa-dignidade/environment-validator';
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  type ModuleIdentifier,
  type OperationCode,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

/* 2. Contratos Centralizados de Auditoría (Clean Paths - Extensionless) */
import {
  CloudInfrastructureAuditReportIdentifierSchema,
  CloudInfrastructureAuditReportSchema,
  type ICloudInfrastructureAuditReport,
  type IIndividualProviderAuditSnapshot,
  type TCloudInfrastructureAuditReportIdentifier,
} from './schemas/CloudInfrastructureAuditReport.schema';

/* 3. Enjambre Atómico de Sondas de Red (Clean Paths - Extensionless) */
import { AuditPostgresDatabaseProbe } from './probes/AuditPostgresDatabaseProbe';
import { AuditSupabaseRestProbe } from './probes/AuditSupabaseRestProbe';
import { AuditSupabaseStorageS3Probe } from './probes/AuditSupabaseStorageS3Probe';
import { AuditResendEmailProbe } from './probes/AuditResendEmailProbe';
import { AuditWhatsAppMetaGatewayProbe } from './probes/AuditWhatsAppMetaGatewayProbe';

/* 4. Sub-átomos de Soporte y Lógica Pura (Swiss-Watch Swarm) */
import { AssembleCognitiveProbesQueue } from './atoms/AssembleCognitiveProbesQueue';
import { CalculateInfrastructureAuditMetrics } from './atoms/CalculateInfrastructureAuditMetrics';
import { PersistInfrastructureAuditReportToDisk } from './atoms/PersistInfrastructureAuditReportToDisk';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_MODULE_IDENTIFIER =
  'CLOUD_INFRASTRUCTURE_AUDITOR_ORCHESTRATOR' as ModuleIdentifier;

const DEFAULT_REPORT_OUTPUT_DIRECTORY_PATH_LITERAL = pathModule.join(
  process.cwd(),
  'reports',
  'infrastructure',
);

const DEFAULT_REPORT_FILE_NAME_LITERAL = 'infrastructure-secrets-audit-report.json';

/**
 * Ejecuta la auditoría integral de todos los secretos e infraestructura externa del monorepo.
 *
 * @param customOutputDirectoryPathLiteral - Ruta de almacenamiento opcional para sobreescritura en CI/CD.
 * @param correlationIdentifierFallback - Identificador de correlación para la traza forense.
 * @returns {Promise<ICloudInfrastructureAuditReport>} Reporte maestro de auditoría certificado e inmutable.
 */
export const AuditCloudInfrastructureSecrets = async (
  customOutputDirectoryPathLiteral?: string,
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<ICloudInfrastructureAuditReport> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const executionStartTimestampNumeric = performance.now();
  const auditTimestampISO = new Date().toISOString();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'EXECUTE_FULL_CLOUD_INFRASTRUCTURE_AUDIT' as OperationCode,
    correlationIdentifier,
    async (): Promise<ICloudInfrastructureAuditReport> => {
      const environmentMetadataSnapshot = GatherEnvironmentMetadata();

      // 1. ENSAMBLAJE DE LA COLA ELÁSTICA DE SONDAS DE IA
      const cognitiveProbesQueueCollection = AssembleCognitiveProbesQueue(
        environmentMetadataSnapshot,
        correlationIdentifier,
      );

      // 2. DISPACHO CONCURRENTE DEL ENJAMBRE DE SONDAS (Parallel I/O)
      const probesResultsCollection: IIndividualProviderAuditSnapshot[] = await Promise.all([
        AuditPostgresDatabaseProbe(correlationIdentifier),
        AuditSupabaseRestProbe(correlationIdentifier),
        AuditSupabaseStorageS3Probe(correlationIdentifier),
        AuditResendEmailProbe(correlationIdentifier),
        ...cognitiveProbesQueueCollection,
        AuditWhatsAppMetaGatewayProbe(correlationIdentifier),
      ]);

      const executionDurationInMillisecondsQuantity = Math.round(
        performance.now() - executionStartTimestampNumeric,
      );

      // 3. CÁLCULO ATÓMICO DE MÉTRICAS SRE
      const calculatedMetricsSnapshot =
        CalculateInfrastructureAuditMetrics(probesResultsCollection);

      const rawEnvironmentLiteral = environmentMetadataSnapshot['NODE_ENV'] ?? 'development';
      const executionEnvironmentLiteral =
        rawEnvironmentLiteral === 'production'
          ? 'production'
          : rawEnvironmentLiteral === 'test'
            ? 'test'
            : 'development';

      // 4. CONSTRUCCIÓN Y VALIDACIÓN DEL REPORTE MAESTRO (SSOT Zod)
      const validatedAuditReportSnapshot = CloudInfrastructureAuditReportSchema.parse({
        reportIdentifier: CloudInfrastructureAuditReportIdentifierSchema.parse(
          GenerateCorrelationIdentifier(),
        ) as TCloudInfrastructureAuditReportIdentifier,
        auditTimestampISO,
        executionDurationInMillisecondsQuantity,
        ...calculatedMetricsSnapshot,
        providersAuditCollection: probesResultsCollection,
        correlationIdentifier,
        executionEnvironmentLiteral,
      });

      // 5. PERSISTENCIA FÍSICA EN DISCO (Delegación Atómica)
      const targetDirectoryPathLiteral =
        customOutputDirectoryPathLiteral ?? DEFAULT_REPORT_OUTPUT_DIRECTORY_PATH_LITERAL;

      const persistedReportFilePathLiteral = await PersistInfrastructureAuditReportToDisk(
        targetDirectoryPathLiteral,
        DEFAULT_REPORT_FILE_NAME_LITERAL,
        validatedAuditReportSnapshot,
      );

      // 6. EMISIÓN DE TELEMETRÍA GLOBAL SRE (Fix TS2552)
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: calculatedMetricsSnapshot.isInfrastructureFullyOperationalBoolean
          ? 'INFO'
          : 'CRITICAL',
        moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral: 'CLOUD_INFRASTRUCTURE_AUDIT_COMPLETED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Auditoría física completada. Veredicto: [${
          calculatedMetricsSnapshot.isInfrastructureFullyOperationalBoolean
            ? '100% NOMINAL'
            : 'COMPROMETIDA'
        }]. Reporte en: ${persistedReportFilePathLiteral}`,
        executionLatencyInMillisecondsQuantity: executionDurationInMillisecondsQuantity,
        semanticIntentTag: 'INFRASTRUCTURE_AUDIT_CONSOLIDATION',
        contextMetadataSnapshot: {
          ...calculatedMetricsSnapshot,
          persistedReportFilePathLiteral,
        },
      });

      return validatedAuditReportSnapshot;
    },
  );
};
