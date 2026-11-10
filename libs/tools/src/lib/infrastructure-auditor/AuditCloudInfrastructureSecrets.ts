/**
 * @section Tools & Infrastructure - Cloud Infrastructure Audit Orchestrator
 * @description Orquestador maestro encargado de ejecutar concurrentemente el enjambre
 * de sondas físicas de infraestructura (Postgres, Supabase PostgREST, Supabase S3 Storage,
 * Resend Transactional Email, Google Gemini AI, Hugging Face Router y WhatsApp Meta Gateway).
 * Consolida los diagnósticos individuales, certifica el cumplimiento del contrato Zod
 * y persiste el reporte forense inmutable en 'reports/infrastructure/'.
 *
 * Protocolo OEDP-V18.1 - Reference Architecture (Source-First).
 * Normas: ISO/IEC 11179 (Nomenclatura Prosa), ISO/IEC 25010 (Confiabilidad) e ISO/IEC 27001 (Seguridad).
 * SANEADO Zenith: Integración de sonda para Google Gemini, despacho elástico multi-proveedor de IA
 * y erradicación de accesos directos a 'process.env' mediante GatherEnvironmentMetadata.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import * as fileSystemPromises from 'node:fs/promises';
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

/* 2. Contratos Centralizados de Auditoría */
import {
  CloudInfrastructureAuditReportIdentifierSchema,
  CloudInfrastructureAuditReportSchema,
  type ICloudInfrastructureAuditReport,
  type IIndividualProviderAuditSnapshot,
  type TCloudInfrastructureAuditReportIdentifier,
} from './schemas/CloudInfrastructureAuditReport.schema.js';

/* 3. Enjambre Atómico de Sondas de Red (Resolución ESM Estricta) */
import { AuditPostgresDatabaseProbe } from './probes/AuditPostgresDatabaseProbe.js';
import { AuditSupabaseRestProbe } from './probes/AuditSupabaseRestProbe.js';
import { AuditSupabaseStorageS3Probe } from './probes/AuditSupabaseStorageS3Probe.js';
import { AuditResendEmailProbe } from './probes/AuditResendEmailProbe.js';
import { AuditGoogleGeminiCognitiveProbe } from './probes/AuditGoogleGeminiCognitiveProbe.js';
import { AuditHuggingFaceCognitiveProbe } from './probes/AuditHuggingFaceCognitiveProbe.js';
import { AuditWhatsAppMetaGatewayProbe } from './probes/AuditWhatsAppMetaGatewayProbe.js';

/** Identificador técnico del aparato para el monitor de salud y telemetría forense. */
const ORCHESTRATOR_MODULE_IDENTIFIER =
  'CLOUD_INFRASTRUCTURE_AUDITOR_ORCHESTRATOR' as ModuleIdentifier;

/**
 * @constant DEFAULT_REPORT_OUTPUT_DIRECTORY_PATH_LITERAL
 * Subdirectorio temático canónico dentro del monorepo donde se depositan los informes JSON.
 */
const DEFAULT_REPORT_OUTPUT_DIRECTORY_PATH_LITERAL = pathModule.join(
  process.cwd(),
  'reports',
  'infrastructure',
);

/**
 * @constant DEFAULT_REPORT_FILE_NAME_LITERAL
 * Nombre estandarizado del archivo de reporte forense emitido.
 */
const DEFAULT_REPORT_FILE_NAME_LITERAL =
  'infrastructure-secrets-audit-report.json';

/**
 * Persiste físicamente en disco el reporte de auditoría garantizando la creación de directorios.
 *
 * @param outputDirectoryPathLiteral - Ruta absoluta del directorio de destino.
 * @param reportFileNameLiteral - Nombre del archivo JSON a escribir.
 * @param reportSnapshot - Datos estructurados conformes a CloudInfrastructureAuditReportSchema.
 * @returns {Promise<string>} Ruta absoluta del archivo persistido exitosamente.
 */
