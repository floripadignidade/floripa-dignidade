/**
 * @section Tools Logic - Exceptions Build Auditor (Master Orchestrator)
 * @description Escanea físicamente los directorios de salida para validar la
 * integridad de los artefactos generados por TSC y SWC. Garantiza que la
 * "Maniobra de Redirección de ADN" (Zenith) se haya materializado en el disco.
 *
 * Protocolo OEDP-V17.0 - High Performance SRE & ISO Technical Naming.
 * SANEADO Zenith: Inyección de medición de tamaño físico y rastro forense absoluto.
 *
 * @author Raz Podestá - MetaShark Tech
 * @license UNLICENSED
 */

import { promises as filesystemPromises } from 'node:fs';
import { basename, dirname, join } from 'node:path';

/* 1. Infraestructura Core (Atmos PascalCase) */
import {
  EmitTelemetrySignal,
  GenerateCorrelationIdentifier,
  TraceExecutionTime,
} from '@floripa-dignidade/telemetry';

import { InternalSystemException } from '@floripa-dignidade/exceptions';

/* 2. ADN Estructural Local (Aduana de Reporte) */
import type { IBuildArtifact, IBuildAuditReport } from './schemas/BuildAuditReport.schema';

/** Identificador técnico del aparato para el Neural Sentinel. */
const BUILD_AUDITOR_IDENTIFIER = 'EXCEPTIONS_BUILD_AUDITOR';

/**
 * Ejecuta la auditoría física de los cimientos del búnker 'exceptions'.
 * Implementa el patrón "Physical Sentry": valida la existencia y el peso de los binarios.
 *
 * @returns {Promise<void>}
 * @throws {InternalSystemException} Si el hardware deniega el acceso a las rutas.
 */
export const AuditExceptionsBuildArtifacts = async (): Promise<void> => {
  const correlationIdentifier = GenerateCorrelationIdentifier();
  const workspaceRootDirectoryPathLiteral = process.cwd();

  return await TraceExecutionTime(
    BUILD_AUDITOR_IDENTIFIER,
    'EXECUTE_PHYSICAL_ARTIFACT_AUDIT',
    correlationIdentifier,
    async () => {
      /**
       * @section Definición de Objetivos de Auditoría
       * Mapeamos las rutas donde el enjambre espera encontrar los binarios y el ADN.
       */
      const targetAuditPathsCollection = [
        {
          pathLiteral: join(workspaceRootDirectoryPathLiteral, 'dist/out-tsc/libs/core/exceptions'),
          artifactCategoryLabelLiteral: 'ADN_DECLARATION',
        },
        {
          pathLiteral: join(workspaceRootDirectoryPathLiteral, 'dist/libs/core/exceptions'),
          artifactCategoryLabelLiteral: 'LOGIC_EXECUTABLE',
        },
      ];

      const discoveredArtifactsCollection: IBuildArtifact[] = [];

      /**
       * @section Fase 1: Escaneo de Jurisdicción Física
       */
      for (const auditTarget of targetAuditPathsCollection) {
        try {
          const directoryEntriesCollection = await filesystemPromises.readdir(
            auditTarget.pathLiteral,
            {
              withFileTypes: true,
            },
          );

          for (const entry of directoryEntriesCollection) {
            if (entry.isFile()) {
              const fileAbsolutePathLiteral = join(auditTarget.pathLiteral, entry.name);

              /** 🛡️ SANEADO Zenith: Captura de metadatos de hardware (File Size). */
              const fileStatusMetadata = await filesystemPromises.stat(fileAbsolutePathLiteral);

              discoveredArtifactsCollection.push({
                fileNameLiteral: entry.name,
                fileAbsolutePathLiteral,
                fileSizeInBytesQuantity: fileStatusMetadata.size,
                artifactTypeLiteral:
                  auditTarget.artifactCategoryLabelLiteral as IBuildArtifact['artifactTypeLiteral'],
              });
            }
          }
        } catch (_caughtInputOutputError: unknown) {
          /**
           * Reportamos el fallo de acceso a telemetría pero no colapsamos el proceso
           * para permitir que otras rutas sean auditadas.
           */
          void EmitTelemetrySignal({
            severityLevelLiteral: 'WARNING',
            moduleIdentifierLiteral: BUILD_AUDITOR_IDENTIFIER,
            operationCodeLiteral: 'PHYSICAL_PATH_UNREACHABLE',
            correlationIdentifier,
            messageContentLiteral: `No se pudo acceder a la ruta de auditoría: ${auditTarget.pathLiteral}`,
          });
        }
      }

      /**
       * @section Fase 2: Consolidación de Reporte Forense
       * Sincronizado con el estándar BuildAuditReportSchema.
       */
      const isBuildNominalBoolean = discoveredArtifactsCollection.length > 0;
      const reportFilePathLiteral = join(
        workspaceRootDirectoryPathLiteral,
        'reports/exceptions-build-audit.json',
      );

      const finalAuditReportSnapshot: IBuildAuditReport = {
        auditTimestampISO: new Date().toISOString(),
        targetBunkerIdentifier: '@floripa-dignidade/exceptions',
        isBuildCompliantWithZenithStandardBoolean: isBuildNominalBoolean,
        discoveredArtifactsCollection,
        missingCriticalArtifactsCollection: isBuildNominalBoolean ? [] : ['ALL_ARTIFACTS_MISSING'],
      };

      try {
        await filesystemPromises.mkdir(dirname(reportFilePathLiteral), { recursive: true });

        await filesystemPromises.writeFile(
          reportFilePathLiteral,
          JSON.stringify(finalAuditReportSnapshot, null, 2),
          'utf-8',
        );

        // Notificación visual mínima para el auditor humano (CLI)
        console.warn(
          `[${BUILD_AUDITOR_IDENTIFIER}]: Reporte forense generado en ${basename(reportFilePathLiteral)}`,
        );
      } catch (caughtPersistenceError: unknown) {
        throw new InternalSystemException('FALLO_AL_GRABAR_REPORTE_DE_AUDITORIA', {
          originalErrorLiteral:
            caughtPersistenceError instanceof Error
              ? caughtPersistenceError.message
              : String(caughtPersistenceError),
          targetPathLiteral: reportFilePathLiteral,
        });
      }

      // REPORTE FINAL AL NEURAL SENTINEL
      void EmitTelemetrySignal({
        severityLevelLiteral: isBuildNominalBoolean ? 'INFO' : 'CRITICAL',
        moduleIdentifierLiteral: BUILD_AUDITOR_IDENTIFIER,
        operationCodeLiteral: 'BUILD_AUDIT_COMPLETED',
        correlationIdentifier,
        messageContentLiteral: 'La auditoría física de integridad de construcción ha finalizado.',
        contextMetadataSnapshot: {
          artifactsDiscoveredQuantity: discoveredArtifactsCollection.length,
          isNominalBoolean: isBuildNominalBoolean,
        },
      });
    },
  );
};