const PersistAuditReportToDiskAction = async (
  outputDirectoryPathLiteral: string,
  reportFileNameLiteral: string,
  reportSnapshot: ICloudInfrastructureAuditReport,
): Promise<string> => {
  const targetAbsoluteFilePathLiteral = pathModule.join(
    outputDirectoryPathLiteral,
    reportFileNameLiteral,
  );

  await fileSystemPromises.mkdir(outputDirectoryPathLiteral, {
    recursive: true,
  });

  await fileSystemPromises.writeFile(
    targetAbsoluteFilePathLiteral,
    JSON.stringify(reportSnapshot, null, 2),
    'utf-8',
  );

  return targetAbsoluteFilePathLiteral;
};

/**
 * Ejecuta la auditoría integral de todos los secretos e infraestructura externa del monorepo.
 * Lanza las sondas físicas en paralelo, computa las estadísticas de disponibilidad,
 * sella el snapshot y lo almacena en el subdirectorio de reportes.
 *
 * @param customOutputDirectoryPathLiteral - Ruta de almacenamiento opcional para sobreescritura en CI/CD.
 * @param correlationIdentifierFallback - Identificador de correlación opcional para la traza forense.
 * @returns {Promise<ICloudInfrastructureAuditReport>} Reporte maestro de auditoría certificado e inmutable.
 */
export const AuditCloudInfrastructureSecrets = async (
  customOutputDirectoryPathLiteral?: string,
  correlationIdentifierFallback: string = GenerateCorrelationIdentifier(),
): Promise<ICloudInfrastructureAuditReport> => {
  const correlationIdentifier = correlationIdentifierFallback;
  const executionStartTimestampNumeric = performance.now();
  const auditStartTimestampISO = new Date().toISOString();

  return await TraceExecutionTime(
    ORCHESTRATOR_MODULE_IDENTIFIER,
    'EXECUTE_FULL_CLOUD_INFRASTRUCTURE_AUDIT' as OperationCode,
    correlationIdentifier,
    async (): Promise<ICloudInfrastructureAuditReport> => {
      // 1. INSPECCIÓN PASIVA DE PROVEEDORES DE INTELIGENCIA ARTIFICIAL HABILITADOS
      const environmentMetadataSnapshot = GatherEnvironmentMetadata();

      const isGoogleGeminiConfiguredBoolean =
        !!environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'] &&
        environmentMetadataSnapshot['GOOGLE_GEMINI_API_KEY'].trim() !== '';

      const isHuggingFaceConfiguredBoolean =
        !!environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'] &&
        environmentMetadataSnapshot['HUGGING_FACE_API_TOKEN'].trim() !== '';

      /**
       * Despacho Elástico de Sondas de IA:
       * Si Google Gemini está configurado, se evalúa su conectividad prioritaria.
       * Si Hugging Face está presente, también se evalúa. Si ninguno está configurado,
       * se dispara la sonda de Gemini para reportar la credencial ausente.
       */
      const cognitiveProbesQueueCollection = [];

      if (isGoogleGeminiConfiguredBoolean) {
        cognitiveProbesQueueCollection.push(
          AuditGoogleGeminiCognitiveProbe(correlationIdentifier),
        );
      }

      if (isHuggingFaceConfiguredBoolean) {
        cognitiveProbesQueueCollection.push(
          AuditHuggingFaceCognitiveProbe(correlationIdentifier),
        );
      }

      if (cognitiveProbesQueueCollection.length === 0) {
        cognitiveProbesQueueCollection.push(
          AuditGoogleGeminiCognitiveProbe(correlationIdentifier),
        );
      }

      // 2. DISPACHO CONCURRENTE DEL ENJAMBRE DE SONDAS (Parallel I/O)
      const probesResultsCollection: IIndividualProviderAuditSnapshot[] =
        await Promise.all([
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

      // 3. CONSOLIDACIÓN DE MÉTRICAS SRE
      const totalTestedProvidersQuantity = probesResultsCollection.length;

      const healthyProvidersCountQuantity = probesResultsCollection.filter(
        (individualProbeSnapshot) =>
          individualProbeSnapshot.probeStatusLiteral === 'NOMINAL_OPERATIONAL',
      ).length;

      const compromisedProvidersCountQuantity = probesResultsCollection.filter(
        (individualProbeSnapshot) =>
          individualProbeSnapshot.probeStatusLiteral === 'UNREACHABLE_FAILURE' ||
          individualProbeSnapshot.probeStatusLiteral === 'AUTHENTICATION_REJECTED',
      ).length;

      const isInfrastructureFullyOperationalBoolean =
        compromisedProvidersCountQuantity === 0 &&
        probesResultsCollection.every(
          (individualProbeSnapshot) =>
            individualProbeSnapshot.probeStatusLiteral === 'NOMINAL_OPERATIONAL' ||
            individualProbeSnapshot.probeStatusLiteral === 'DEGRADED_LATENCY',
        );

      // 4. DETERMINACIÓN SEGURA DEL ENTORNO (Sin process.env Directo)
      const rawEnvironmentLiteral =
        environmentMetadataSnapshot['NODE_ENV'] ?? 'development';

      const executionEnvironmentLiteral: 'development' | 'production' | 'test' =
        rawEnvironmentLiteral === 'production'
          ? 'production'
          : rawEnvironmentLiteral === 'test'
            ? 'test'
            : 'development';

      // 5. CONSTRUCCIÓN Y VALIDACIÓN DEL REPORTE MAESTRO
      const rawReportSnapshot = Object.freeze({
        reportIdentifier:
          CloudInfrastructureAuditReportIdentifierSchema.parse(
            GenerateCorrelationIdentifier(),
          ) as TCloudInfrastructureAuditReportIdentifier,
        auditTimestampISO: auditStartTimestampISO,
        executionDurationInMillisecondsQuantity,
        isInfrastructureFullyOperationalBoolean,
        totalTestedProvidersQuantity,
        healthyProvidersCountQuantity,
        compromisedProvidersCountQuantity,
        providersAuditCollection: probesResultsCollection,
        correlationIdentifier,
        executionEnvironmentLiteral,
      });

      const validatedAuditReportSnapshot =
        CloudInfrastructureAuditReportSchema.parse(rawReportSnapshot);

      // 6. PERSISTENCIA FÍSICA EN DISCO
      const targetDirectoryPathLiteral =
        customOutputDirectoryPathLiteral ??
        DEFAULT_REPORT_OUTPUT_DIRECTORY_PATH_LITERAL;

      const persistedReportFilePathLiteral =
        await PersistAuditReportToDiskAction(
          targetDirectoryPathLiteral,
          DEFAULT_REPORT_FILE_NAME_LITERAL,
          validatedAuditReportSnapshot,
        );

      // 7. EMISIÓN DE TELEMETRÍA GLOBAL
      void EmitTelemetrySignal({
        occurrenceTimestampISO: new Date().toISOString(),
        severityLevelLiteral: isInfrastructureFullyOperationalBoolean
          ? 'INFO'
          : 'CRITICAL',
        moduleIdentifierLiteral: ORCHESTRATOR_MODULE_IDENTIFIER,
        operationCodeLiteral:
          'CLOUD_INFRASTRUCTURE_AUDIT_COMPLETED' as OperationCode,
        correlationIdentifier,
        messageContentLiteral: `Auditoría física de infraestructura completada. Veredicto: [${
          isInfrastructureFullyOperationalBoolean ? '100% NOMINAL' : 'COMPROMETIDA'
        }]. Reporte en: ${persistedReportFilePathLiteral}`,
        executionLatencyInMillisecondsQuantity:
          executionDurationInMillisecondsQuantity,
        semanticIntentTag: 'INFRASTRUCTURE_AUDIT_CONSOLIDATION',
        contextMetadataSnapshot: {
          healthyProvidersCountQuantity,
          compromisedProvidersCountQuantity,
          totalTestedProvidersQuantity,
          isInfrastructureFullyOperationalBoolean,
          persistedReportFilePathLiteral,
          testedAiProviderLiteral: isGoogleGeminiConfiguredBoolean
            ? 'GOOGLE_GEMINI'
            : 'HUGGING_FACE',
        },
      });

      return validatedAuditReportSnapshot;
    },
  );
};